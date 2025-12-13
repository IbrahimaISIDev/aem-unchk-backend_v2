import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface EmailTemplate {
  subject: string;
  text: string;
  html: string;
}

@Injectable()
export class EmailTemplatesService {
  private readonly appName = 'AEM UNCHK';
  private readonly primaryColor = '#667eea';
  private readonly frontendUrl: string;

  constructor(private readonly config: ConfigService) {
    this.frontendUrl = this.config.get<string>('frontend.url') || 'https://aem-unchk-connect.vercel.app';
  }

  /**
   * Template de base pour tous les emails
   */
  private getBaseTemplate(content: string, preheader?: string): string {
    return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${this.appName}</title>
  ${preheader ? `<style type="text/css">
    .preheader { display: none !important; visibility: hidden; mso-hide: all; font-size: 1px; line-height: 1px; max-height: 0; max-width: 0; opacity: 0; overflow: hidden; }
  </style>` : ''}
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa;">
  ${preheader ? `<span class="preheader">${preheader}</span>` : ''}

  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f4f7fa; padding: 20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, ${this.primaryColor} 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">${this.appName}</h1>
              <p style="margin: 10px 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">Association des Étudiants Musulmans - UNCHK</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
              <p style="margin: 0 0 10px; color: #6c757d; font-size: 14px;">
                <strong>${this.appName}</strong><br>
                Université Numérique Cheikh Hamidou Kane
              </p>
              <p style="margin: 10px 0; color: #6c757d; font-size: 12px;">
                Cet email a été envoyé depuis notre plateforme de gestion associative.
              </p>
              <p style="margin: 10px 0;">
                <a href="${this.frontendUrl}" style="color: ${this.primaryColor}; text-decoration: none; font-size: 14px; font-weight: 500;">Accéder à la plateforme</a>
              </p>
              <p style="margin: 15px 0 0; color: #adb5bd; font-size: 11px;">
                © ${new Date().getFullYear()} ${this.appName}. Tous droits réservés.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();
  }

  /**
   * Email de bienvenue après inscription
   */
  getNewRegistrationEmail(userName: string): EmailTemplate {
    const content = `
      <h2 style="margin: 0 0 20px; color: #212529; font-size: 24px; font-weight: 600;">
        Bienvenue Monsieur/Madame ${userName} !
      </h2>

      <p style="margin: 0 0 15px; color: #495057; font-size: 16px; line-height: 1.6;">
        Votre inscription à ${this.appName} a été effectuée avec succès.
      </p>

      <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <p style="margin: 0; color: #856404; font-size: 14px; line-height: 1.5;">
          <strong>⏳ En attente de validation</strong><br>
          Votre compte est actuellement en attente d'activation par notre équipe administrative. Vous recevrez un email de confirmation dès que votre compte sera activé.
        </p>
      </div>

      <h3 style="margin: 25px 0 15px; color: #212529; font-size: 18px; font-weight: 600;">
        Prochaines étapes
      </h3>

      <ol style="margin: 0; padding-left: 20px; color: #495057; font-size: 15px; line-height: 1.8;">
        <li>Notre équipe examine votre demande d'inscription</li>
        <li>Vous recevrez un email de confirmation une fois votre compte activé</li>
        <li>Vous pourrez alors vous connecter et accéder à toutes les fonctionnalités</li>
      </ol>

      <p style="margin: 25px 0 0; color: #6c757d; font-size: 14px; line-height: 1.6;">
        Si vous avez des questions, n'hésitez pas à contacter notre équipe.
      </p>
    `;

    return {
      subject: `🎉 Bienvenue à ${this.appName} - Inscription reçue`,
      text: `Bienvenue Monsieur/Madame ${userName} !\n\nVotre inscription à ${this.appName} a été effectuée avec succès.\n\nVotre compte est en attente de validation par notre équipe. Vous recevrez un email dès que votre compte sera activé.\n\nMerci et à bientôt !\nL'équipe ${this.appName}`,
      html: this.getBaseTemplate(content, 'Votre inscription a été reçue et est en cours de validation'),
    };
  }

