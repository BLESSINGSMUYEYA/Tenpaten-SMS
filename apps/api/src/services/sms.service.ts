import africastalking from 'africastalking';
import { env } from '../config/env';

interface SendSmsOptions {
  to: string; // Recipient phone number
  message: string;
}

class SmsService {
  private client: any = null;
  private sms: any = null;

  constructor() {
    this.initialize();
  }

  private initialize() {
    const apiKey = env.AFRICASTALKING_API_KEY;
    const username = env.AFRICASTALKING_USERNAME;

    if (apiKey && username) {
      try {
        this.client = africastalking({
          apiKey,
          username,
        });
        this.sms = this.client.SMS;
        console.log(`[SMS Service] Initialized with username: ${username}`);
      } catch (err) {
        console.error("[SMS Service] Failed to initialize Africa's Talking SDK:", err);
      }
    } else {
      console.log('[SMS Service] Running in local log mode (no API key provided).');
    }
  }

  /**
   * Send an SMS to a single recipient
   */
  public async sendSms(options: SendSmsOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const { to, message } = options;
    const senderId = env.AFRICASTALKING_SENDER_ID || 'MYKLASI';

    // Normalize phone number to Malawian country code format (+265)
    let formattedPhone = to.trim();
    if (formattedPhone.startsWith('0')) {
      formattedPhone = `+265${formattedPhone.slice(1)}`;
    } else if (!formattedPhone.startsWith('+') && formattedPhone.length === 9) {
      formattedPhone = `+265${formattedPhone}`;
    }

    console.log(`[SMS Outbox] To: ${formattedPhone} | Message: "${message}"`);

    if (this.sms) {
      try {
        const result = await this.sms.send({
          to: [formattedPhone],
          message,
          from: env.AFRICASTALKING_USERNAME === 'sandbox' ? undefined : senderId,
        });

        console.log('[SMS Dispatch Success] Africa\'s Talking response:', JSON.stringify(result));
        return { success: true, messageId: result.SMSMessageData?.Recipients?.[0]?.messageId };
      } catch (err: any) {
        console.error('[SMS Dispatch Failed] Africa\'s Talking error:', err);
        return { success: false, error: err.message || 'Failed to send SMS' };
      }
    } else {
      console.log(`[SMS Simulation] Local mock SMS sent to ${formattedPhone}`);
      return { success: true, messageId: `mock-sms-id-${Date.now()}` };
    }
  }
}

export const smsService = new SmsService();
export default smsService;
