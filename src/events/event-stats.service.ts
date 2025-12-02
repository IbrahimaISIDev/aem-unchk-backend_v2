import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThan } from 'typeorm';
import { Registration, RegistrationStatus } from './entities/registration.entity';
import { Event } from './entities/event.entity';
import { EventStatsDto, DashboardStatsDto } from './dto/event-stats.dto';

@Injectable()
export class EventStatsService {
  constructor(
    @InjectRepository(Registration)
    private readonly registrationRepo: Repository<Registration>,
    @InjectRepository(Event)
    private readonly eventRepo: Repository<Event>,
  ) {}

  /**
   * Statistiques complètes d'un événement
   */
  async getEventStats(eventId: string): Promise<EventStatsDto> {
    const event = await this.eventRepo.findOne({
      where: { id: eventId },
      relations: ['registrations'],
    });

    if (!event) {
      throw new Error('Événement introuvable');
    }

    const registrations = await this.registrationRepo.find({
      where: { eventId },
    });

    const totalRegistrations = registrations.length;
    const confirmedCount = registrations.filter(
      (r) => r.status === RegistrationStatus.CONFIRMED,
    ).length;
    const waitlistCount = registrations.filter(
      (r) => r.status === RegistrationStatus.WAITLIST,
    ).length;
    const cancelledCount = registrations.filter(
      (r) => r.status === RegistrationStatus.CANCELLED,
    ).length;
    const presentCount = registrations.filter(
      (r) => r.status === RegistrationStatus.PRESENT,
    ).length;
    const absentCount = registrations.filter(
      (r) => r.status === RegistrationStatus.ABSENT,
    ).length;

    const fillRate = event.maxParticipants
      ? (confirmedCount / event.maxParticipants) * 100
      : 0;

    const attendanceRate =
      confirmedCount > 0 ? (presentCount / confirmedCount) * 100 : 0;

    // Répartition par ENO
    const byEno: Record<string, number> = {};
    registrations.forEach((r) => {
      if (r.eno) {
        byEno[r.eno] = (byEno[r.eno] || 0) + 1;
      }
    });

    // Répartition par pôle
    const byPole: Record<string, number> = {};
    registrations.forEach((r) => {
      if (r.pole) {
        byPole[r.pole] = (byPole[r.pole] || 0) + 1;
      }
    });

    // Répartition par filière
    const byFiliere: Record<string, number> = {};
    registrations.forEach((r) => {
      if (r.filiere) {
        byFiliere[r.filiere] = (byFiliere[r.filiere] || 0) + 1;
      }
    });

    // Répartition par niveau
    const byLevel: Record<string, number> = {};
    registrations.forEach((r) => {
      if (r.level) {
        byLevel[r.level] = (byLevel[r.level] || 0) + 1;
      }
    });

    // Timeline des inscriptions (par jour)
    const registrationTimeline = await this.getRegistrationTimeline(eventId);

    return {
      eventId: event.id,
      eventTitle: event.title,
      totalRegistrations,
      confirmedCount,
      waitlistCount,
      cancelledCount,
      presentCount,
      absentCount,
      capacity: event.maxParticipants,
      availableSpots: event.availableSpots,
      fillRate: Math.round(fillRate * 100) / 100,
      attendanceRate: Math.round(attendanceRate * 100) / 100,
      byEno,
      byPole,
      byFiliere,
      byLevel,
      registrationTimeline,
    };
  }

  /**
   * Statistiques du dashboard admin
   */
  async getDashboardStats(): Promise<DashboardStatsDto> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Nombre total d'événements ce mois
    const totalEvents = await this.eventRepo.count({
      where: {
        date: Between(startOfMonth, endOfMonth),
      },
    });

    // Nombre total de participants (inscriptions confirmées)
    const totalParticipantsResult = await this.registrationRepo
      .createQueryBuilder('reg')
      .select('COUNT(*)', 'count')
      .where('reg.status = :status', { status: RegistrationStatus.CONFIRMED })
      .getRawOne();

    const totalParticipants = parseInt(totalParticipantsResult?.count || '0');

    // Taux de remplissage moyen
    const eventsWithCapacity = await this.eventRepo
      .createQueryBuilder('event')
      .select(['event.id', 'event.currentParticipants', 'event.maxParticipants'])
      .where('event.maxParticipants IS NOT NULL')
      .getMany();

    const avgFillRate =
      eventsWithCapacity.length > 0
        ? eventsWithCapacity.reduce(
            (sum, e) => sum + (e.currentParticipants / e.maxParticipants) * 100,
            0,
          ) / eventsWithCapacity.length
        : 0;

