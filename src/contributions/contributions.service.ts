import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Between } from "typeorm";
import { MemberContribution } from "./entities/member-contribution.entity";
import { ContributionAudit, AuditAction } from "./entities/contribution-audit.entity";
import { ContributionFilterDto } from "./dto/contribution-filter.dto";
import { CreateContributionDto } from "./dto/create-contribution.dto";
import { GenerateContributionsDto } from "./dto/generate-contributions.dto";
import { MarkPaidDto } from "./dto/mark-paid.dto";
import { UsersService } from "../users/users.service";
import { MailService } from "../email/email.service";
import { EmailTemplatesService } from "../email/email-templates.service";
import { ContributionNotificationService, NotificationChannel } from "./services/notification.service";
import { ReceiptService } from "./services/receipt.service";
import { Cron } from "@nestjs/schedule";
import { User } from "../users/entities/user.entity";

@Injectable()
export class ContributionsService {
  constructor(
    @InjectRepository(MemberContribution)
    private readonly repo: Repository<MemberContribution>,
    @InjectRepository(ContributionAudit)
    private readonly auditRepo: Repository<ContributionAudit>,
    private readonly usersService: UsersService,
    private readonly mailService: MailService,
    private readonly emailTemplates: EmailTemplatesService,
    private readonly notificationService: ContributionNotificationService,
    private readonly receiptService: ReceiptService
  ) {}