  /**
   * Email de notification aux admins pour nouvelle inscription
   */
  getAdminNewRegistrationEmail(userName: string, userEmail: string): EmailTemplate {
    const content = `
      <h2 style="margin: 0 0 20px; color: #212529; font-size: 24px; font-weight: 600;">
        📋 Nouvelle inscription en attente
      </h2>

      <p style="margin: 0 0 20px; color: #495057; font-size: 16px; line-height: 1.6;">
        Un nouvel utilisateur vient de s'inscrire sur la plateforme et attend votre validation.
      </p>

      <div style="background-color: #f8f9fa; border-radius: 6px; padding: 20px; margin: 20px 0;">
        <table width="100%" cellpadding="8" cellspacing="0" border="0">
          <tr>
            <td style="color: #6c757d; font-size: 14px; font-weight: 600; width: 120px;">Nom complet:</td>
            <td style="color: #212529; font-size: 14px;">${userName}</td>
          </tr>
          <tr>
            <td style="color: #6c757d; font-size: 14px; font-weight: 600;">Email:</td>
            <td style="color: #212529; font-size: 14px;">${userEmail}</td>
          </tr>
          <tr>
            <td style="color: #6c757d; font-size: 14px; font-weight: 600;">Statut:</td>
            <td style="color: #ffc107; font-size: 14px; font-weight: 600;">⏳ EN ATTENTE</td>
          </tr>
        </table>
      </div>

      <p style="margin: 25px 0 20px; text-align: center;">
        <a href="${this.frontendUrl}/admin/users" style="display: inline-block; background-color: ${this.primaryColor}; color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 6px; font-weight: 600; font-size: 15px;">
          Gérer les inscriptions
        </a>
      </p>

      <p style="margin: 20px 0 0; color: #6c757d; font-size: 13px; line-height: 1.5; text-align: center;">
        Veuillez examiner et valider cette inscription dans les meilleurs délais.
      </p>
    `;

    return {
      subject: `🔔 ${this.appName} - Nouvelle inscription en attente de validation`,
      text: `Nouvelle inscription en attente\n\nNom: ${userName}\nEmail: ${userEmail}\n\nVeuillez valider cette inscription depuis l'interface d'administration.\n\n${this.frontendUrl}/admin/users`,
      html: this.getBaseTemplate(content, 'Un nouvel utilisateur attend votre validation'),
    };
  }

  /**
   * Email d'activation de compte
   */
  getAccountActivatedEmail(userName: string): EmailTemplate {
    const content = `
      <h2 style="margin: 0 0 20px; color: #28a745; font-size: 24px; font-weight: 600;">
        ✅ Votre compte a été activé !
      </h2>

      <p style="margin: 0 0 15px; color: #495057; font-size: 16px; line-height: 1.6;">
        Bonjour <strong>Monsieur/Madame ${userName}</strong>,
      </p>

      <p style="margin: 0 0 20px; color: #495057; font-size: 16px; line-height: 1.6;">
        Excellente nouvelle ! Votre compte a été validé par notre équipe administrative. Vous pouvez désormais accéder à toutes les fonctionnalités de la plateforme.
      </p>

      <div style="background-color: #d4edda; border-left: 4px solid #28a745; padding: 15px; margin: 25px 0; border-radius: 4px;">
        <p style="margin: 0; color: #155724; font-size: 15px; line-height: 1.6;">
          <strong>🎉 Bienvenue dans la communauté ${this.appName} !</strong><br>
          Vous faites maintenant partie de notre association et pouvez profiter de tous nos services.
        </p>
      </div>

      <h3 style="margin: 25px 0 15px; color: #212529; font-size: 18px; font-weight: 600;">
        Ce que vous pouvez faire maintenant
      </h3>

      <ul style="margin: 0; padding-left: 20px; color: #495057; font-size: 15px; line-height: 1.8;">
        <li>Consulter les événements et activités à venir</li>
        <li>Participer aux discussions de la communauté</li>
        <li>Accéder aux ressources pédagogiques</li>
        <li>Gérer vos contributions et cotisations</li>
        <li>Mettre à jour votre profil</li>
      </ul>

      <p style="margin: 30px 0 20px; text-align: center;">
        <a href="${this.frontendUrl}/login" style="display: inline-block; background-color: #28a745; color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 6px; font-weight: 600; font-size: 16px;">
          Se connecter maintenant
        </a>
      </p>

      <p style="margin: 20px 0 0; color: #6c757d; font-size: 14px; line-height: 1.6; text-align: center;">
        Nous sommes ravis de vous compter parmi nous !
      </p>
    `;

    return {
      subject: `✅ Votre compte ${this.appName} est activé - Bienvenue !`,
      text: `Bonjour Monsieur/Madame ${userName},\n\nVotre compte a été activé avec succès !\n\nVous pouvez maintenant vous connecter et accéder à toutes les fonctionnalités de la plateforme.\n\nConnectez-vous: ${this.frontendUrl}/login\n\nBienvenue dans la communauté ${this.appName} !\n\nL'équipe ${this.appName}`,
      html: this.getBaseTemplate(content, 'Votre compte est activé ! Connectez-vous dès maintenant'),
    };
  }

