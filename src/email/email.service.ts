import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter | null = null;
  private from: string;

  constructor(private readonly config: ConfigService) {
    const host = this.config.get<string>('email.host');
    const port = this.config.get<number>('email.port');
    const user = this.config.get<string>('email.user');
    const pass = this.config.get<string>('email.pass');
    this.from = this.config.get<string>('email.from') || 'noreply@islamic-platform.com';

    if (host && port) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: user ? { user, pass } : undefined,
      } as any);
    } else {
      this.logger.warn('MailService disabled: missing SMTP host/port');
    }
  }

  async send(to: string | string[], subject: string, text?: string, html?: string) {
    if (!this.transporter) {
      this.logger.warn(`send skipped (no transporter). to=${to}, subject=${subject}`);
      return { sent: false };
    }
    try {
      const info = await this.transporter.sendMail({
        from: this.from,
        to: Array.isArray(to) ? to.join(',') : to,
        subject,
        text: text || undefined,
        html: html || undefined,
      });
      this.logger.log(`Email sent: ${info.messageId}`);
      return { sent: true, id: info.messageId };
    } catch (e) {
      this.logger.error('Email send failed', e as any);
      return { sent: false, error: (e as any)?.message };
    }
  }
}