  async getContributions(filterDto: ContributionFilterDto) {
    const qb = this.repo
      .createQueryBuilder("c")
      .leftJoinAndSelect("c.member", "member");

    if (filterDto.memberId)
      qb.andWhere("member.id = :memberId", { memberId: filterDto.memberId });
    if (filterDto.status)
      qb.andWhere("c.status = :status", { status: filterDto.status });
    if (filterDto.contributionType)
      qb.andWhere("c.contributionType = :type", {
        type: filterDto.contributionType,
      });
    if (filterDto.startDate)
      qb.andWhere("c.dueDate >= :start", { start: filterDto.startDate });
    if (filterDto.endDate)
      qb.andWhere("c.dueDate <= :end", { end: filterDto.endDate });

    const page = filterDto.page || 1;
    const limit = filterDto.limit || 10;
    const offset = (page - 1) * limit;

    qb.skip(offset).take(limit).orderBy("c.dueDate", "DESC");

    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async createContribution(dto: CreateContributionDto, currentUser?: User) {
    const member = await this.usersService.findOne(dto.memberId);
    const entity = this.repo.create({
      member,
      amount: dto.amount,
      dueDate: new Date(dto.dueDate),
      contributionType: dto.contributionType || "monthly",
      status: "pending",
    });
    const savedContribution = await this.repo.save(entity);

    // Créer l'audit trail
    if (currentUser) {
      await this.createAudit({
        contribution: savedContribution,
        performedBy: currentUser,
        action: AuditAction.CREATED,
        details: `Cotisation créée: ${dto.amount} FCFA, échéance: ${dto.dueDate}`,
        newValue: { amount: dto.amount, dueDate: dto.dueDate, type: dto.contributionType },
      });
    }

    return savedContribution;
  }

  async generateMonthlyContributions(dto: GenerateContributionsDto) {
    // Récupérer tous les utilisateurs actifs
    const allUsers = await this.usersService.findAllActive();

    if (!allUsers || allUsers.length === 0) {
      return {
        success: false,
        message: "Aucun membre actif trouvé",
        generated: 0,
        skipped: 0,
      };
    }

    // Déterminer la date d'échéance selon le type
    let dueDate: Date;
    const today = new Date();

    if (dto.dueDate) {
      dueDate = new Date(dto.dueDate);
    } else {
      // Calculer la date d'échéance selon le type
      dueDate = new Date(today);

      switch (dto.contributionType) {
        case 'monthly':
          // Échéance: dernier jour du mois courant
          dueDate.setMonth(dueDate.getMonth() + 1, 0);
          break;
        case 'quarterly':
          // Échéance: fin du trimestre (3 mois)
          dueDate.setMonth(dueDate.getMonth() + 3, 0);
          break;
        case 'annual':
          // Échéance: fin de l'année
          dueDate = new Date(dueDate.getFullYear(), 11, 31);
          break;
      }
    }

    // Normaliser à minuit
    dueDate.setHours(0, 0, 0, 0);

    let generated = 0;
    let skipped = 0;

    // Générer les contributions pour chaque membre
    for (const user of allUsers) {
      // Vérifier si une contribution existe déjà pour ce membre à cette période
      const existingContribution = await this.repo.findOne({
        where: {
          member: { id: user.id },
          contributionType: dto.contributionType,
          dueDate: dueDate,
        },
      });

      if (existingContribution) {
        skipped++;
        continue;
      }

      // Créer la nouvelle contribution
      const contribution = this.repo.create({
        member: user,
        amount: dto.defaultAmount || 5000, // Montant par défaut: 5000 FCFA
        dueDate: dueDate,
        contributionType: dto.contributionType,
        status: 'pending',
      });

      await this.repo.save(contribution);
      generated++;
    }

    return {
      success: true,
      message: `${generated} contribution(s) générée(s) avec succès`,
      generated,
      skipped,
      totalMembers: allUsers.length,
      dueDate: dueDate.toISOString(),
    };
  }

  async markContributionAsPaid(id: string, payment: MarkPaidDto, currentUser?: User) {
    // Récupérer l'ancienne valeur avant modification
    const oldContribution = await this.repo.findOne({
      where: { id },
      relations: ['member'],
    });

    await this.repo.update(id, {
      status: "paid",
      paidDate: new Date(payment.paidDate),
      transactionId: payment.transactionId,
    });

    const updatedContribution = await this.repo.findOne({
      where: { id },
      relations: ['member'],
    });

    // Créer l'audit trail
    if (currentUser && updatedContribution) {
      await this.createAudit({
        contribution: updatedContribution,
        performedBy: currentUser,
        action: AuditAction.MARKED_PAID,
        details: `Cotisation marquée comme payée. Transaction ID: ${payment.transactionId || 'N/A'}`,
        oldValue: { status: oldContribution?.status, paidDate: oldContribution?.paidDate },
        newValue: { status: 'paid', paidDate: payment.paidDate, transactionId: payment.transactionId },
      });

      // Envoyer une confirmation de paiement au membre
      if (updatedContribution.member) {
        const fullName = `${updatedContribution.member.nom} ${updatedContribution.member.prenom}`;

        try {
          await this.notificationService.sendPaymentConfirmation(
            {
              name: fullName,
              email: updatedContribution.member.email,
              phone: updatedContribution.member.telephone,
            },
            updatedContribution.amount,
            new Date(payment.paidDate).toLocaleDateString("fr-FR"),
          );

          console.log(`✅ Confirmation de paiement envoyée à ${fullName}`);
        } catch (error) {
          console.error(`❌ Erreur lors de l'envoi de la confirmation à ${fullName}:`, error);
        }
      }
    }

    return updatedContribution;
  }

  async getOverdueContributions() {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normaliser à minuit pour comparaison correcte

    return this.repo
      .createQueryBuilder("c")
      .leftJoinAndSelect("c.member", "member")
      .where("c.status = :status", { status: "pending" })
      .andWhere("c.dueDate < :today", { today })
      .orderBy("c.dueDate", "ASC")
      .getMany();
  }

  async sendContributionReminders(dto: { daysBeforeDue?: number; channel?: NotificationChannel }) {
    const daysBefore = dto.daysBeforeDue || 7;
    const channel = dto.channel || NotificationChannel.BOTH;
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + daysBefore);

    // Find pending contributions due within the next X days
    const contributions = await this.repo.find({
      where: {
        status: "pending" as any,
        dueDate: Between(today, futureDate) as any,
      },
      relations: ["member"],
    });

    console.log(`📨 Envoi de ${contributions.length} rappel(s) via ${channel}...`);

    // Envoi des notifications en parallèle via le nouveau service
    const notificationPromises = contributions
      .filter(c => c.member?.email || c.member?.telephone)
      .map(async contribution => {
        const fullName = `${contribution.member.nom} ${contribution.member.prenom}`;

        try {
          const results = await this.notificationService.sendReminder(
            {
              name: fullName,
              email: contribution.member.email,
              phone: contribution.member.telephone,
            },
            contribution.amount,
            contribution.dueDate.toLocaleDateString("fr-FR"),
            channel,
          );

          // Créer un audit pour chaque notification envoyée
          const successfulChannels = results.filter(r => r.success);
          if (successfulChannels.length > 0) {
            await this.createAudit({
              contribution: contribution,
              performedBy: contribution.member, // Système envoie au membre
              action: AuditAction.REMINDER_SENT,
              details: `Rappel envoyé via ${successfulChannels.map(r => r.channel).join(', ')}`,
              newValue: { channels: successfulChannels, dueDate: contribution.dueDate },
            });
          }

          return successfulChannels.length > 0 ? 1 : 0;
        } catch (error) {
          console.error(`❌ Erreur lors de l'envoi du rappel pour ${fullName}:`, error);
          return 0;
        }
      });

    // Attendre tous les envois en parallèle
    const results = await Promise.all(notificationPromises);
    const sentCount = results.reduce((sum, val) => sum + val, 0);

    return {
      success: true,
      sentNotifications: sentCount,
      totalFound: contributions.length,
      channel,
    };
  }

