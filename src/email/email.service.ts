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

  async send(
    to: string | string[],
    subject: string,
    text?: string,
    html?: string
  ) {
    const recipients = Array.isArray(to) ? to.join(",") : to;

    try {
      this.logger.log(
        `📧 [SMTP] Sending email to: ${recipients} | subject: "${subject}"`
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
      this.logger.error(
        `❌ [SMTP] Failed to send email: ${e.message} | code: ${e.code || "N/A"}`
      );
      return { sent: false, error: e.message, method: "SMTP" };
    }
  }
}
