import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { MemberContribution } from '../entities/member-contribution.entity';
import * as ExcelJS from 'exceljs';
import * as PDFDocument from 'pdfkit';

export interface ReportFilters {
  startDate?: Date;
  endDate?: Date;
  status?: 'pending' | 'paid' | 'overdue';
  contributionType?: 'monthly' | 'quarterly' | 'annual';
}

export interface ContributionStats {
  totalContributions: number;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  overdueAmount: number;
  paidCount: number;
  pendingCount: number;
  overdueCount: number;
  collectionRate: number;
}

@Injectable()
export class ContributionReportsService {
  constructor(
    @InjectRepository(MemberContribution)
    private readonly repo: Repository<MemberContribution>,
  ) {}

  /**
   * Générer des statistiques sur les contributions
   */
  async getContributionStats(filters: ReportFilters): Promise<ContributionStats> {
    const qb = this.repo.createQueryBuilder('c');

    if (filters.startDate) {
      qb.andWhere('c.dueDate >= :startDate', { startDate: filters.startDate });
    }

    if (filters.endDate) {
      qb.andWhere('c.dueDate <= :endDate', { endDate: filters.endDate });
    }

    if (filters.status) {
      qb.andWhere('c.status = :status', { status: filters.status });
    }

    if (filters.contributionType) {
      qb.andWhere('c.contributionType = :type', { type: filters.contributionType });
    }

    const contributions = await qb.getMany();

    const stats: ContributionStats = {
      totalContributions: contributions.length,
      totalAmount: 0,
      paidAmount: 0,
      pendingAmount: 0,
      overdueAmount: 0,
      paidCount: 0,
      pendingCount: 0,
      overdueCount: 0,
      collectionRate: 0,
    };

    contributions.forEach(c => {
      const amount = Number(c.amount);
      stats.totalAmount += amount;

      switch (c.status) {
        case 'paid':
          stats.paidAmount += amount;
          stats.paidCount++;
          break;
        case 'pending':
          stats.pendingAmount += amount;
          stats.pendingCount++;
          break;
        case 'overdue':
          stats.overdueAmount += amount;
          stats.overdueCount++;
          break;
      }
    });

    stats.collectionRate = stats.totalAmount > 0
      ? Math.round((stats.paidAmount / stats.totalAmount) * 100)
      : 0;

    return stats;
  }

  /**
   * Exporter les contributions en Excel
   */
  async exportToExcel(filters: ReportFilters): Promise<Buffer> {
    const contributions = await this.getContributionsForReport(filters);
    const stats = await this.getContributionStats(filters);

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'UNCHK';
    workbook.created = new Date();

    // Feuille de statistiques
    const statsSheet = workbook.addWorksheet('Statistiques');

    statsSheet.columns = [
      { header: 'Indicateur', key: 'indicator', width: 30 },
      { header: 'Valeur', key: 'value', width: 20 },
    ];

    // Style du header
    statsSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    statsSheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF2C5282' },
    };

    // Ajouter les stats
    statsSheet.addRows([
      { indicator: 'Nombre total de cotisations', value: stats.totalContributions },
      { indicator: 'Montant total attendu', value: `${stats.totalAmount} FCFA` },
      { indicator: 'Montant payé', value: `${stats.paidAmount} FCFA` },
      { indicator: 'Montant en attente', value: `${stats.pendingAmount} FCFA` },
      { indicator: 'Montant en retard', value: `${stats.overdueAmount} FCFA` },
      { indicator: 'Cotisations payées', value: stats.paidCount },
      { indicator: 'Cotisations en attente', value: stats.pendingCount },
      { indicator: 'Cotisations en retard', value: stats.overdueCount },
      { indicator: 'Taux de collecte', value: `${stats.collectionRate}%` },
    ]);

    // Feuille des contributions détaillées
    const dataSheet = workbook.addWorksheet('Contributions');

    dataSheet.columns = [
      { header: 'ID', key: 'id', width: 15 },
      { header: 'Membre', key: 'member', width: 30 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Téléphone', key: 'phone', width: 15 },
      { header: 'Montant', key: 'amount', width: 15 },
      { header: 'Type', key: 'type', width: 12 },
      { header: 'Date échéance', key: 'dueDate', width: 15 },
      { header: 'Date paiement', key: 'paidDate', width: 15 },
      { header: 'Statut', key: 'status', width: 12 },
      { header: 'Transaction ID', key: 'transactionId', width: 20 },
    ];

    // Style du header
    dataSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    dataSheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF2C5282' },
    };