  /**
   * Email de changement de statut
   */
  getStatusChangedEmail(userName: string, oldStatus: string, newStatus: string): EmailTemplate {
    const statusColors: Record<string, string> = {
      ACTIVE: '#28a745',
      PENDING: '#ffc107',
      SUSPENDED: '#dc3545',
      INACTIVE: '#6c757d',
    };

    const color = statusColors[newStatus] || '#007bff';

    const content = `
      <h2 style="margin: 0 0 20px; color: #212529; font-size: 24px; font-weight: 600;">
        Mise à jour du statut de votre compte
      </h2>

      <p style="margin: 0 0 15px; color: #495057; font-size: 16px; line-height: 1.6;">
        Bonjour <strong>Monsieur/Madame ${userName}</strong>,
      </p>

      <p style="margin: 0 0 20px; color: #495057; font-size: 16px; line-height: 1.6;">
        Le statut de votre compte a été modifié par notre équipe administrative.
      </p>

      <div style="background-color: #f8f9fa; border-radius: 6px; padding: 20px; margin: 25px 0; text-align: center;">
        <div style="margin-bottom: 15px;">
          <span style="display: inline-block; background-color: #e9ecef; color: #495057; padding: 8px 16px; border-radius: 4px; font-size: 14px; font-weight: 600;">
            ${oldStatus}
          </span>
          <span style="margin: 0 10px; color: #6c757d; font-size: 20px;">→</span>
          <span style="display: inline-block; background-color: ${color}; color: #ffffff; padding: 8px 16px; border-radius: 4px; font-size: 14px; font-weight: 600;">
            ${newStatus}
          </span>
        </div>
      </div>

      <p style="margin: 20px 0; color: #6c757d; font-size: 14px; line-height: 1.6;">
        ${newStatus === 'ACTIVE' ? 'Votre compte est maintenant actif et vous pouvez accéder à toutes les fonctionnalités.' :
          newStatus === 'SUSPENDED' ? 'Votre compte a été temporairement suspendu. Veuillez contacter l\'administration pour plus d\'informations.' :
          newStatus === 'INACTIVE' ? 'Votre compte a été désactivé. Contactez l\'administration si vous pensez qu\'il s\'agit d\'une erreur.' :
          'Si vous avez des questions concernant ce changement, n\'hésitez pas à nous contacter.'}
      </p>

      ${newStatus === 'ACTIVE' ? `
        <p style="margin: 25px 0 20px; text-align: center;">
          <a href="${this.frontendUrl}/login" style="display: inline-block; background-color: ${this.primaryColor}; color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 6px; font-weight: 600; font-size: 15px;">
            Se connecter
          </a>
        </p>
      ` : ''}
    `;

    return {
      subject: `${this.appName} - Mise à jour du statut de votre compte`,
      text: `Bonjour Monsieur/Madame ${userName},\n\nLe statut de votre compte a été modifié:\n${oldStatus} → ${newStatus}\n\n${newStatus === 'ACTIVE' ? 'Vous pouvez maintenant vous connecter.' : 'Pour plus d\'informations, contactez l\'administration.'}\n\nL'équipe ${this.appName}`,
      html: this.getBaseTemplate(content, `Votre statut est maintenant: ${newStatus}`),
    };
  }

