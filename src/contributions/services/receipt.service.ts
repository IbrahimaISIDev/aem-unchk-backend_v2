import { Injectable } from '@nestjs/common';
import * as PDFDocument from 'pdfkit';
import { MemberContribution } from '../entities/member-contribution.entity';

@Injectable()
export class ReceiptService {
  /**
   * Générer un reçu de paiement en PDF
   */
  async generateReceipt(contribution: MemberContribution): Promise<Buffer> {
    if (!contribution.member) {
      throw new Error('Member information is required to generate receipt');
    }

    if (contribution.status !== 'paid' || !contribution.paidDate) {
      throw new Error('Cannot generate receipt for unpaid contribution');
    }

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
        info: {
          Title: `Reçu de Cotisation - ${contribution.id}`,
          Author: 'UNCHK',
          Subject: 'Reçu de paiement',
        },
      });

      const chunks: Buffer[] = [];

      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // En-tête avec logo (texte stylisé)
      doc.fontSize(24)
        .fillColor('#2C5282')
        .text('🕌 UNCHK', { align: 'center' });

      doc.fontSize(10)
        .fillColor('#718096')
        .text('Université Numérique Cheikh Hamidou Kane', { align: 'center' })
        .text('Association Étudiante Musulmane', { align: 'center' })
        .moveDown();

      // Ligne de séparation
      doc.moveTo(50, doc.y)
        .lineTo(doc.page.width - 50, doc.y)
        .strokeColor('#E2E8F0')
        .stroke();

      doc.moveDown(2);

      // Titre du reçu
      doc.fontSize(18)
        .fillColor('#2C5282')
        .text('REÇU DE PAIEMENT', { align: 'center' });

      doc.moveDown(2);

      // Numéro de reçu et date
      const receiptNumber = `REC-${contribution.id.substring(0, 8).toUpperCase()}`;
      const receiptDate = new Date().toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });

      doc.fontSize(10)
        .fillColor('#000000')
        .text(`N° de reçu : ${receiptNumber}`, 50, doc.y)
        .text(`Date d'émission : ${receiptDate}`, doc.page.width - 250, doc.y - 12);

      doc.moveDown(2);

      // Informations du membre
      doc.fontSize(12)
        .fillColor('#2C5282')
        .text('INFORMATIONS DU MEMBRE', 50, doc.y);

      doc.moveDown(0.5);

      const memberInfo = [
        ['Nom complet', `${contribution.member.nom} ${contribution.member.prenom}`],
        ['Email', contribution.member.email || 'N/A'],
        ['Téléphone', contribution.member.telephone || 'N/A'],
      ];

      doc.fontSize(10).fillColor('#000000');
      memberInfo.forEach(([label, value]) => {
        doc.font('Helvetica-Bold').text(`${label}: `, 70, doc.y, { continued: true });
        doc.font('Helvetica').text(value);
      });

      doc.moveDown(2);

      // Détails de la cotisation
      doc.fontSize(12)
        .fillColor('#2C5282')
        .text('DÉTAILS DE LA COTISATION', 50, doc.y);

      doc.moveDown(0.5);

      // Box avec montant
      const boxY = doc.y;
      doc.rect(70, boxY, doc.page.width - 140, 120)
        .fillAndStroke('#F7FAFC', '#E2E8F0');

      doc.fillColor('#000000');

      const contributionDetails = [
        ['Type de cotisation', this.getContributionTypeLabel(contribution.contributionType)],
        ['Date d\'échéance', new Date(contribution.dueDate).toLocaleDateString('fr-FR')],
        ['Date de paiement', new Date(contribution.paidDate).toLocaleDateString('fr-FR')],
        ['Méthode de paiement', contribution.transactionId ? 'Transaction électronique' : 'Espèces'],
      ];

      let detailY = boxY + 15;
      contributionDetails.forEach(([label, value]) => {
        doc.font('Helvetica-Bold')
          .fontSize(10)
          .text(`${label}:`, 90, detailY);
        doc.font('Helvetica')
          .text(value, 250, detailY);
        detailY += 20;
      });

      // Montant payé (mis en évidence)
      doc.font('Helvetica-Bold')
        .fontSize(14)
        .fillColor('#2C5282')
        .text('MONTANT PAYÉ:', 90, detailY + 5);

      doc.fontSize(20)
        .text(`${Number(contribution.amount).toLocaleString('fr-FR')} FCFA`, 250, detailY);

      doc.moveDown(8);

      // Transaction ID si disponible
      if (contribution.transactionId) {
        doc.fontSize(9)
          .fillColor('#718096')
          .text(`ID de transaction : ${contribution.transactionId}`, { align: 'center' });
        doc.moveDown();
      }

      // Note de remerciement
      doc.moveDown(2);
      doc.font('Helvetica-Oblique');
      doc.fontSize(10);
      doc.fillColor('#000000');
      doc.text('BarakAllahu fik pour votre contribution !', { align: 'center' });

      doc.moveDown(2);

      // Signature (placeholder)
      const signatureY = doc.y + 20;
      doc.moveTo(doc.page.width - 250, signatureY)
        .lineTo(doc.page.width - 100, signatureY)
        .stroke();

      doc.fontSize(9)
        .fillColor('#718096')
        .text('Trésorier', doc.page.width - 250, signatureY + 10, { width: 150, align: 'center' });

      // Footer
      doc.fontSize(8)
        .fillColor('#CBD5E0')
        .text(
          'Ce reçu a été généré automatiquement et ne nécessite pas de signature physique.',
          50,
          doc.page.height - 100,
          { align: 'center', width: doc.page.width - 100 }
        );

      doc.fontSize(8)
        .fillColor('#718096')
        .text(
          `Document généré le ${new Date().toLocaleString('fr-FR')}`,
          50,
          doc.page.height - 70,
          { align: 'center', width: doc.page.width - 100 }
        );

      // Contact
      doc.fontSize(8)
        .fillColor('#2C5282')
        .text(
          'Contact: contact@unchk.org | www.unchk.org',
          50,
          doc.page.height - 50,
          { align: 'center', width: doc.page.width - 100 }
        );

      doc.end();
    });
  }

  /**
   * Obtenir le label traduit du type de cotisation
   */
  private getContributionTypeLabel(type: string): string {
    const labels = {
      monthly: 'Mensuelle',
      quarterly: 'Trimestrielle',
      annual: 'Annuelle',
    };

    return labels[type] || type;
  }

  /**
   * Générer un nom de fichier pour le reçu
   */
  generateReceiptFilename(contribution: MemberContribution): string {
    const date = contribution.paidDate
      ? new Date(contribution.paidDate).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0];

    const memberName = contribution.member
      ? `${contribution.member.nom}_${contribution.member.prenom}`.toLowerCase().replace(/\s+/g, '_')
      : 'membre';

    return `recu_cotisation_${memberName}_${date}.pdf`;
  }
}