  /**
   * Envoyer un rappel manuel pour une cotisation spécifique
   */
  async sendIndividualReminder(contributionId: string, channel: NotificationChannel = NotificationChannel.BOTH, currentUser?: User) {
    const contribution = await this.repo.findOne({
      where: { id: contributionId },
      relations: ['member'],
    });

    if (!contribution) {
      throw new Error('Contribution not found');
    }

    if (!contribution.member) {
      throw new Error('Member information not found');
    }

    if (contribution.status === 'paid') {
      return {
        success: false,
        message: 'Cannot send reminder for already paid contribution',
      };
    }

    const fullName = `${contribution.member.nom} ${contribution.member.prenom}`;

    console.log(`📨 Envoi manuel de rappel pour ${fullName} via ${channel}...`);

    try {
      const results = await this.notificationService.sendReminder(
        {
          name: fullName,
          email: contribution.member.email,
          phone: contribution.member.telephone,
        },
        contribution.amount,
        contribution.dueDate.toLocaleDateString("fr-FR"),
        channel,
      );

      const successfulChannels = results.filter(r => r.success);

      // Créer un audit
      if (successfulChannels.length > 0 && currentUser) {
        await this.createAudit({
          contribution: contribution,
          performedBy: currentUser,
          action: AuditAction.REMINDER_SENT,
          details: `Rappel manuel envoyé via ${successfulChannels.map(r => r.channel).join(', ')}`,
          newValue: { channels: successfulChannels, sentBy: currentUser.email },
        });
      }

      return {
        success: successfulChannels.length > 0,
        message: successfulChannels.length > 0
          ? `Rappel envoyé avec succès via ${successfulChannels.map(r => r.channel).join(', ')}`
          : 'Échec de l\'envoi du rappel',
        channels: successfulChannels,
        contribution: {
          id: contribution.id,
          member: fullName,
          amount: contribution.amount,
          dueDate: contribution.dueDate,
        },
      };
    } catch (error) {
      console.error(`❌ Erreur lors de l'envoi du rappel manuel:`, error);
      return {
        success: false,
        message: `Erreur: ${error.message}`,
      };
    }
  }