  /**
   * Email de changement de rôle
   */
  getRoleChangedEmail(userName: string, oldRole: string, newRole: string): EmailTemplate {
    const roleDescriptions: Record<string, string> = {
      ADMIN: 'Administrateur - Accès complet à toutes les fonctionnalités',
      SEC_GENERAL: 'Secrétaire Général - Gestion administrative avancée',
      TRESORIER: 'Trésorier - Gestion financière',
      MEMBER: 'Membre - Accès aux fonctionnalités de base',
    };

    const content = `
      <h2 style="margin: 0 0 20px; color: #212529; font-size: 24px; font-weight: 600;">
        🔑 Mise à jour de vos permissions
      </h2>

      <p style="margin: 0 0 15px; color: #495057; font-size: 16px; line-height: 1.6;">
        Bonjour <strong>Monsieur/Madame ${userName}</strong>,
      </p>

      <p style="margin: 0 0 20px; color: #495057; font-size: 16px; line-height: 1.6;">
        Votre rôle au sein de la plateforme ${this.appName} a été modifié.
      </p>

      <div style="background-color: #f8f9fa; border-radius: 6px; padding: 20px; margin: 25px 0; text-align: center;">
        <div style="margin-bottom: 15px;">
          <span style="display: inline-block; background-color: #e9ecef; color: #495057; padding: 8px 16px; border-radius: 4px; font-size: 14px; font-weight: 600;">
            ${oldRole}
          </span>
          <span style="margin: 0 10px; color: #6c757d; font-size: 20px;">→</span>
          <span style="display: inline-block; background-color: ${this.primaryColor}; color: #ffffff; padding: 8px 16px; border-radius: 4px; font-size: 14px; font-weight: 600;">
            ${newRole}
          </span>
        </div>
        <p style="margin: 10px 0 0; color: #6c757d; font-size: 13px;">
          ${roleDescriptions[newRole] || newRole}
        </p>
      </div>

      <div style="background-color: #e7f3ff; border-left: 4px solid #2196F3; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <p style="margin: 0; color: #1565C0; font-size: 14px; line-height: 1.5;">
          <strong>ℹ️ Important :</strong> Vos nouvelles permissions seront actives dès votre prochaine connexion.
        </p>
      </div>

      <p style="margin: 25px 0 20px; text-align: center;">
        <a href="${this.frontendUrl}" style="display: inline-block; background-color: ${this.primaryColor}; color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 6px; font-weight: 600; font-size: 15px;">
          Accéder à la plateforme
        </a>
      </p>
    `;

    return {
      subject: `${this.appName} - Mise à jour de votre rôle`,
      text: `Bonjour Monsieur/Madame ${userName},\n\nVotre rôle a été modifié:\n${oldRole} → ${newRole}\n\nVos nouvelles permissions seront actives dès votre prochaine connexion.\n\nAccédez à la plateforme: ${this.frontendUrl}\n\nL'équipe ${this.appName}`,
      html: this.getBaseTemplate(content, `Votre nouveau rôle: ${newRole}`),
    };
  }

