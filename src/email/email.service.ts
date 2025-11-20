import { Injectable, Logger } from "@nestjs/common";
import * as nodemailer from "nodemailer";
import { ConfigService } from "@nestjs/config";
import { Resend } from "resend";

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter | null = null;
  private resend: Resend | null = null;
  private from: string;
  private resendFrom: string;
  private resendEnabled: boolean = false;

  constructor(private readonly config: ConfigService) {
    const host = this.config.get<string>("email.host");
    const port = this.config.get<number>("email.port");
    const user = this.config.get<string>("email.user");
    const pass = this.config.get<string>("email.pass");
    const resendApiKey = this.config.get<string>("email.resendApiKey");
    this.from =
      this.config.get<string>("email.from") || "noreply@islamic-platform.com";
    this.resendFrom =
      process.env.RESEND_FROM || '"AEM UNCHK" <onboarding@resend.dev>';

    // Configuration SMTP (méthode principale)
    if (host && port && user && pass) {
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

      this.transporter
        .verify()
        .then(() => {
          this.logger.log(
            `✅ SMTP verified successfully: ${host}:${port} as ${user} | from=${this.from}`
          );
        })
        .catch((e) => {
          this.logger.warn(`⚠️  SMTP verification failed: ${e.message}`);
          this.logger.log(
            "SMTP will be used with fallback to Resend if configured"
          );
        });
    } else {
      this.logger.warn(
        "⚠️  SMTP not configured (missing host, port, user, or pass)"
      );
    }

    // Configuration Resend (méthode de fallback)
    if (resendApiKey) {
      this.resend = new Resend(resendApiKey);
      this.resendEnabled = true;
      this.logger.log("✅ Resend API configured as fallback email service");
    } else {
      this.logger.warn(
        "⚠️  Resend not configured (missing RESEND_API_KEY). Email fallback disabled."
      );
    }

    // Vérification finale
    if (!this.transporter && !this.resend) {
      this.logger.error(
        "❌ No email service configured! Emails will not be sent."
      );
    }
  }

  async send(
    to: string | string[],
    subject: string,
    text?: string,
    html?: string
  ) {
    const recipients = Array.isArray(to) ? to.join(",") : to;
    const recipientsArray = Array.isArray(to) ? to : [to];

    // Vérifier qu'au moins une méthode est disponible
    if (!this.transporter && !this.resend) {
      this.logger.error(
        `❌ No email service available. to=${recipients}, subject="${subject}"`
      );
      return { sent: false, error: "No email service configured" };
    }

    // Tentative 1 : SMTP
    if (this.transporter) {
      try {
        this.logger.log(
          `📧 [SMTP] Attempting to send email to: ${recipients} | subject: "${subject}"`
        );

        const info = await this.transporter.sendMail({
          from: this.from,
          to: recipients,
          subject,
          text: text || undefined,
          html: html || undefined,
        });

        this.logger.log(
          `✅ [SMTP] Email sent successfully: ${info.messageId} | to=${recipients}`
        );

        return { sent: true, id: info.messageId, method: "SMTP" };
      } catch (e: any) {
        this.logger.warn(
          `⚠️  [SMTP] Failed to send email: ${e.message} | code: ${e.code || "N/A"}`
        );

        // Si Resend est disponible, tenter le fallback
        if (this.resendEnabled && this.resend) {
          this.logger.log(`🔄 [FALLBACK] Attempting to send via Resend...`);
          return await this.sendViaResend(
            recipientsArray,
            subject,
            text,
            html
          );
        }

        // Pas de fallback disponible
        this.logger.error(
          `❌ [SMTP] Email send failed and no fallback available`
        );
        return { sent: false, error: e.message, method: "SMTP" };
      }
    }

    // Tentative 2 : Resend uniquement (si SMTP n'est pas configuré)
    if (this.resendEnabled && this.resend) {
      this.logger.log(
        `📧 [Resend] Sending email (SMTP not configured) to: ${recipients}`
      );
      return await this.sendViaResend(recipientsArray, subject, text, html);
    }

    return { sent: false, error: "No email service available" };
  }

  private async sendViaResend(
    to: string[],
    subject: string,
    text?: string,
    html?: string
  ) {
    try {
      const result = await this.resend!.emails.send({
        from: this.resendFrom,
        to,
        subject,
        text: text || undefined,
        html: html || undefined,
      });

      this.logger.log(
        `✅ [Resend] Email sent successfully: ${result.data?.id} | to=${to.join(",")} | from=${this.resendFrom}`
      );

      return { sent: true, id: result.data?.id, method: "Resend" };
    } catch (e: any) {
      this.logger.error(
        `❌ [Resend] Email send failed: ${e.message}`,
        e.stack
      );
      return { sent: false, error: e.message, method: "Resend" };
    }
  }
}
