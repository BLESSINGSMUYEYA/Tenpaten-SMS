import { Resend } from 'resend';
import { env } from '../config/env';

/**
 * Email Service
 * Handles password resets, welcome emails, system alerts, and notifications.
 * Uses the Resend SDK when RESEND_API_KEY is defined, otherwise logs to console in dev.
 */
class EmailService {
  private resend: Resend | null = null;

  constructor() {
    if (env.RESEND_API_KEY) {
      this.resend = new Resend(env.RESEND_API_KEY);
      console.log('📬 Email Service: Configured Resend SDK');
    } else {
      console.log('📬 Email Service: No RESEND_API_KEY — emails will be logged to console');
    }
  }

  /**
   * Normalise the base URL so it never ends with a trailing slash.
   * This avoids double-slash URLs like `https://myklasi.online//reset-password`.
   */
  private baseUrl(): string {
    return env.FRONTEND_URL.replace(/\/+$/, '');
  }

  /**
   * Send a system email
   */
  public async sendEmail(options: {
    to: string;
    subject: string;
    html: string;
    text?: string;
  }): Promise<boolean> {
    try {
      // Dev fallback — log to console when no API key is configured
      if (!this.resend) {
        console.log(`✉️ [MOCK EMAIL — No Resend API Key]
To: ${options.to}
Subject: ${options.subject}
Body Snippet: ${options.html.substring(0, 200)}...
--------------------------------------------------`);
        return true;
      }

      const { data, error } = await this.resend.emails.send({
        from: `${env.EMAIL_FROM_NAME} <${env.EMAIL_FROM}>`,
        to: [options.to],
        subject: options.subject,
        html: options.html,
        text: options.text || undefined,
      });

      if (error) {
        console.error('❌ Resend API error:', error);
        return false;
      }

      console.log(`✅ Email sent to ${options.to} (ID: ${data?.id})`);
      return true;
    } catch (error) {
      console.error('❌ Failed to send email:', error);
      return false;
    }
  }

  /**
   * Send Welcome Email to Head Teacher / Staff / Parent
   */
  public async sendWelcomeEmail(options: {
    email: string;
    firstName: string;
    schoolName: string;
    schoolCode: string;
    tempPassword: string;
  }): Promise<boolean> {
    const loginUrl = `${this.baseUrl()}/login`;
    const html = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #4f46e5, #7c3aed); padding: 32px 24px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">Welcome to MyKlasi</h1>
          <p style="color: #e0e7ff; margin: 8px 0 0; font-size: 14px;">Every class. Every day. Every child.</p>
        </div>
        <div style="padding: 32px 24px;">
          <p style="font-size: 16px; color: #1f2937;">Dear ${options.firstName},</p>
          <p style="font-size: 15px; color: #4b5563; line-height: 1.6;">
            An account has been created for you at <strong>${options.schoolName}</strong> on the MyKlasi School Management System.
          </p>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 24px 0; border-left: 4px solid #4f46e5;">
            <p style="margin: 6px 0; font-size: 14px; color: #374151;"><strong>School Code:</strong> <code style="background-color: #e5e7eb; padding: 2px 8px; border-radius: 4px; font-family: 'Courier New', monospace;">${options.schoolCode}</code></p>
            <p style="margin: 6px 0; font-size: 14px; color: #374151;"><strong>Email Address:</strong> <code style="font-family: 'Courier New', monospace;">${options.email}</code></p>
            <p style="margin: 6px 0; font-size: 14px; color: #374151;"><strong>Temporary Password:</strong> <code style="background-color: #fef2f2; padding: 2px 8px; border-radius: 4px; color: #dc2626; font-family: 'Courier New', monospace;">${options.tempPassword}</code></p>
          </div>

          <p style="color: #dc2626; font-weight: 600; font-size: 14px;">⚠️ You will be required to change this password on your first login.</p>

          <div style="margin-top: 32px; text-align: center;">
            <a href="${loginUrl}" style="background: linear-gradient(135deg, #4f46e5, #7c3aed); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 700; display: inline-block; font-size: 15px;">Log In to MyKlasi</a>
          </div>
        </div>
        <div style="padding: 20px 24px; background-color: #f9fafb; border-top: 1px solid #e5e7eb; text-align: center;">
          <p style="font-size: 12px; color: #9ca3af; margin: 0;">
            MyKlasi SMS &bull; Private Secondary Schools Portal<br/>
            <a href="${this.baseUrl()}" style="color: #6366f1; text-decoration: none;">${this.baseUrl()}</a>
          </p>
        </div>
      </div>
    `;

    return this.sendEmail({
      to: options.email,
      subject: `Welcome to MyKlasi — ${options.schoolName}`,
      html,
    });
  }

  /**
   * Send Password Reset Link
   */
  public async sendPasswordResetEmail(options: {
    email: string;
    firstName: string;
    schoolCode: string;
    resetToken: string;
  }): Promise<boolean> {
    const resetUrl = `${this.baseUrl()}/reset-password?token=${options.resetToken}`;
    const html = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #dc2626, #ef4444); padding: 32px 24px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">Reset Your Password</h1>
        </div>
        <div style="padding: 32px 24px;">
          <p style="font-size: 16px; color: #1f2937;">Dear ${options.firstName},</p>
          <p style="font-size: 15px; color: #4b5563; line-height: 1.6;">
            We received a request to reset the password for your MyKlasi account linked to school code <strong>${options.schoolCode}</strong>.
          </p>
          
          <p style="font-size: 15px; color: #4b5563; line-height: 1.6;">
            Click the button below to set a new password. This link will expire in <strong>1 hour</strong>.
          </p>

          <div style="margin: 32px 0; text-align: center;">
            <a href="${resetUrl}" style="background: linear-gradient(135deg, #4f46e5, #7c3aed); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 700; display: inline-block; font-size: 15px;">Reset Password</a>
          </div>

          <p style="font-size: 13px; color: #6b7280;">If the button doesn't work, copy and paste this link in your browser:</p>
          <p style="word-break: break-all; font-size: 13px;"><a href="${resetUrl}" style="color: #4f46e5;">${resetUrl}</a></p>

          <div style="margin-top: 24px; padding: 16px; background-color: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
            <p style="margin: 0; font-size: 13px; color: #92400e;">
              🔒 If you did not request this password reset, please ignore this email. Your password will remain unchanged.
            </p>
          </div>
        </div>
        <div style="padding: 20px 24px; background-color: #f9fafb; border-top: 1px solid #e5e7eb; text-align: center;">
          <p style="font-size: 12px; color: #9ca3af; margin: 0;">
            MyKlasi SMS Support Team<br/>
            <a href="${this.baseUrl()}" style="color: #6366f1; text-decoration: none;">${this.baseUrl()}</a>
          </p>
        </div>
      </div>
    `;

    return this.sendEmail({
      to: options.email,
      subject: 'Reset Your MyKlasi Password',
      html,
    });
  }
}

export const emailService = new EmailService();
