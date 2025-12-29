import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole, UserStatus } from './entities/user.entity';
import { Activity } from '../events/entities/activity.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { AddPointsDto, UserPointsResponseDto } from './dto/user-points.dto';
import { PaginationDto, PaginationResponseDto } from '../common/dto/pagination.dto';
import { MailService } from '../email/email.service';
import { EmailTemplatesService } from '../email/email-templates.service';
import { NotificationsService } from '../notifications/notifications.service';
import { ConfigService } from '@nestjs/config';
import { NotificationType, NotificationPriority } from '../notifications/entities/notification.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Activity)
    private activitiesRepository: Repository<Activity>,
    private readonly mail: MailService,
    private readonly emailTemplates: EmailTemplatesService,
    private readonly notifications: NotificationsService,
    private readonly config: ConfigService,
  ) {}

async findAll(paginationDto: PaginationDto & any): Promise<PaginationResponseDto<User>> {
  const { page, limit, skip } = paginationDto;

  const qb = this.usersRepository
    .createQueryBuilder('user')
    .leftJoinAndSelect('user.eno', 'eno')
    .leftJoinAndSelect('user.pole', 'pole') 
    .leftJoinAndSelect('user.filiereRef', 'filiere')
    .orderBy('user.createdAt', 'DESC')
    .skip(skip)
    .take(limit);

  // Filtres existants
  const {
    search,
    nom,
    prenom,
    email,
    telephone,
    universite,
    eno_rattachement,
    role,
    status,
    createdFrom,
    createdTo,
    // Nouveaux filtres académiques
    enoId,
    poleId,
    filiereId,
    poles, // Legacy filter for backward compatibility
  } = paginationDto as any;

  if (search) {
    qb.andWhere(
      '(user.nom ILIKE :q OR user.prenom ILIKE :q OR user.email ILIKE :q OR user.telephone ILIKE :q OR user.universite ILIKE :q OR user.eno_rattachement ILIKE :q OR eno.name ILIKE :q OR pole.name ILIKE :q OR filiere.name ILIKE :q)',
      { q: `%${search}%` },
    );
  }
  if (nom) qb.andWhere('user.nom ILIKE :nom', { nom: `%${nom}%` });
  if (prenom) qb.andWhere('user.prenom ILIKE :prenom', { prenom: `%${prenom}%` });
  if (email) qb.andWhere('user.email ILIKE :email', { email: `%${email}%` });
  if (telephone) qb.andWhere('user.telephone ILIKE :telephone', { telephone: `%${telephone}%` });
  if (universite) qb.andWhere('user.universite ILIKE :universite', { universite: `%${universite}%` });
  if (eno_rattachement) qb.andWhere('user.eno_rattachement ILIKE :eno', { eno: `%${eno_rattachement}%` });
  
  // Nouveaux filtres académiques par ID
  if (enoId) qb.andWhere('user.enoId = :enoId', { enoId });
  if (poleId) qb.andWhere('user.poleId = :poleId', { poleId });
  if (filiereId) qb.andWhere('user.filiereId = :filiereId', { filiereId });
  
  // Filtre legacy par nom de pôle (pour compatibilité)
  if (poles) qb.andWhere('(user.poles ILIKE :poles OR eno.name ILIKE :poles)', { poles: `%${poles}%` });
  
  if (role) qb.andWhere('user.role = :role', { role });
  if (status) qb.andWhere('user.status = :status', { status });
  if (createdFrom && createdTo) {
    qb.andWhere('user.createdAt BETWEEN :from AND :to', { from: new Date(createdFrom), to: new Date(createdTo) });
  } else if (createdFrom) {
    qb.andWhere('user.createdAt >= :from', { from: new Date(createdFrom) });
  } else if (createdTo) {
    qb.andWhere('user.createdAt <= :to', { to: new Date(createdTo) });
  }

  const [users, total] = await qb.getManyAndCount();

  return new PaginationResponseDto(users, total, page, limit);
}

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['activities', 'media', 'notifications', 'eno', 'pole', 'filiereRef'],
    });

    if (!user) {
      throw new NotFoundException('Utilisateur introuvable');
    }

    return user;
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Vérifier si l'email existe déjà
    const existingUser = await this.usersRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Cet email est déjà utilisé');
    }

    // Vérifier si le téléphone existe déjà (si fourni)
    if (createUserDto.telephone) {
      const existingUserByPhone = await this.usersRepository.findOne({
        where: { telephone: createUserDto.telephone },
      });

      if (existingUserByPhone) {
        throw new ConflictException('Ce numéro de téléphone est déjà utilisé');
      }
    }

    const user = this.usersRepository.create({
      ...createUserDto,
      role: createUserDto.role || UserRole.MEMBER,
      status: createUserDto.status || UserStatus.PENDING,
      isActive: true,
      date_inscription: new Date(),
    });

    return this.usersRepository.save(user);
  }

  async update(id: string, updateProfileDto: UpdateProfileDto): Promise<User> {
    const user = await this.findOne(id);

    // Vérifier si l'email est déjà utilisé par un autre utilisateur
    if (updateProfileDto.email && updateProfileDto.email !== user.email) {
      const existingUser = await this.usersRepository.findOne({
        where: { email: updateProfileDto.email },
      });

      if (existingUser) {
        throw new ConflictException('Cet email est déjà utilisé');
      }
    }

    // Vérifier si le téléphone est déjà utilisé par un autre utilisateur
    if (updateProfileDto.telephone && updateProfileDto.telephone !== user.telephone) {
      const existingUserByPhone = await this.usersRepository.findOne({
        where: { telephone: updateProfileDto.telephone },
      });

      if (existingUserByPhone) {
        throw new ConflictException('Ce numéro de téléphone est déjà utilisé');
      }
    }

    Object.assign(user, updateProfileDto);
    return this.usersRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.usersRepository.softDelete(id);
  }

  async updateRole(id: string, role: UserRole, adminUserId: string): Promise<User> {
    const admin = await this.findOne(adminUserId);
    const isAdmin = admin.role === UserRole.ADMIN;
    const isSecGen = admin.role === UserRole.SEC_GENERAL;

    if (!isAdmin && !isSecGen) {
      throw new ForbiddenException('Permissions insuffisantes pour changer les rôles');
    }
    if (isSecGen && role === UserRole.ADMIN) {
      throw new ForbiddenException('Le Secrétaire Général ne peut pas attribuer le rôle ADMIN');
    }

    const user = await this.findOne(id);
    const prevRole = user.role;
    user.role = role;
    const saved = await this.usersRepository.save(user);

    console.log(`🔄 [updateRole] Changement de rôle: ${prevRole} → ${role} pour l'utilisateur ${user.email}`);

    // Notification par email et in-app sur changement de rôle
    // Envoi de notification immédiat
    await this.notifications.create({
      userId: user.id,
      title: 'Rôle mis à jour',
      message: `Votre rôle a été modifié: ${prevRole} → ${role}`,
      type: NotificationType.INFO,
      priority: NotificationPriority.NORMAL,
    });

    console.log(`📧 [updateRole] Préparation de l'envoi d'email à ${user.email}...`);

    // Envoi d'email en arrière-plan (non-bloquant)
    const fullName = `${user.nom} ${user.prenom}`;
    const template = this.emailTemplates.getRoleChangedEmail(fullName, prevRole, role);

    console.log(`📧 [updateRole] Template généré, envoi en cours...`);

    this.mail.send(user.email, template.subject, template.text, template.html)
      .then((emailResult) => {
        console.log('✅ Email de changement de rôle envoyé:', emailResult);
      }).catch((e) => {
        console.error('❌ Erreur lors de l\'envoi de l\'email de changement de rôle:', e);
      });

    return saved;
  }

  async updateStatus(id: string, status: UserStatus, adminUserId: string): Promise<User> {
    // Vérifier que l'admin a les permissions nécessaires
    const admin = await this.findOne(adminUserId);
    
    if (admin.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Seuls les administrateurs peuvent changer le statut');
    }

    const user = await this.findOne(id);
    const prevStatus = user.status;
    user.status = status;
    const saved = await this.usersRepository.save(user);

    console.log(`🔄 [updateStatus] Changement de statut: ${prevStatus} → ${status} pour l'utilisateur ${user.email}`);

    // Si activation, envoyer email à l'utilisateur + notif (en arrière-plan)
    if (prevStatus !== UserStatus.ACTIVE && status === UserStatus.ACTIVE) {
      console.log(`✅ [updateStatus] Activation détectée, préparation email d'activation...`);

      // Envoi de notification immédiat
      await this.notifications.create({
        userId: user.id,
        title: 'Compte activé',
        message: 'Votre compte a été activé. Vous pouvez maintenant vous connecter.',
        type: NotificationType.SUCCESS,
        priority: NotificationPriority.NORMAL,
      });

      // Envoi d'email en arrière-plan (non-bloquant)
      const fullName = `${user.nom} ${user.prenom}`;
      const template = this.emailTemplates.getAccountActivatedEmail(fullName);

      console.log(`📧 [updateStatus] Template d'activation généré pour ${user.email}, envoi en cours...`);

      this.mail.send(user.email, template.subject, template.text, template.html)
        .then((emailResult) => {
          console.log('✅ Email d\'activation envoyé:', emailResult);
        }).catch((e) => {
          console.error('❌ Erreur lors de l\'envoi de l\'email d\'activation:', e);
        });
    } else if (prevStatus !== status) {
      console.log(`🔄 [updateStatus] Changement de statut détecté (non-activation), préparation email...`);

      // Envoi de notification immédiat
      await this.notifications.create({
        userId: user.id,
        title: 'Statut mis à jour',
        message: `Votre statut a été modifié: ${prevStatus} → ${status}`,
        type: NotificationType.INFO,
        priority: NotificationPriority.NORMAL,
      });

      // Envoi d'email en arrière-plan (non-bloquant)
      const fullName = `${user.nom} ${user.prenom}`;
      const template = this.emailTemplates.getStatusChangedEmail(fullName, prevStatus, status);

      console.log(`📧 [updateStatus] Template de changement de statut généré pour ${user.email}, envoi en cours...`);

      this.mail.send(user.email, template.subject, template.text, template.html)
        .then((emailResult) => {
          console.log('✅ Email de changement de statut envoyé:', emailResult);
        }).catch((e) => {
          console.error('❌ Erreur lors de l\'envoi de l\'email de changement de statut:', e);
        });
    }

    return saved;
  }

  async addPoints(id: string, addPointsDto: AddPointsDto): Promise<UserPointsResponseDto> {
    const user = await this.findOne(id);
    
    user.points += addPointsDto.points;
    await this.usersRepository.save(user);

    return {
      totalPoints: user.points,
      addedPoints: addPointsDto.points,
      reason: addPointsDto.reason,
    };
  }

  async getUserPoints(id: string): Promise<UserPointsResponseDto> {
    const user = await this.findOne(id);
    
    return {
      totalPoints: user.points,
    };
  }

  async addBadge(id: string, badge: string): Promise<User> {
    const user = await this.findOne(id);
    
    if (!user.badges) {
      user.badges = [];
    }

    if (!user.badges.includes(badge)) {
      user.badges.push(badge);
      await this.usersRepository.save(user);
    }

    return user;
  }

  async removeBadge(id: string, badge: string): Promise<User> {
    const user = await this.findOne(id);
    
    if (user.badges) {
      user.badges = user.badges.filter(b => b !== badge);
      await this.usersRepository.save(user);
    }

    return user;
  }

  async getUserBadges(id: string): Promise<string[]> {
    const user = await this.findOne(id);
    return user.badges || [];
  }

  async addFavorite(id: string, itemId: string): Promise<User> {
    const user = await this.findOne(id);
    
    if (!user.favorites) {
      user.favorites = [];
    }

    if (!user.favorites.includes(itemId)) {
      user.favorites.push(itemId);
      await this.usersRepository.save(user);
    }

    return user;
  }

  async removeFavorite(id: string, itemId: string): Promise<User> {
    const user = await this.findOne(id);
    
    if (user.favorites) {
      user.favorites = user.favorites.filter(fav => fav !== itemId);
      await this.usersRepository.save(user);
    }

    return user;
  }

  async getUserFavorites(id: string): Promise<string[]> {
    const user = await this.findOne(id);
    return user.favorites || [];
  }

  async getUserActivities(id: string, paginationDto: PaginationDto): Promise<PaginationResponseDto<Activity>> {
    const { page, limit, skip } = paginationDto;

    const [activities, total] = await this.activitiesRepository.findAndCount({
      where: { participantId: id },
      skip,
      take: limit,
      order: {
        createdAt: 'DESC',
      },
      relations: ['event', 'participant'],
    });

    return new PaginationResponseDto(activities, total, page, limit);
  }

  async getStatistics(): Promise<{
    totalUsers: number;
    activeUsers: number;
    newUsersThisMonth: number;
    usersByRole: Record<string, number>;
    usersByStatus: Record<string, number>;
  }> {
    const totalUsers = await this.usersRepository.count();
    
    const activeUsers = await this.usersRepository.count({
      where: { isActive: true },
    });

    const firstDayOfMonth = new Date();
    firstDayOfMonth.setDate(1);
    firstDayOfMonth.setHours(0, 0, 0, 0);

    const newUsersThisMonth = await this.usersRepository.count({
      where: {
        createdAt: {
          $gte: firstDayOfMonth,
        } as any,
      },
    });

    // Statistiques par rôle
    const roleStats = await this.usersRepository
      .createQueryBuilder('user')
      .select('user.role', 'role')
      .addSelect('COUNT(*)', 'count')
      .groupBy('user.role')
      .getRawMany();

    const usersByRole = roleStats.reduce((acc, stat) => {
      acc[stat.role] = parseInt(stat.count);
      return acc;
    }, {});

    // Statistiques par statut
    const statusStats = await this.usersRepository
      .createQueryBuilder('user')
      .select('user.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('user.status')
      .getRawMany();

    const usersByStatus = statusStats.reduce((acc, stat) => {
      acc[stat.status] = parseInt(stat.count);
      return acc;
    }, {});

    return {
      totalUsers,
      activeUsers,
      newUsersThisMonth,
      usersByRole,
      usersByStatus,
    };
  }

  async findTrashed(paginationDto: PaginationDto & any): Promise<PaginationResponseDto<User>> {
    const { page = 1, limit = 20 } = paginationDto;
    const skip = (page - 1) * limit;
    const qb = this.usersRepository
      .createQueryBuilder('user')
      .withDeleted()
      .leftJoinAndSelect('user.eno', 'eno')
      .leftJoinAndSelect('user.pole', 'pole')
      .leftJoinAndSelect('user.filiereRef', 'filiere')
      .where('user.deletedAt IS NOT NULL')
      .orderBy('user.deletedAt', 'DESC')
      .skip(skip)
      .take(limit);

    const { search, nom, prenom, email, telephone, role, status } = paginationDto as any;

    if (search) {
      qb.andWhere(
        '(user.nom ILIKE :q OR user.prenom ILIKE :q OR user.email ILIKE :q OR user.telephone ILIKE :q)',
        { q: `%${search}%` },
      );
    }
    if (nom) qb.andWhere('user.nom ILIKE :nom', { nom: `%${nom}%` });
    if (prenom) qb.andWhere('user.prenom ILIKE :prenom', { prenom: `%${prenom}%` });
    if (email) qb.andWhere('user.email ILIKE :email', { email: `%${email}%` });
    if (telephone) qb.andWhere('user.telephone ILIKE :telephone', { telephone: `%${telephone}%` });
    if (role) qb.andWhere('user.role = :role', { role });
    if (status) qb.andWhere('user.status = :status', { status });

    const [users, total] = await qb.getManyAndCount();
    return new PaginationResponseDto(users, total, page, limit);
  }

  async restore(id: string): Promise<void> {
    await this.usersRepository.restore(id);
  }

  async purge(id: string): Promise<void> {
    await this.usersRepository.delete(id);
  }

  async exportAll(filters: any): Promise<any[]> {
    const qb = this.usersRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.eno', 'eno')
      .leftJoinAndSelect('user.pole', 'pole')
      .leftJoinAndSelect('user.filiereRef', 'filiere');

    const { search, nom, prenom, email, telephone, role, status, createdFrom, createdTo } = filters || {};

    if (search) {
      qb.andWhere(
        '(user.nom ILIKE :q OR user.prenom ILIKE :q OR user.email ILIKE :q OR user.telephone ILIKE :q OR eno.name ILIKE :q OR pole.name ILIKE :q OR filiere.name ILIKE :q)',
        { q: `%${search}%` },
      );
    }
    if (nom) qb.andWhere('user.nom ILIKE :nom', { nom: `%${nom}%` });
    if (prenom) qb.andWhere('user.prenom ILIKE :prenom', { prenom: `%${prenom}%` });
    if (email) qb.andWhere('user.email ILIKE :email', { email: `%${email}%` });
    if (telephone) qb.andWhere('user.telephone ILIKE :telephone', { telephone: `%${telephone}%` });
    if (role) qb.andWhere('user.role = :role', { role });
    if (status) qb.andWhere('user.status = :status', { status });
    if (createdFrom && createdTo) {
      qb.andWhere('user.createdAt BETWEEN :from AND :to', { from: new Date(createdFrom), to: new Date(createdTo) });
    } else if (createdFrom) {
      qb.andWhere('user.createdAt >= :from', { from: new Date(createdFrom) });
    } else if (createdTo) {
      qb.andWhere('user.createdAt <= :to', { to: new Date(createdTo) });
    }

    const users = await qb.orderBy('user.createdAt', 'DESC').getMany();
    return users.map((u) => ({
      id: u.id,
      nom: u.nom,
      prenom: u.prenom,
      email: u.email,
      telephone: u.telephone,
      role: u.role,
      status: u.status,
      createdAt: u.createdAt,
      eno: (u as any).eno?.name || u.eno_rattachement,
      pole: (u as any).pole?.name,
      filiere: (u as any).filiereRef?.name || u.filiere,
    }));
  }
}