    // Ajouter les données
    contributions.forEach(c => {
      const row = dataSheet.addRow({
        id: c.id,
        member: c.member ? `${c.member.nom} ${c.member.prenom}` : 'N/A',
        email: c.member?.email || 'N/A',
        phone: c.member?.telephone || 'N/A',
        amount: `${c.amount} FCFA`,
        type: c.contributionType,
        dueDate: new Date(c.dueDate).toLocaleDateString('fr-FR'),
        paidDate: c.paidDate ? new Date(c.paidDate).toLocaleDateString('fr-FR') : 'Non payé',
        status: c.status,
        transactionId: c.transactionId || 'N/A',
      });

      // Colorer selon le statut
      const statusColor = {
        paid: 'FF4CAF50',
        pending: 'FFFFA726',
        overdue: 'FFF44336',
      };

      row.getCell('status').fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: statusColor[c.status] || 'FFFFFFFF' },
      };
      row.getCell('status').font = { color: { argb: 'FFFFFFFF' }, bold: true };
    });

    // Générer le buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  /**
   * Exporter les contributions en PDF
   */
  async exportToPDF(filters: ReportFilters): Promise<Buffer> {
    const contributions = await this.getContributionsForReport(filters);
    const stats = await this.getContributionStats(filters);

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const chunks: Buffer[] = [];

      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Header
      doc.fontSize(20).fillColor('#2C5282').text('🕌 UNCHK', { align: 'center' });
      doc.fontSize(16).text('Rapport de Cotisations', { align: 'center' });
      doc.moveDown();
      doc.fontSize(10).fillColor('#718096').text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, { align: 'center' });
      doc.moveDown(2);

      // Statistiques
      doc.fontSize(14).fillColor('#2C5282').text('📊 Statistiques Globales');
      doc.moveDown();

      const statsData = [
        ['Nombre total de cotisations', stats.totalContributions.toString()],
        ['Montant total attendu', `${stats.totalAmount.toLocaleString()} FCFA`],
        ['Montant payé', `${stats.paidAmount.toLocaleString()} FCFA`],
        ['Montant en attente', `${stats.pendingAmount.toLocaleString()} FCFA`],
        ['Montant en retard', `${stats.overdueAmount.toLocaleString()} FCFA`],
        ['Taux de collecte', `${stats.collectionRate}%`],
      ];

      doc.fontSize(10).fillColor('#000000');
      statsData.forEach(([label, value]) => {
        doc.text(`${label}:`, { continued: true }).text(` ${value}`, { align: 'right' });
      });

      doc.moveDown(2);

      // Tableau des contributions
      doc.fontSize(14).fillColor('#2C5282').text('📋 Liste des Contributions');
      doc.moveDown();

      doc.fontSize(8).fillColor('#000000');

      // Header du tableau
      const tableTop = doc.y;
      const rowHeight = 20;
      let currentY = tableTop;

      doc.fontSize(8).font('Helvetica-Bold');
      doc.text('Membre', 50, currentY, { width: 120 });
      doc.text('Montant', 170, currentY, { width: 60 });
      doc.text('Échéance', 230, currentY, { width: 70 });
      doc.text('Paiement', 300, currentY, { width: 70 });
      doc.text('Statut', 370, currentY, { width: 50 });

      // Ligne sous le header
      currentY += rowHeight;
      doc.moveTo(50, currentY).lineTo(550, currentY).stroke();
      currentY += 5;

      // Données
      doc.font('Helvetica');
      contributions.slice(0, 25).forEach(c => { // Limiter à 25 pour tenir sur une page
        if (currentY > 700) {
          doc.addPage();
          currentY = 50;
        }

        const memberName = c.member ? `${c.member.nom} ${c.member.prenom}` : 'N/A';
        const statusEmoji = { paid: '✅', pending: '⏳', overdue: '❌' };

        doc.text(memberName.substring(0, 25), 50, currentY, { width: 120 });
        doc.text(`${c.amount} FCFA`, 170, currentY, { width: 60 });
        doc.text(new Date(c.dueDate).toLocaleDateString('fr-FR'), 230, currentY, { width: 70 });
        doc.text(c.paidDate ? new Date(c.paidDate).toLocaleDateString('fr-FR') : '-', 300, currentY, { width: 70 });
        doc.text(`${statusEmoji[c.status]} ${c.status}`, 370, currentY, { width: 50 });

        currentY += rowHeight;
      });

      if (contributions.length > 25) {
        doc.moveDown(2);
        doc.fontSize(8).fillColor('#718096').text(`... et ${contributions.length - 25} autre(s) contribution(s)`, { align: 'center' });
      }

      // Footer
      doc.fontSize(8).fillColor('#718096');
      doc.text(
        'UNCHK - Université Numérique Cheikh Hamidou Kane',
        50,
        doc.page.height - 50,
        { align: 'center' }
      );

      doc.end();
    });
  }

  /**
   * Récupérer les contributions pour le rapport
   */
  private async getContributionsForReport(filters: ReportFilters): Promise<MemberContribution[]> {
    const qb = this.repo
      .createQueryBuilder('c')
      .leftJoinAndSelect('c.member', 'member');

    if (filters.startDate) {
      qb.andWhere('c.dueDate >= :startDate', { startDate: filters.startDate });
    }

    if (filters.endDate) {
      qb.andWhere('c.dueDate <= :endDate', { endDate: filters.endDate });
    }

    if (filters.status) {
      qb.andWhere('c.status = :status', { status: filters.status });
    }

    if (filters.contributionType) {
      qb.andWhere('c.contributionType = :type', { type: filters.contributionType });
    }

    qb.orderBy('c.dueDate', 'DESC');

    return qb.getMany();
  }
}
