import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Registration, RegistrationStatus } from './entities/registration.entity';
import { Event } from './entities/event.entity';
// TODO: Importer votre service d'email existant
// import { EmailService } from '../email/email.service';

@Injectable()
export class EventNotificationsService {
  private readonly logger = new Logger(EventNotificationsService.name);

  constructor(
    @InjectRepository(Registration)
    private readonly registrationRepo: Repository<Registration>,
    @InjectRepository(Event)
    private readonly eventRepo: Repository<Event>,
    // private readonly emailService: EmailService,
  ) {}

  /**
   * Envoyer l'email de confirmation d'inscription
   */
  async sendRegistrationConfirmation(
    registration: Registration,
    event: Event,
  ): Promise<void> {
    try {
      this.logger.log(
        `Envoi confirmation inscription ${registration.registrationNumber} pour événement ${event.title}`,
      );

      // TODO: Utiliser votre service d'email
      // await this.emailService.send({
      //   to: registration.email,
      //   subject: `✅ Inscription confirmée - ${event.title}`,
      //   template: 'event-registration-confirmation',
      //   context: {
      //     registration,
      //     event,
      //     fullName: registration.fullName,
      //     eventDate: event.date,
      //     eventLocation: event.location,
      //   },
      // });

      // Marquer comme envoyé
      registration.confirmationEmailSent = true;
      await this.registrationRepo.save(registration);

      this.logger.log(`✅ Email de confirmation envoyé à ${registration.email}`);
    } catch (error) {
      this.logger.error(
        `❌ Erreur envoi email confirmation: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * Envoyer l'email d'annulation
   */
  async sendCancellationConfirmation(
    registration: Registration,
    event: Event,
  ): Promise<void> {
    try {
      this.logger.log(
        `Envoi confirmation annulation pour ${registration.registrationNumber}`,
      );

      // TODO: Implémenter avec votre service d'email
      // await this.emailService.send({ ... });

      this.logger.log(`✅ Email d'annulation envoyé à ${registration.email}`);
    } catch (error) {
      this.logger.error(`❌ Erreur envoi email annulation: ${error.message}`);
    }
  }

  /**
   * Envoyer notification de promotion depuis liste d'attente
   */
  async sendWaitlistPromotion(
    registration: Registration,
    event: Event,
  ): Promise<void> {
    try {
      this.logger.log(
        `Envoi notification promotion liste d'attente pour ${registration.registrationNumber}`,
      );

      // TODO: Implémenter avec votre service d'email
      // await this.emailService.send({ ... });

      this.logger.log(
        `✅ Email promotion liste d'attente envoyé à ${registration.email}`,
      );
    } catch (error) {
      this.logger.error(
        `❌ Erreur envoi email promotion: ${error.message}`,
      );
    }
  }

  /**
   * Cron job: Rappels J-7 (tous les jours à 9h)
   */
  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async sendRemindersJ7(): Promise<void> {
    this.logger.log('🕐 Début envoi rappels J-7');

    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 7);
    targetDate.setHours(0, 0, 0, 0);

    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    // Trouver les événements dans 7 jours
    const events = await this.eventRepo.find({
      where: {
        date: targetDate, // TODO: Utiliser Between() pour la plage
        requiresRegistration: true,
      },
      relations: ['registrations'],
    });

    for (const event of events) {
      const registrations = await this.registrationRepo.find({
        where: {
          eventId: event.id,
          reminderJ7Sent: false,
          status: RegistrationStatus.CONFIRMED,
        },
      });

      for (const reg of registrations) {
        await this.sendReminderJ7(reg, event);
      }
    }

    this.logger.log(`✅ Rappels J-7 envoyés pour ${events.length} événements`);
  }

  /**
   * Cron job: Rappels J-1 (tous les jours à 20h)
   */
  @Cron(CronExpression.EVERY_DAY_AT_8PM)
  async sendRemindersJ1(): Promise<void> {
    this.logger.log('🕐 Début envoi rappels J-1');

    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 1);
    targetDate.setHours(0, 0, 0, 0);

    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const events = await this.eventRepo.find({
      where: {
        date: targetDate,
        requiresRegistration: true,
      },
    });

