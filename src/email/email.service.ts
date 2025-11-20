import { Injectable, Logger } from "@nestjs/common";
import * as nodemailer from "nodemailer";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter | null = null;
  private from: string;

  constructor(private readonly config: ConfigService) {
    const host = this.config.get<string>("email.host");
    const port = this.config.get<number>("email.port");
    const user = this.config.get<string>("email.user");
    const pass = this.config.get<string>("email.pass");
    this.from =
      this.config.get<string>("email.from") || "noreply@islamic-platform.com";

    if (host && port && user && pass) {
      // Configuration optimisée pour Gmail avec App Password
      const transportOptions: any = {
        host,
        port,
        auth: {
          user,
          pass,
        },
        // Timeouts plus longs pour éviter les erreurs de connexion
        connectionTimeout: 30000,
        greetingTimeout: 20000,
        socketTimeout: 30000,
      };

      // Configuration spécifique selon le port
      if (port === 465) {
        // SSL/TLS direct (recommandé pour Gmail)
        transportOptions.secure = true;
      } else if (port === 587) {
        // STARTTLS
        transportOptions.secure = false;
        transportOptions.requireTLS = true;
      }

      this.transporter = nodemailer.createTransport(transportOptions);

      // Vérifier la connectivité SMTP au démarrage
      this.transporter
        .verify()
        .then(() => {
          this.logger.log(
            `✅ SMTP verified successfully: ${host}:${port} as ${user} | from=${this.from}`
          );
        })
        .catch((e) => {
          this.logger.error(`❌ SMTP verify failed: ${e.message}`, e.stack);
          this.logger.warn(
            "Assurez-vous d'utiliser un App Password Gmail si vous utilisez Gmail"
          );
        });
    } else {
      this.logger.warn(
        "⚠️  MailService disabled: missing SMTP configuration (host, port, user, or pass)"
      );
    }
  }

  async send(
    to: string | string[],
    subject: string,
    text?: string,
    html?: string
  ) {
    if (!this.transporter) {
      this.logger.warn(
        `⚠️  Email send skipped (no transporter configured). to=${to}, subject="${subject}"`
      );
      return { sent: false, error: "No transporter configured" };
    }

    const recipients = Array.isArray(to) ? to.join(",") : to;

    try {
      this.logger.log(
        `📧 Attempting to send email to: ${recipients} | subject: "${subject}"`
      );

      const info = await this.transporter.sendMail({
        from: this.from,
        to: recipients,
        subject,
        text: text || undefined,
        html: html || undefined,
      });

      this.logger.log(
        `✅ Email sent successfully: ${info.messageId} | to=${recipients} | subject="${subject}" | response=${(info as any)?.response || "n/a"}`
      );

      return { sent: true, id: info.messageId };
    } catch (e: any) {
      this.logger.error(
        `❌ Email send failed to ${recipients} | subject: "${subject}" | error: ${e.message}`,
        e.stack
      );

      // Log des détails supplémentaires pour le débogage
      if (e.code) {
        this.logger.error(`Error code: ${e.code}`);
      }
      if (e.command) {
        this.logger.error(`SMTP command: ${e.command}`);
      }

      return { sent: false, error: e.message };
    }
  }
}
