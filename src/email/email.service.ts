import { Injectable, Logger } from "@nestjs/common";
import * as nodemailer from "nodemailer";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;
  private from: string;

  constructor(private readonly config: ConfigService) {
    const host = this.config.get<string>("email.host");
    const port = this.config.get<number>("email.port");
    const user = this.config.get<string>("email.user");
    const pass = this.config.get<string>("email.pass");
    this.from =
      this.config.get<string>("email.from") || "noreply@islamic-platform.com";

    // Vérifier que la configuration SMTP est complète
    if (!host || !port || !user || !pass) {
      this.logger.error(
        "❌ SMTP configuration incomplete! Missing host, port, user, or pass"
      );
      throw new Error("SMTP email configuration is required");
    }

    // Configuration SMTP
    const transportOptions: any = {
      host,
      port,
      auth: { user, pass },
      connectionTimeout: 30000,
      greetingTimeout: 20000,
      socketTimeout: 30000,
    };

    if (port === 465) {
      transportOptions.secure = true;
    } else if (port === 587) {
      transportOptions.secure = false;
      transportOptions.requireTLS = true;
    }

    this.transporter = nodemailer.createTransport(transportOptions);

    // Vérifier la connexion SMTP
    this.transporter
      .verify()
      .then(() => {
        this.logger.log(
          `✅ SMTP configured and verified successfully: ${host}:${port} as ${user} | from=${this.from}`
        );
      })
      .catch((e) => {
        this.logger.error(`❌ SMTP verification failed: ${e.message}`);
        this.logger.error("Please check your SMTP configuration in .env file");
      });
  }

  /**
   * Envoie un email avec retry automatique en cas d'échec
   * @param to Destinataire(s)
   * @param subject Sujet de l'email
   * @param text Contenu texte brut
   * @param html Contenu HTML
   * @param maxRetries Nombre maximum de tentatives (par défaut: 3)
   * @param retryDelay Délai entre les tentatives en ms (par défaut: 2000ms)
   */
  async send(
    to: string | string[],
    subject: string,
    text?: string,
    html?: string,
    maxRetries: number = 3,
    retryDelay: number = 2000
  ) {
    const recipients = Array.isArray(to) ? to.join(",") : to;
    let lastError: any;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        this.logger.log(
          `📧 [SMTP] Attempt ${attempt}/${maxRetries} - Sending email to: ${recipients} | subject: "${subject}"`
        );

        const info = await this.transporter.sendMail({
          from: this.from,
          to: recipients,
          subject,
          text: text || undefined,
          html: html || undefined,
        });

        this.logger.log(
          `✅ [SMTP] Email sent successfully on attempt ${attempt}: ${info.messageId} | to=${recipients}`
        );

        return {
          sent: true,
          id: info.messageId,
          method: "SMTP",
          attempts: attempt,
          recipients: recipients
        };
      } catch (e: any) {
        lastError = e;

        if (attempt < maxRetries) {
          this.logger.warn(
            `⚠️ [SMTP] Attempt ${attempt}/${maxRetries} failed: ${e.message} | Retrying in ${retryDelay}ms...`
          );
          // Attendre avant de réessayer
          await new Promise(resolve => setTimeout(resolve, retryDelay));
        } else {
          this.logger.error(
            `❌ [SMTP] All ${maxRetries} attempts failed for email to ${recipients} | Last error: ${e.message} | code: ${e.code || "N/A"}`
          );
        }
      }
    }

    return {
      sent: false,
      error: lastError?.message || "Unknown error",
      code: lastError?.code,
      method: "SMTP",
      attempts: maxRetries,
      recipients: recipients
    };
  }
}
