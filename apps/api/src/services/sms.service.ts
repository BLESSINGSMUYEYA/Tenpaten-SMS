import AfricasTalking from 'africastalking';
import { env } from '../config/env';
import { prisma } from '../config/database';
import { NotificationType, NotificationStatus } from '@prisma/client';

/**
 * SMS Service
 * Handles SMS broadcasts, absence alerts, fee reminders, grade/results publications.
 * Integrates with Africa's Talking if API key is provided, or logs to terminal in local dev mode.
 */
class SmsService {
  private atSMS: any = null;

  constructor() {
    this.initAfricasTalking();
  }

  private initAfricasTalking() {
    if (env.AFRICASTALKING_API_KEY) {
      try {
        const at = AfricasTalking({
          apiKey: env.AFRICASTALKING_API_KEY,
          username: env.AFRICASTALKING_USERNAME,
        });
        this.atSMS = at.SMS;
        console.log(`📱 SMS Service: Configured Africa's Talking (Username: ${env.AFRICASTALKING_USERNAME})`);
      } catch (err) {
        console.error('❌ SMS Service: Failed to initialize Africa\'s Talking client:', err);
      }
    } else {
      console.log('📱 SMS Service: Running in Local Dev Mode (Console Mock)');
    }
  }

  /**
   * Send SMS via Africa's Talking or mock logger
   * Saves notification to database for logging / retry tracking
   */
  public async sendSms(options: {
    schoolId: string;
    userId: string;
    phone: string;
    message: string;
  }): Promise<boolean> {
    const { schoolId, userId, phone, message } = options;

    // Create pending notification record
    const notification = await prisma.notification.create({
      data: {
        schoolId,
        userId,
        type: NotificationType.sms,
        message,
        status: NotificationStatus.pending,
      },
    });

    try {
      // Basic validation of phone number
      if (!phone) {
        throw new Error('Phone number is missing or empty');
      }

      // Format phone number to international format (Malawi +265) if starts with 0
      let formattedPhone = phone.trim();
      if (formattedPhone.startsWith('0')) {
        formattedPhone = '+265' + formattedPhone.substring(1);
      } else if (!formattedPhone.startsWith('+')) {
        formattedPhone = '+265' + formattedPhone;
      }

      let sent = false;

      if (this.atSMS && env.NODE_ENV !== 'test') {
        // Send SMS via Africa's Talking
        const response = await this.atSMS.send({
          to: [formattedPhone],
          message: message,
          from: env.AFRICASTALKING_SENDER_ID !== 'TENPATEN' ? env.AFRICASTALKING_SENDER_ID : undefined,
        });

        const recipientResponse = response.SMSMessageData.Recipients[0];
        if (recipientResponse && (recipientResponse.status === 'Success' || recipientResponse.status === 'Sent')) {
          sent = true;
        } else {
          console.error('SMS API returned unsuccessful response status:', recipientResponse);
        }
      } else {
        // Local developer fallback logger
        console.log(`📱 [MOCK SMS SENT]
Recipient: ${formattedPhone} (User ID: ${userId})
Message: "${message}"
--------------------------------------------------`);
        sent = true;
      }

      if (sent) {
        await prisma.notification.update({
          where: { id: notification.id },
          data: {
            status: NotificationStatus.sent,
            sentAt: new Date(),
          },
        });
        return true;
      } else {
        throw new Error('Africa\'s Talking API failed to dispatch message');
      }
    } catch (error: any) {
      console.error(`❌ Failed to send SMS to ${phone}:`, error.message || error);
      
      // Update notification as failed, increment retry count
      await prisma.notification.update({
        where: { id: notification.id },
        data: {
          status: NotificationStatus.failed,
          retryCount: { increment: 1 },
        },
      });
      return false;
    }
  }

  /**
   * Send absent SMS alert to parent
   */
  public async sendAbsentAlert(options: {
    schoolId: string;
    parentUserId: string;
    parentPhone: string;
    parentName: string;
    studentName: string;
    dateStr: string;
    periodStr?: string; // Optional: period attendance
  }): Promise<boolean> {
    const periodText = options.periodStr ? ` during ${options.periodStr}` : '';
    const message = `Tenpaten: Dear ${options.parentName}, please note that ${options.studentName} was marked ABSENT today (${options.dateStr})${periodText}. Please contact the school for any queries.`;

    return this.sendSms({
      schoolId: options.schoolId,
      userId: options.parentUserId,
      phone: options.parentPhone,
      message,
    });
  }

  /**
   * Send Fee Reminder SMS
   */
  public async sendFeeReminder(options: {
    schoolId: string;
    parentUserId: string;
    parentPhone: string;
    parentName: string;
    studentName: string;
    balance: number;
    termName: string;
  }): Promise<boolean> {
    const message = `Tenpaten SMS: Dear ${options.parentName}, a friendly reminder that the outstanding fees balance for ${options.studentName} for ${options.termName} is MK ${options.balance.toLocaleString()}. Please complete the payment.`;

    return this.sendSms({
      schoolId: options.schoolId,
      userId: options.parentUserId,
      phone: options.parentPhone,
      message,
    });
  }

  /**
   * Send Grade/Results published notification
   */
  public async sendResultsNotification(options: {
    schoolId: string;
    parentUserId: string;
    parentPhone: string;
    parentName: string;
    studentName: string;
    termName: string;
  }): Promise<boolean> {
    const message = `Tenpaten: Dear ${options.parentName}, academic results/report card for ${options.studentName} for ${options.termName} has been published. Please log in to view the performance details.`;

    return this.sendSms({
      schoolId: options.schoolId,
      userId: options.parentUserId,
      phone: options.parentPhone,
      message,
    });
  }

  /**
   * Send urgent announcements to parents or students
   */
  public async sendUrgentAnnouncement(options: {
    schoolId: string;
    userId: string;
    phone: string;
    title: string;
    body: string;
  }): Promise<boolean> {
    const cleanBody = options.body.length > 100 ? `${options.body.substring(0, 100)}...` : options.body;
    const message = `URGENT ANNOUNCEMENT: ${options.title} - ${cleanBody}`;

    return this.sendSms({
      schoolId: options.schoolId,
      userId: options.userId,
      phone: options.phone,
      message,
    });
  }
}

export const smsService = new SmsService();
