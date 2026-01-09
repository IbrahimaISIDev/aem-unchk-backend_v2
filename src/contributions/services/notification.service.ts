import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailService } from '../../email/email.service';
import { EmailTemplatesService } from '../../email/email-templates.service';
import axios from 'axios';

export enum NotificationChannel {
  EMAIL = 'email',
  WHATSAPP = 'whatsapp',
  BOTH = 'both',
}

export interface NotificationRecipient {
  name: string;
  email?: string;
  phone?: string;
}

export interface NotificationResult {
  channel: NotificationChannel;
  success: boolean;
  recipientId: string;
  error?: string;
}

@Injectable()
export class ContributionNotificationService {
  private readonly whatsappApiUrl: string;
  private readonly whatsappToken: string;
  private readonly whatsappPhoneId: string;

  constructor(
    private readonly mailService: MailService,
    private readonly emailTemplates: EmailTemplatesService,
    private readonly config: ConfigService,
  ) {
    // Configuration WhatsApp Business API
    this.whatsappApiUrl = this.config.get<string>('WHATSAPP_API_URL', 'https://graph.facebook.com/v18.0');
    this.whatsappToken = this.config.get<string>('WHATSAPP_ACCESS_TOKEN', '');
    this.whatsappPhoneId = this.config.get<string>('WHATSAPP_PHONE_ID', '');
  }

  /**
   * Envoyer un rappel de contribution par email
   */
  async sendEmailReminder(
    recipient: NotificationRecipient,
    amount: number,
    dueDate: string,
  ): Promise<boolean> {
    if (!recipient.email) {
      throw new Error('Email address is required');
    }

    const template = this.emailTemplates.getContributionReminderEmail(
      recipient.name,
      amount,
      dueDate,
    );

    try {
      const result = await this.mailService.send(
        recipient.email,
        template.subject,
        template.text,
        template.html,
      );
      return result.sent;
    } catch (error) {
      console.error(`Erreur envoi email à ${recipient.email}:`, error);
      return false;
    }
  }