  /**
   * Envoyer des rappels manuels en masse pour plusieurs cotisations
   */
  async sendBulkReminders(contributionIds: string[], channel: NotificationChannel = NotificationChannel.BOTH, currentUser?: User) {
    console.log(`📨 Envoi de ${contributionIds.length} rappels manuels en masse...`);

    const contributions = await this.repo.find({
      where: contributionIds.map(id => ({ id })),
      relations: ['member'],
    });

    if (contributions.length === 0) {
      return {
        success: false,
        message: 'Aucune contribution trouvée',
        sent: 0,
        failed: 0,
        total: 0,
      };
    }

    const results = await Promise.all(
      contributions
        .filter(c => c.member && c.status !== 'paid')
        .map(async contribution => {
          const fullName = `${contribution.member.nom} ${contribution.member.prenom}`;

          try {
            const notifResults = await this.notificationService.sendReminder(
              {
                name: fullName,
                email: contribution.member.email,
                phone: contribution.member.telephone,
              },
              contribution.amount,
              contribution.dueDate.toLocaleDateString("fr-FR"),
              channel,
            );

            const successfulChannels = notifResults.filter(r => r.success);

            // Créer un audit
            if (successfulChannels.length > 0 && currentUser) {
              await this.createAudit({
                contribution: contribution,
                performedBy: currentUser,
                action: AuditAction.REMINDER_SENT,
                details: `Rappel manuel en masse via ${successfulChannels.map(r => r.channel).join(', ')}`,
                newValue: { channels: successfulChannels, sentBy: currentUser.email },
              });
            }

            return successfulChannels.length > 0 ? 1 : 0;
          } catch (error) {
            console.error(`❌ Erreur pour ${fullName}:`, error);
            return 0;
          }
        })
    );

    const sent = results.reduce((sum, val) => sum + val, 0);
    const failed = results.length - sent;

    return {
      success: true,
      message: `${sent} rappel(s) envoyé(s) avec succès sur ${contributions.length}`,
      sent,
      failed,
      total: contributions.length,
      channel,
    };
  }

  /**
   * Tâche CRON: Envoi automatique des rappels une fois par mois
   * S'exécute le 1er de chaque mois à 8h du matin
   */
  @Cron("0 8 1 * *")
  async autoSendMonthlyReminders() {
    console.log("🔔 Exécution de l'envoi automatique mensuel des rappels de cotisation...");
    const result = await this.sendContributionReminders({ daysBeforeDue: 7 });
    console.log("✅ Rappels envoyés:", result);
    return result;
  }

  /**
   * Créer un enregistrement d'audit pour traçabilité
   */
  private async createAudit(data: {
    contribution: MemberContribution;
    performedBy: User;
    action: AuditAction;
    details?: string;
    oldValue?: any;
    newValue?: any;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<ContributionAudit> {
    const audit = this.auditRepo.create({
      contribution: data.contribution,
      performedBy: data.performedBy,
      action: data.action,
      details: data.details,
      oldValue: data.oldValue,
      newValue: data.newValue,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
    });

    return this.auditRepo.save(audit);
  }

  /**
   * Récupérer l'historique d'audit d'une contribution
   */
  async getContributionAuditHistory(contributionId: string): Promise<ContributionAudit[]> {
    return this.auditRepo.find({
      where: { contribution: { id: contributionId } },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Générer un reçu PDF pour une contribution payée
   */
  async generateReceipt(contributionId: string): Promise<{ buffer: Buffer; filename: string }> {
    const contribution = await this.repo.findOne({
      where: { id: contributionId },
      relations: ['member'],
    });

    if (!contribution) {
      throw new Error('Contribution not found');
    }

    if (contribution.status !== 'paid') {
      throw new Error('Cannot generate receipt for unpaid contribution');
    }

    const buffer = await this.receiptService.generateReceipt(contribution);
    const filename = this.receiptService.generateReceiptFilename(contribution);

    return { buffer, filename };
  }
}