  /**
   * Email de réinitialisation de mot de passe
   */
  getPasswordResetEmail(userName: string, resetUrl: string, expiresInMinutes: number): EmailTemplate {
    const content = `
      <h2 style="margin: 0 0 20px; color: #212529; font-size: 24px; font-weight: 600;">
        🔒 Réinitialisation de votre mot de passe
      </h2>

      <p style="margin: 0 0 15px; color: #495057; font-size: 16px; line-height: 1.6;">
        Bonjour <strong>Monsieur/Madame ${userName}</strong>,
      </p>

      <p style="margin: 0 0 20px; color: #495057; font-size: 16px; line-height: 1.6;">
        Nous avons reçu une demande de réinitialisation de mot de passe pour votre compte ${this.appName}.
      </p>

      <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <p style="margin: 0; color: #856404; font-size: 14px; line-height: 1.5;">
          <strong>⏰ Lien valide pendant ${expiresInMinutes} minutes</strong><br>
          Pour des raisons de sécurité, ce lien expirera automatiquement.
        </p>
      </div>

      <p style="margin: 25px 0 20px; text-align: center;">
        <a href="${resetUrl}" style="display: inline-block; background-color: ${this.primaryColor}; color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 6px; font-weight: 600; font-size: 16px;">
          Réinitialiser mon mot de passe
        </a>
      </p>

      <p style="margin: 20px 0; color: #6c757d; font-size: 13px; line-height: 1.6; text-align: center;">
        Ou copiez ce lien dans votre navigateur:<br>
        <span style="color: #007bff; word-break: break-all;">${resetUrl}</span>
      </p>

      <div style="background-color: #f8d7da; border-left: 4px solid #dc3545; padding: 15px; margin: 25px 0; border-radius: 4px;">
        <p style="margin: 0; color: #721c24; font-size: 13px; line-height: 1.5;">
          <strong>🔐 Sécurité :</strong> Si vous n'avez pas demandé cette réinitialisation, ignorez cet email. Votre mot de passe restera inchangé.
        </p>
      </div>
    `;

    return {
      subject: `${this.appName} - Réinitialisation de votre mot de passe`,
      text: `Bonjour Monsieur/Madame ${userName},\n\nVous avez demandé la réinitialisation de votre mot de passe.\n\nCe lien expire dans ${expiresInMinutes} minutes:\n${resetUrl}\n\nSi vous n'avez pas demandé cette réinitialisation, ignorez cet email.\n\nL'équipe ${this.appName}`,
      html: this.getBaseTemplate(content, 'Réinitialisez votre mot de passe en toute sécurité'),
    };
  }

  /**
   * Email de rappel de contribution
   */
  getContributionReminderEmail(userName: string, amount: number, dueDate: string): EmailTemplate {
    const content = `
      <h2 style="margin: 0 0 20px; color: #212529; font-size: 24px; font-weight: 600;">
        💰 Rappel de contribution
      </h2>

      <p style="margin: 0 0 15px; color: #495057; font-size: 16px; line-height: 1.6;">
        Bonjour <strong>Monsieur/Madame ${userName}</strong>,
      </p>

      <p style="margin: 0 0 20px; color: #495057; font-size: 16px; line-height: 1.6;">
        Nous vous rappelons qu'une contribution est à régler prochainement.
      </p>

      <div style="background-color: #f8f9fa; border-radius: 6px; padding: 25px; margin: 25px 0; text-align: center;">
        <p style="margin: 0 0 10px; color: #6c757d; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
          Montant à régler
        </p>
        <p style="margin: 0; color: ${this.primaryColor}; font-size: 36px; font-weight: 700;">
          ${amount} €
        </p>
        <p style="margin: 15px 0 0; color: #6c757d; font-size: 15px;">
          Date limite : <strong style="color: #212529;">${dueDate}</strong>
        </p>
      </div>

      <div style="background-color: #e7f3ff; border-left: 4px solid #2196F3; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <p style="margin: 0; color: #1565C0; font-size: 14px; line-height: 1.5;">
          <strong>ℹ️ Modalités de paiement :</strong> Veuillez effectuer votre paiement via les moyens habituels ou contactez le trésorier pour plus d'informations.
        </p>
      </div>

      <p style="margin: 25px 0 20px; text-align: center;">
        <a href="${this.frontendUrl}/contributions" style="display: inline-block; background-color: ${this.primaryColor}; color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 6px; font-weight: 600; font-size: 15px;">
          Voir mes contributions
        </a>
      </p>

      <p style="margin: 20px 0 0; color: #6c757d; font-size: 13px; line-height: 1.6; text-align: center;">
        Merci pour votre engagement et votre participation !
      </p>
    `;

    return {
      subject: `${this.appName} - Rappel de contribution (${amount}€)`,
      text: `Bonjour Monsieur/Madame ${userName},\n\nVous avez une contribution à régler:\n\nMontant: ${amount}€\nDate limite: ${dueDate}\n\nVeuillez effectuer le paiement dans les plus brefs délais.\n\nConsultez vos contributions: ${this.frontendUrl}/contributions\n\nMerci,\nL'équipe ${this.appName}`,
      html: this.getBaseTemplate(content, `Contribution de ${amount}€ à régler avant le ${dueDate}`),
    };
  }
}
