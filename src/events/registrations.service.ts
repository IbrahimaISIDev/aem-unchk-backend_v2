import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, LessThan } from 'typeorm';
import { Registration, RegistrationStatus } from './entities/registration.entity';
import { Event, EventStatus } from './entities/event.entity';
import { User } from '../users/entities/user.entity';
import { RegisterEventDto } from './dto/register-event.dto';
import { EventNotificationsService } from './event-notifications.service';

@Injectable()
export class RegistrationsService {
  constructor(
    @InjectRepository(Registration)
    private readonly registrationRepo: Repository<Registration>,
    @InjectRepository(Event)
    private readonly eventRepo: Repository<Event>,
    private readonly notificationsService: EventNotificationsService,
  ) {}

  /**
   * Créer une nouvelle inscription
   */
  async register(
    eventId: string,
    dto: RegisterEventDto,
    user?: User,
  ): Promise<Registration> {
    // Vérifier que l'événement existe
    const event = await this.eventRepo.findOne({
      where: { id: eventId },
      relations: ['details'],
    });

    if (!event) {
      throw new NotFoundException('Événement introuvable');
    }

    // Vérifications
    this.validateEventRegistration(event);

    // Vérifier les doublons (même email pour cet événement)
    const existing = await this.registrationRepo.findOne({
      where: { eventId, email: dto.email },
    });

    if (existing) {
      throw new ConflictException('Vous êtes déjà inscrit à cet événement');
    }

    // Vérifier la disponibilité
    const availableSpots = event.availableSpots;
    const shouldWaitlist =
      event.maxParticipants &&
      event.currentParticipants >= event.maxParticipants;

    // Générer le numéro d'inscription
    const registrationNumber = await this.generateRegistrationNumber(event);

    // Créer l'inscription
    const registration = this.registrationRepo.create({
      eventId,
      userId: user?.id || null,
      registrationNumber,
      ...dto,
      status: shouldWaitlist
        ? RegistrationStatus.WAITLIST
        : RegistrationStatus.CONFIRMED,
    });

    const saved = await this.registrationRepo.save(registration);

    // Mettre à jour le compteur de participants
    if (!shouldWaitlist) {
      await this.eventRepo.increment(
        { id: eventId },
        'currentParticipants',
        1,
      );
    }

    // Envoyer l'email de confirmation
    await this.notificationsService.sendRegistrationConfirmation(
      saved,
      event,
    );

    return saved;
  }

  /**
   * Récupérer une inscription par ID
   */
  async findOne(id: string): Promise<Registration> {
    const registration = await this.registrationRepo.findOne({
      where: { id },
      relations: ['event', 'user'],
    });

    if (!registration) {
      throw new NotFoundException('Inscription introuvable');
    }

    return registration;
  }

