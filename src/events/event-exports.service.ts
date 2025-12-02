import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as ExcelJS from 'exceljs';
import { Event } from './entities/event.entity';
import { Registration, RegistrationStatus } from './entities/registration.entity';
import { RegistrationsService } from './registrations.service';
import { EventStatsService } from './event-stats.service';

@Injectable()
export class EventExportsService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepo: Repository<Event>,
    private readonly registrationsService: RegistrationsService,
    private readonly statsService: EventStatsService,
  ) {}

  /**
   * Export Excel des participants
   */
  async exportToExcel(
    eventId: string,
    filters?: { status?: RegistrationStatus },
  ): Promise<Buffer> {
    const event = await this.eventRepo.findOne({ where: { id: eventId } });
    if (!event) {
      throw new NotFoundException('Événement introuvable');
    }

    const registrations = await this.registrationsService.getRegistrationsForExport(
      eventId,
      filters,
    );

    const stats = await this.statsService.getEventStats(eventId);

    // Créer le workbook
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'AEM-UNCHK';
    workbook.created = new Date();

    // Feuille 1: Statistiques
    const statsSheet = workbook.addWorksheet('Statistiques');
    this.createStatsSheet(statsSheet, event, stats);

    // Feuille 2: Participants
    const participantsSheet = workbook.addWorksheet('Participants');
    this.createParticipantsSheet(participantsSheet, registrations);

    // Retourner le buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  /**
   * Export CSV des participants
   */
  async exportToCSV(
    eventId: string,
    filters?: { status?: RegistrationStatus },
  ): Promise<string> {
    const registrations = await this.registrationsService.getRegistrationsForExport(
      eventId,
      filters,
    );

    // En-têtes CSV
    const headers = [
      'N° Inscription',
      'Nom',
      'Prénom',
      'Email',
      'Téléphone',
      'Université',
      'ENO',
      'Pôle',
      'Filière',
      'Niveau',
      'Statut',
      'Date Inscription',
      'Présent',
    ];

    // Construire les lignes
    const rows = registrations.map((r) => [
      r.registrationNumber,
      r.lastName,
      r.firstName,
      r.email,
      r.phone,
      r.university || '',
      r.eno || '',
      r.pole || '',
      r.filiere || '',
      r.level || '',
      r.status,
      new Date(r.createdAt).toLocaleDateString('fr-FR'),
      r.isPresent ? 'Oui' : 'Non',
    ]);

    // Générer le CSV
    const csvContent = [
      headers.join(','),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','),
      ),
    ].join('\n');

    return csvContent;
  }

  /**
   * Export PDF (liste participants)
   * Note: Nécessite pdfkit - implémentation simplifiée ici
   */
  async exportToPDF(
    eventId: string,
    filters?: { status?: RegistrationStatus },
  ): Promise<Buffer> {
    const event = await this.eventRepo.findOne({ where: { id: eventId } });
    if (!event) {
      throw new NotFoundException('Événement introuvable');
    }

    const registrations = await this.registrationsService.getRegistrationsForExport(
      eventId,
      filters,
    );

    // TODO: Implémenter avec pdfkit
    // Pour l'instant, retourner un buffer vide
    // const PDFDocument = require('pdfkit');
    // const doc = new PDFDocument();
    // ... génération PDF

    throw new Error('Export PDF pas encore implémenté - utilisez Excel ou CSV');
  }

  /**
   * Générer rapport post-événement (PDF)
   */
  async generateEventReport(eventId: string): Promise<Buffer> {
    const event = await this.eventRepo.findOne({ where: { id: eventId } });
    if (!event) {
      throw new NotFoundException('Événement introuvable');
    }

    const stats = await this.statsService.getEventStats(eventId);

    // TODO: Générer un beau PDF avec :
    // - Informations événement
    // - Statistiques
    // - Graphiques
    // - Liste participants

    throw new Error('Rapport PDF pas encore implémenté');
  }

  /**
   * Créer la feuille de statistiques dans Excel
   */
  private createStatsSheet(
    sheet: ExcelJS.Worksheet,
    event: Event,
    stats: any,
  ): void {
    // Titre
    sheet.mergeCells('A1:D1');
    const titleCell = sheet.getCell('A1');
    titleCell.value = `Statistiques - ${event.title}`;
    titleCell.font = { bold: true, size: 16 };
    titleCell.alignment = { horizontal: 'center' };

    // Infos événement
    sheet.addRow(['']);
    sheet.addRow(['Informations Événement']);
    sheet.addRow(['Titre', event.title]);
    sheet.addRow(['Date', new Date(event.date).toLocaleDateString('fr-FR')]);
    sheet.addRow(['Lieu', event.location || 'N/A']);
    sheet.addRow(['Type', event.type]);

    // Statistiques
    sheet.addRow(['']);
    sheet.addRow(['Statistiques Inscriptions']);
    sheet.addRow(['Total inscriptions', stats.totalRegistrations]);
    sheet.addRow(['Confirmés', stats.confirmedCount]);
    sheet.addRow(['Liste d\'attente', stats.waitlistCount]);
    sheet.addRow(['Annulés', stats.cancelledCount]);
    sheet.addRow(['Présents', stats.presentCount]);
    sheet.addRow(['Absents', stats.absentCount]);
    sheet.addRow(['Capacité', stats.capacity || 'Illimité']);
    sheet.addRow(['Places disponibles', stats.availableSpots || 'N/A']);
    sheet.addRow(['Taux de remplissage', `${stats.fillRate}%`]);
    sheet.addRow(['Taux de présence', `${stats.attendanceRate}%`]);

    // Styles
    sheet.getColumn(1).width = 30;
    sheet.getColumn(2).width = 30;
  }

  /**
   * Créer la feuille des participants dans Excel
   */
  private createParticipantsSheet(
    sheet: ExcelJS.Worksheet,
    registrations: Registration[],
  ): void {
    // En-têtes
    const headers = [
      'N° Inscription',
      'Nom',
      'Prénom',
      'Email',
      'Téléphone',
      'Université',
      'ENO',
      'Pôle',
      'Filière',
      'Niveau',
      'Statut',
      'Date Inscription',
      'Présent',
    ];

    sheet.addRow(headers);

    // Style des en-têtes
    const headerRow = sheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1a2f2a' }, // Vert AEM-UNCHK
    };
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };

    // Données
    registrations.forEach((r) => {
      sheet.addRow([
        r.registrationNumber,
        r.lastName,
        r.firstName,
        r.email,
        r.phone,
        r.university || '',
        r.eno || '',
        r.pole || '',
        r.filiere || '',
        r.level || '',
        r.status,
        new Date(r.createdAt).toLocaleDateString('fr-FR'),
        r.isPresent ? 'Oui' : 'Non',
      ]);
    });

    // Auto-fit colonnes
    sheet.columns.forEach((column) => {
      column.width = 20;
    });

    // Ajouter des filtres
    sheet.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: 1, column: headers.length },
    };

    // Couleur par statut
    sheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        const status = row.getCell(11).value as string;
        let color = 'FFFFFFFF';

        switch (status) {
          case RegistrationStatus.CONFIRMED:
            color = 'FFD4EDDA'; // Vert clair
            break;
          case RegistrationStatus.PRESENT:
            color = 'FFC3E6CB'; // Vert foncé
            break;
          case RegistrationStatus.WAITLIST:
            color = 'FFFFF3CD'; // Jaune
            break;
          case RegistrationStatus.CANCELLED:
            color = 'FFF8D7DA'; // Rouge clair
            break;
        }

        row.eachCell((cell) => {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: color },
          };
        });
      }
    });
  }
}
