import { ApiProperty } from '@nestjs/swagger';

export class EventStatsDto {
  @ApiProperty({ description: 'ID de l\'événement' })
  eventId: string;

  @ApiProperty({ description: 'Titre de l\'événement' })
  eventTitle: string;

  @ApiProperty({ description: 'Nombre total d\'inscriptions' })
  totalRegistrations: number;

  @ApiProperty({ description: 'Inscriptions confirmées' })
  confirmedCount: number;

  @ApiProperty({ description: 'En liste d\'attente' })
  waitlistCount: number;

  @ApiProperty({ description: 'Annulées' })
  cancelledCount: number;

  @ApiProperty({ description: 'Présents' })
  presentCount: number;

  @ApiProperty({ description: 'Absents' })
  absentCount: number;

  @ApiProperty({ description: 'Capacité maximale' })
  capacity: number | null;

  @ApiProperty({ description: 'Places disponibles' })
  availableSpots: number | null;

  @ApiProperty({ description: 'Taux de remplissage (%)' })
  fillRate: number;

  @ApiProperty({ description: 'Taux de présence (%)' })
  attendanceRate: number;

  @ApiProperty({ description: 'Répartition par ENO' })
  byEno: Record<string, number>;

  @ApiProperty({ description: 'Répartition par pôle' })
  byPole: Record<string, number>;

  @ApiProperty({ description: 'Répartition par filière' })
  byFiliere: Record<string, number>;

  @ApiProperty({ description: 'Répartition par niveau' })
  byLevel: Record<string, number>;

  @ApiProperty({ description: 'Évolution des inscriptions par jour' })
  registrationTimeline: Array<{ date: string; count: number }>;
}

export class DashboardStatsDto {
  @ApiProperty({ description: 'Nombre total d\'événements ce mois' })
  totalEvents: number;

  @ApiProperty({ description: 'Nombre total de participants' })
  totalParticipants: number;

  @ApiProperty({ description: 'Taux de remplissage moyen (%)' })
  avgFillRate: number;

  @ApiProperty({ description: 'Taux de présence moyen (%)' })
  avgAttendanceRate: number;

  @ApiProperty({ description: 'Événements à venir (prochains 7 jours)' })
  upcomingEvents: Array<{
    id: string;
    title: string;
    date: Date;
    registrations: number;
    capacity: number | null;
    fillRate: number;
  }>;

  @ApiProperty({ description: 'Alertes' })
  alerts: Array<{
    type: 'low_registrations' | 'almost_full' | 'new_registrations';
    eventId: string;
    eventTitle: string;
    message: string;
  }>;

  @ApiProperty({ description: 'Répartition par type d\'événement' })
  eventsByType: Record<string, number>;
}
