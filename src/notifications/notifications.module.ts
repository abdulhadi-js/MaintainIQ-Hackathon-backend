import { Module, Injectable, Logger } from '@nestjs/common';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  async sendEmail(to: string, subject: string, body: string) {
    this.logger.log(`Sending email to ${to}: ${subject}`);
    // Mock implementation for the hackathon
    return true;
  }
}

@Module({
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