  /**
   * Récupérer toutes les inscriptions d'un événement
   */
  async findByEvent(
    eventId: string,
    page = 1,
    limit = 50,
    filters?: { status?: RegistrationStatus; search?: string },
  ): Promise<any> {
    const skip = (page - 1) * limit;

    let qb = this.registrationRepo
      .createQueryBuilder('reg')
      .where('reg.eventId = :eventId', { eventId })
      .leftJoinAndSelect('reg.user', 'user')
      .leftJoinAndSelect('reg.event', 'event');

    if (filters?.status) {
      qb = qb.andWhere('reg.status = :status', { status: filters.status });
    }

    if (filters?.search) {
      qb = qb.andWhere(
        '(reg.firstName ILIKE :q OR reg.lastName ILIKE :q OR reg.email ILIKE :q OR reg.phone ILIKE :q)',
        { q: `%${filters.search}%` },
      );
    }

    const [data, total] = await qb
      .orderBy('reg.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      data: data.map(reg => this.transformRegistration(reg)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Transformer une registration en objet avec les getters calculés
   */
  private transformRegistration(registration: Registration) {
    return {
      ...registration,
      checkedIn: registration.isPresent,
      isPresent: registration.isPresent,
      isCancelled: registration.isCancelled,
      isConfirmed: registration.isConfirmed,
      fullName: registration.fullName,
    };
  }

  /**
   * Récupérer les inscriptions d'un utilisateur
   */
  async findByUser(userId: string, page = 1, limit = 20): Promise<any> {
    const skip = (page - 1) * limit;

    const [data, total] = await this.registrationRepo.findAndCount({
      where: { userId },
      relations: ['event'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      data: data.map(reg => this.transformRegistration(reg)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Check-in manuel d'un participant
   */
  async checkIn(id: string, checkedInBy: User): Promise<Registration> {
    const registration = await this.findOne(id);

    if (registration.status === RegistrationStatus.CANCELLED) {
      throw new BadRequestException('Cette inscription a été annulée');
    }

    if (registration.isPresent) {
      throw new BadRequestException('Participant déjà pointé');
    }

    registration.status = RegistrationStatus.PRESENT;
    registration.checkedInAt = new Date();
    registration.checkedInBy = checkedInBy.id;

    const saved = await this.registrationRepo.save(registration);
    return this.transformRegistration(saved) as any;
  }

  /**
   * Annuler une inscription
   */
  async cancel(
    id: string,
    reason?: string,
    cancelledBy?: User,
  ): Promise<Registration> {
    const registration = await this.findOne(id);

    if (registration.isCancelled) {
      throw new BadRequestException('Cette inscription est déjà annulée');
    }

    // Vérifier si l'annulation est autorisée
    const event = registration.event;
    if (event.details?.allowCancellation === false) {
      throw new BadRequestException('Les annulations ne sont pas autorisées pour cet événement');
    }

    // Vérifier le délai d'annulation
    if (event.details?.cancellationDeadlineHours) {
      const deadline = new Date(event.date);
      deadline.setHours(
        deadline.getHours() - event.details.cancellationDeadlineHours,
      );

      if (new Date() > deadline) {
        throw new BadRequestException('Le délai d\'annulation est dépassé');
      }
    }

    // Sauvegarder le statut avant de le changer
    const wasConfirmed = registration.status === RegistrationStatus.CONFIRMED;

    registration.status = RegistrationStatus.CANCELLED;
    registration.cancelledAt = new Date();
    registration.cancellationReason = reason;

    const saved = await this.registrationRepo.save(registration);

    // Décrémenter le compteur de participants si l'inscription était confirmée
    if (wasConfirmed) {
      await this.eventRepo.decrement({ id: event.id }, 'currentParticipants', 1);
    }

    // Envoyer email d'annulation
    await this.notificationsService.sendCancellationConfirmation(
      saved,
      event,
    );

    // Notifier le prochain sur la liste d'attente
    await this.notifyNextInWaitlist(event.id);

    return saved;
  }

  /**
   * Générer un numéro d'inscription unique
   */
  private async generateRegistrationNumber(event: Event): Promise<string> {
    const year = new Date().getFullYear();
    const eventCode = event.title
      .substring(0, 3)
      .toUpperCase()
      .replace(/[^A-Z]/g, '');

    // Compter les inscriptions existantes pour cet événement
    const count = await this.registrationRepo.count({
      where: { eventId: event.id },
    });

    const sequence = String(count + 1).padStart(6, '0');
    return `AEM-${year}-${eventCode}-${sequence}`;
  }

  /**
   * Valider qu'un événement accepte les inscriptions
   */
  private validateEventRegistration(event: Event): void {
    if (!event.requiresRegistration) {
      throw new BadRequestException('Cet événement ne nécessite pas d\'inscription');
    }

    if (event.status === EventStatus.CANCELLED) {
      throw new BadRequestException('Cet événement a été annulé');
    }

    if (event.status === EventStatus.COMPLETED) {
      throw new BadRequestException('Cet événement est terminé');
    }

    // Vérifier les dates d'ouverture/fermeture des inscriptions
    const now = new Date();

    if (event.details?.registrationOpenDate) {
      if (now < new Date(event.details.registrationOpenDate)) {
        throw new BadRequestException('Les inscriptions ne sont pas encore ouvertes');
      }
    }

    if (event.details?.registrationCloseDate) {
      if (now > new Date(event.details.registrationCloseDate)) {
        throw new BadRequestException('Les inscriptions sont fermées');
      }
    }
  }

  /**
   * Notifier le prochain sur la liste d'attente
   */
  private async notifyNextInWaitlist(eventId: string): Promise<void> {
    const event = await this.eventRepo.findOne({ where: { id: eventId } });
    if (!event || !event.availableSpots || event.availableSpots <= 0) {
      return;
    }

    const nextInLine = await this.registrationRepo.findOne({
      where: {
        eventId,
        status: RegistrationStatus.WAITLIST,
      },
      order: { createdAt: 'ASC' },
    });

    if (nextInLine) {
      nextInLine.status = RegistrationStatus.CONFIRMED;
      await this.registrationRepo.save(nextInLine);
      await this.eventRepo.increment({ id: eventId }, 'currentParticipants', 1);

      // Envoyer notification
      await this.notificationsService.sendWaitlistPromotion(
        nextInLine,
        event,
      );
    }
  }

  /**
   * Exporter les inscriptions (pour le service d'export)
   */
  async getRegistrationsForExport(
    eventId: string,
    filters?: { status?: RegistrationStatus },
  ): Promise<Registration[]> {
    let qb = this.registrationRepo
      .createQueryBuilder('reg')
      .where('reg.eventId = :eventId', { eventId })
      .leftJoinAndSelect('reg.user', 'user')
      .leftJoinAndSelect('reg.event', 'event');

    if (filters?.status) {
      qb = qb.andWhere('reg.status = :status', { status: filters.status });
    }

    return qb.orderBy('reg.createdAt', 'ASC').getMany();
  }
}