    // Taux de présence moyen (événements passés)
    const pastEvents = await this.eventRepo
      .createQueryBuilder('event')
      .where('event.date < :now', { now })
      .getMany();

    let totalConfirmed = 0;
    let totalPresent = 0;

    for (const event of pastEvents) {
      const registrations = await this.registrationRepo.find({
        where: { eventId: event.id },
      });

      const confirmed = registrations.filter(
        (r) => r.status === RegistrationStatus.CONFIRMED || r.status === RegistrationStatus.PRESENT,
      ).length;

      const present = registrations.filter(
        (r) => r.status === RegistrationStatus.PRESENT,
      ).length;

      totalConfirmed += confirmed;
      totalPresent += present;
    }

    const avgAttendanceRate =
      totalConfirmed > 0 ? (totalPresent / totalConfirmed) * 100 : 0;

    // Événements à venir (prochains 7 jours)
    const in7Days = new Date();
    in7Days.setDate(in7Days.getDate() + 7);

    const upcomingEventsRaw = await this.eventRepo
      .createQueryBuilder('event')
      .where('event.date BETWEEN :now AND :in7Days', { now, in7Days })
      .andWhere('event.status = :status', { status: 'published' })
      .orderBy('event.date', 'ASC')
      .take(5)
      .getMany();

    const upcomingEvents = upcomingEventsRaw.map((e) => ({
      id: e.id,
      title: e.title,
      date: e.date,
      registrations: e.currentParticipants,
      capacity: e.maxParticipants,
      fillRate: e.fillRate,
    }));

    // Alertes
    const alerts = await this.generateAlerts(upcomingEventsRaw);

    // Répartition par type
    const eventsByTypeRaw = await this.eventRepo
      .createQueryBuilder('event')
      .select('event.type', 'type')
      .addSelect('COUNT(*)', 'count')
      .where('event.date BETWEEN :start AND :end', {
        start: startOfMonth,
        end: endOfMonth,
      })
      .groupBy('event.type')
      .getRawMany();

    const eventsByType: Record<string, number> = {};
    eventsByTypeRaw.forEach((row) => {
      eventsByType[row.type] = parseInt(row.count);
    });

    return {
      totalEvents,
      totalParticipants,
      avgFillRate: Math.round(avgFillRate * 100) / 100,
      avgAttendanceRate: Math.round(avgAttendanceRate * 100) / 100,
      upcomingEvents,
      alerts,
      eventsByType,
    };
  }

  /**
   * Timeline des inscriptions (évolution par jour)
   */
  private async getRegistrationTimeline(
    eventId: string,
  ): Promise<Array<{ date: string; count: number }>> {
    const registrations = await this.registrationRepo.find({
      where: { eventId },
      order: { createdAt: 'ASC' },
    });

    const timelineMap = new Map<string, number>();

    registrations.forEach((reg) => {
      const dateKey = reg.createdAt.toISOString().split('T')[0];
      timelineMap.set(dateKey, (timelineMap.get(dateKey) || 0) + 1);
    });

    return Array.from(timelineMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Générer les alertes pour le dashboard
   */
  private async generateAlerts(
    events: Event[],
  ): Promise<
    Array<{
      type: 'low_registrations' | 'almost_full' | 'new_registrations';
      eventId: string;
      eventTitle: string;
      message: string;
    }>
  > {
    const alerts: any[] = [];

    for (const event of events) {
      // Alerte: peu d'inscrits (< 30% capacité à J-7)
      if (event.maxParticipants) {
        const fillRate = event.fillRate;

        if (fillRate < 30) {
          const daysUntil = Math.ceil(
            (new Date(event.date).getTime() - new Date().getTime()) /
              (1000 * 60 * 60 * 24),
          );

          if (daysUntil <= 7) {
            alerts.push({
              type: 'low_registrations',
              eventId: event.id,
              eventTitle: event.title,
              message: `Seulement ${Math.round(fillRate)}% de remplissage à J-${daysUntil}`,
            });
          }
        }

        // Alerte: bientôt plein (> 90% capacité)
        if (fillRate > 90 && fillRate < 100) {
          alerts.push({
            type: 'almost_full',
            eventId: event.id,
            eventTitle: event.title,
            message: `${event.availableSpots} places restantes`,
          });
        }
      }

      // Alerte: nouvelles inscriptions (dernières 24h)
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const recentCount = await this.registrationRepo.count({
        where: {
          eventId: event.id,
          createdAt: MoreThan(yesterday),
        },
      });

      if (recentCount > 0) {
        alerts.push({
          type: 'new_registrations',
          eventId: event.id,
          eventTitle: event.title,
          message: `${recentCount} nouvelle(s) inscription(s) dans les dernières 24h`,
        });
      }
    }

    return alerts;
  }
}
