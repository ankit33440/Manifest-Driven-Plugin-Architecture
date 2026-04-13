import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  /** Logs an outbound email payload until an SMTP provider is integrated. */
  async sendEmail(to: string, subject: string, body: string) {
    this.logger.log(`Email queued -> ${to} | ${subject} | ${body}`);
    return { delivered: true };
  }
}