  /**
   * Envoyer un rappel de contribution via WhatsApp
   */
  async sendWhatsAppReminder(
    recipient: NotificationRecipient,
    amount: number,
    dueDate: string,
  ): Promise<boolean> {
    if (!recipient.phone) {
      throw new Error('Phone number is required');
    }

    if (!this.whatsappToken || !this.whatsappPhoneId) {
      console.warn('WhatsApp API non configurée. Vérifiez vos variables d\'environnement.');
      return false;
    }

    // Formater le numéro de téléphone (format international)
    const phoneNumber = this.formatPhoneNumber(recipient.phone);

    // Message WhatsApp
    const message = this.buildWhatsAppMessage(recipient.name, amount, dueDate);

    try {
      const response = await axios.post(
        `${this.whatsappApiUrl}/${this.whatsappPhoneId}/messages`,
        {
          messaging_product: 'whatsapp',
          to: phoneNumber,
          type: 'text',
          text: {
            body: message,
          },
        },
        {
          headers: {
            'Authorization': `Bearer ${this.whatsappToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      console.log(`✅ WhatsApp envoyé à ${phoneNumber}:`, response.data);
      return response.status === 200;
    } catch (error) {
      console.error(`❌ Erreur envoi WhatsApp à ${phoneNumber}:`, error.response?.data || error.message);
      return false;
    }
  }

  /**
   * Envoyer un rappel via les canaux spécifiés
   */
  async sendReminder(
    recipient: NotificationRecipient,
    amount: number,
    dueDate: string,
    channels: NotificationChannel = NotificationChannel.BOTH,
  ): Promise<NotificationResult[]> {
    const results: NotificationResult[] = [];

    // Envoi par Email
    if (channels === NotificationChannel.EMAIL || channels === NotificationChannel.BOTH) {
      if (recipient.email) {
        const success = await this.sendEmailReminder(recipient, amount, dueDate);
        results.push({
          channel: NotificationChannel.EMAIL,
          success,
          recipientId: recipient.email,
          error: success ? undefined : 'Failed to send email',
        });
      }
    }

    // Envoi par WhatsApp
    if (channels === NotificationChannel.WHATSAPP || channels === NotificationChannel.BOTH) {
      if (recipient.phone) {
        const success = await this.sendWhatsAppReminder(recipient, amount, dueDate);
        results.push({
          channel: NotificationChannel.WHATSAPP,
          success,
          recipientId: recipient.phone,
          error: success ? undefined : 'Failed to send WhatsApp message',
        });
      }
    }

    return results;
  }

  /**
   * Envoyer une notification de paiement confirmé
   */
  async sendPaymentConfirmation(
    recipient: NotificationRecipient,
    amount: number,
    paymentDate: string,
    receiptUrl?: string,
  ): Promise<NotificationResult[]> {
    const results: NotificationResult[] = [];

    // Email de confirmation
    if (recipient.email) {
      const subject = `UNCHK - Confirmation de paiement (${amount} FCFA)`;
      const message = this.buildPaymentConfirmationEmail(recipient.name, amount, paymentDate, receiptUrl);

      try {
        const result = await this.mailService.send(
          recipient.email,
          subject,
          message.text,
          message.html,
        );
        results.push({
          channel: NotificationChannel.EMAIL,
          success: result.sent,
          recipientId: recipient.email,
        });
      } catch (error) {
        results.push({
          channel: NotificationChannel.EMAIL,
          success: false,
          recipientId: recipient.email,
          error: error.message,
        });
      }
    }

    // WhatsApp de confirmation
    if (recipient.phone && this.whatsappToken) {
      const message = this.buildPaymentConfirmationWhatsApp(recipient.name, amount, paymentDate);
      const phoneNumber = this.formatPhoneNumber(recipient.phone);

      try {
        const response = await axios.post(
          `${this.whatsappApiUrl}/${this.whatsappPhoneId}/messages`,
          {
            messaging_product: 'whatsapp',
            to: phoneNumber,
            type: 'text',
            text: { body: message },
          },
          {
            headers: {
              'Authorization': `Bearer ${this.whatsappToken}`,
              'Content-Type': 'application/json',
            },
          },
        );

        results.push({
          channel: NotificationChannel.WHATSAPP,
          success: response.status === 200,
          recipientId: phoneNumber,
        });
      } catch (error) {
        results.push({
          channel: NotificationChannel.WHATSAPP,
          success: false,
          recipientId: phoneNumber,
          error: error.response?.data?.error?.message || error.message,
        });
      }
    }

    return results;
  }

  /**
   * Formater le numéro de téléphone au format international
   */
  private formatPhoneNumber(phone: string): string {
    // Supprimer tous les caractères non numériques
    let cleaned = phone.replace(/\D/g, '');

    // Si le numéro commence par 0, le remplacer par le code pays Sénégal (+221)
    if (cleaned.startsWith('0')) {
      cleaned = '221' + cleaned.substring(1);
    }

    // S'assurer que le numéro commence bien par un code pays
    if (!cleaned.startsWith('221') && cleaned.length === 9) {
      cleaned = '221' + cleaned;
    }

    return cleaned;
  }

  /**
   * Construire le message WhatsApp pour rappel de cotisation
   */
  private buildWhatsAppMessage(name: string, amount: number, dueDate: string): string {
    return `🕌 *UNCHK - Rappel de Cotisation*

Assalamou anleykoum ${name},

Nous vous rappelons votre cotisation à l'UNCHK :

💰 *Montant* : ${amount} FCFA
📅 *Date limite* : ${dueDate}

Merci de procéder au paiement avant cette date.

*Modalités de paiement :*
• Orange Money
• Wave
• Virement bancaire

Pour plus d'informations, contactez-nous.

BarakAllahu fik !
_UNCHK - Université Numérique Cheikh Hamidou Kane_`;
  }

  /**
   * Construire l'email de confirmation de paiement
   */
  private buildPaymentConfirmationEmail(
    name: string,
    amount: number,
    paymentDate: string,
    receiptUrl?: string,
  ): { text: string; html: string } {
    const text = `Assalamou anleykoum ${name},

Nous confirmons la réception de votre paiement de ${amount} FCFA effectué le ${paymentDate}.

${receiptUrl ? `Votre reçu est disponible ici : ${receiptUrl}` : ''}

BarakAllahu fik pour votre contribution !

UNCHK - Université Numérique Cheikh Hamidou Kane`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c5282;">🕌 UNCHK - Confirmation de Paiement</h2>
        <p>Assalamou anleykoum <strong>${name}</strong>,</p>
        <p>Nous confirmons la réception de votre paiement :</p>
        <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 10px 0;"><strong>💰 Montant :</strong> <span style="color: #2c5282; font-size: 24px;">${amount} FCFA</span></p>
          <p style="margin: 10px 0;"><strong>📅 Date :</strong> ${paymentDate}</p>
        </div>
        ${receiptUrl ? `<p><a href="${receiptUrl}" style="background: #2c5282; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">📄 Télécharger le reçu</a></p>` : ''}
        <p style="margin-top: 30px;">BarakAllahu fik pour votre contribution !</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
        <p style="color: #718096; font-size: 12px;">UNCHK - Université Numérique Cheikh Hamidou Kane</p>
      </div>
    `;

    return { text, html };
  }

  /**
   * Construire le message WhatsApp de confirmation de paiement
   */
  private buildPaymentConfirmationWhatsApp(
    name: string,
    amount: number,
    paymentDate: string,
  ): string {
    return `🕌 *UNCHK - Paiement Confirmé* ✅

Assalamou anleykoum ${name},

Nous confirmons la réception de votre paiement :

💰 *Montant* : ${amount} FCFA
📅 *Date* : ${paymentDate}

BarakAllahu fik pour votre contribution !

_UNCHK - Université Numérique Cheikh Hamidou Kane_`;
  }
}
