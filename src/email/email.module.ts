import { Module } from '@nestjs/common';
import { MailService } from './email.service';
import { EmailTemplatesService } from './email-templates.service';

@Module({
  providers: [MailService, EmailTemplatesService],
  exports: [MailService, EmailTemplatesService],
})
export class EmailModule {}