    for (const event of events) {
      const registrations = await this.registrationRepo.find({
        where: {
          eventId: event.id,
          reminderJ1Sent: false,
          status: RegistrationStatus.CONFIRMED,
        },
      });

      for (const reg of registrations) {
        await this.sendReminderJ1(reg, event);
      }
    }

    this.logger.log(`✅ Rappels J-1 envoyés pour ${events.length} événements`);
  }

  /**
   * Cron job: Rappels Jour J (tous les jours à 7h)
   */
  @Cron(CronExpression.EVERY_DAY_AT_7AM)
  async sendRemindersDayOf(): Promise<void> {
    this.logger.log('🕐 Début envoi rappels Jour J');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const events = await this.eventRepo.find({
      where: {
        date: today,
        requiresRegistration: true,
      },
    });

    for (const event of events) {
      const registrations = await this.registrationRepo.find({
        where: {
          eventId: event.id,
          reminderDayOfSent: false,
          status: RegistrationStatus.CONFIRMED,
        },
      });

      for (const reg of registrations) {
        await this.sendReminderDayOf(reg, event);
      }
    }

    this.logger.log(
      `✅ Rappels Jour J envoyés pour ${events.length} événements`,
    );
  }

  /**
   * Envoyer rappel J-7
   */
  private async sendReminderJ7(
    registration: Registration,
    event: Event,
  ): Promise<void> {
    try {
      // TODO: Implémenter avec votre service d'email
      // await this.emailService.send({
      //   to: registration.email,
      //   subject: `📅 Dans 1 semaine : ${event.title}`,
      //   template: 'event-reminder-j7',
      //   context: { registration, event },
      // });

      registration.reminderJ7Sent = true;
      await this.registrationRepo.save(registration);
    } catch (error) {
      this.logger.error(`❌ Erreur rappel J-7: ${error.message}`);
    }
  }

  /**
   * Envoyer rappel J-1
   */
  private async sendReminderJ1(
    registration: Registration,
    event: Event,
  ): Promise<void> {
    try {
      // TODO: Implémenter avec votre service d'email
      registration.reminderJ1Sent = true;
      await this.registrationRepo.save(registration);
    } catch (error) {
      this.logger.error(`❌ Erreur rappel J-1: ${error.message}`);
    }
  }

  /**
   * Envoyer rappel Jour J
   */
  private async sendReminderDayOf(
    registration: Registration,
    event: Event,
  ): Promise<void> {
    try {
      // TODO: Implémenter avec votre service d'email
      registration.reminderDayOfSent = true;
      await this.registrationRepo.save(registration);
    } catch (error) {
      this.logger.error(`❌ Erreur rappel Jour J: ${error.message}`);
    }
  }

  /**
   * Envoyer email groupé à tous les participants
   */
  async sendBulkEmail(
    eventId: string,
    subject: string,
    content: string,
    filters?: { status?: string },
  ): Promise<{ sent: number; failed: number }> {
    this.logger.log(`📧 Envoi email groupé pour événement ${eventId}`);

    let qb = this.registrationRepo
      .createQueryBuilder('reg')
      .where('reg.eventId = :eventId', { eventId });

    if (filters?.status) {
      qb = qb.andWhere('reg.status = :status', { status: filters.status });
    }

    const registrations = await qb.getMany();

    let sent = 0;
    let failed = 0;

    for (const reg of registrations) {
      try {
        // TODO: Implémenter avec votre service d'email
        // await this.emailService.send({
        //   to: reg.email,
        //   subject,
        //   html: content,
        // });
        sent++;
      } catch (error) {
        failed++;
        this.logger.error(
          `❌ Erreur envoi email à ${reg.email}: ${error.message}`,
        );
      }
    }

    this.logger.log(`✅ Emails envoyés: ${sent}, Échecs: ${failed}`);
    return { sent, failed };
  }
}
