import nodemailer from 'nodemailer';
import { env } from '../config/env';

/**
 * Email Service
 * Handles password resets, system alerts, and notifications.
 * Uses SendGrid if SENDGRID_API_KEY is defined, or falls back to a local SMTP/Nodemailer mock in dev.
 */
class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    this.initTransporter();
  }

  private initTransporter() {
    if (env.RESEND_API_KEY) {
      // Resend transporter integration using Resend's SMTP gateway
      this.transporter = nodemailer.createTransport({
        host: 'smtp.resend.com',
        port: 587,
        auth: {
          user: 'resend',
          pass: env.RESEND_API_KEY,
        },
      });
      console.log('📬 Email Service: Configured Resend SMTP Transporter');
    } else {
      // Dev fallback: creates a mock local transporter or logs to console
      // Using ethereal.email or a simple logging transporter
      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
          user: 'mockuser@ethereal.email',
          pass: 'mockpass',
        },
      });
      console.log('📬 Email Service: Ethereal SMTP configured (Local Dev Stub)');
    }
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
      const mailOptions = {
        from: `"${env.EMAIL_FROM_NAME}" <${env.EMAIL_FROM}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text || 'Tenpaten SMS Notification',
      };

      if (!env.RESEND_API_KEY && env.NODE_ENV === 'development') {
        console.log(`✉️ [MOCK EMAIL SENT]
To: ${options.to}
Subject: ${options.subject}
Body Snippet: ${options.html.substring(0, 150)}...
--------------------------------------------------`);
        return true;
      }

      if (this.transporter) {
        await this.transporter.sendMail(mailOptions);
        return true;
      }

      console.error('Email transporter not initialized');
      return false;
    } catch (error) {
      console.error('❌ Failed to send email:', error);
      return false;
    }
  }

  /**
   * Send Welcome Email to Head Teacher / Staff
   */
  public async sendWelcomeEmail(options: {
    email: string;
    firstName: string;
    schoolName: string;
    schoolCode: string;
    tempPassword: string;
  }): Promise<boolean> {
    const loginUrl = `${env.FRONTEND_URL}/login`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #4f46e5; margin-bottom: 20px;">Welcome to Tenpaten SMS</h2>
        <p>Dear ${options.firstName},</p>
        <p>An account has been created for you at <strong>${options.schoolName}</strong> on the Tenpaten School Management System.</p>
        
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>School Code:</strong> <code style="background-color: #e5e7eb; padding: 2px 6px; border-radius: 4px;">${options.schoolCode}</code></p>
          <p style="margin: 5px 0;"><strong>Email Address:</strong> <code>${options.email}</code></p>
          <p style="margin: 5px 0;"><strong>Temporary Password:</strong> <code>${options.tempPassword}</code></p>
        </div>

        <p style="color: #ef4444; font-weight: bold;">Note: You will be required to change this password on your first login.</p>

        <div style="margin-top: 30px;">
          <a href="${loginUrl}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Log In to Tenpaten</a>
        </div>

        <hr style="border: none; border-top: 1px solid #e0e0e0; margin-top: 30px; margin-bottom: 20px;" />
        <p style="font-size: 12px; color: #6b7280; text-align: center;">
          Every class. Every day. Every child.<br/>
          Tenpaten SMS &bull; Private Secondary Schools Portal
        </p>
      </div>
    `;

    return this.sendEmail({
      to: options.email,
      subject: `Welcome to Tenpaten SMS — ${options.schoolName}`,
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
    const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${options.resetToken}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #4f46e5; margin-bottom: 20px;">Reset Your Password</h2>
        <p>Dear ${options.firstName},</p>
        <p>We received a request to reset the password for your Tenpaten account linked to school code <strong>${options.schoolCode}</strong>.</p>
        
        <p>Click the button below to set a new password. This link will expire in 1 hour.</p>

        <div style="margin-top: 30px; margin-bottom: 30px;">
          <a href="${resetUrl}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reset Password</a>
        </div>

        <p>If the button doesn't work, copy and paste this link in your browser:</p>
        <p style="word-break: break-all;"><a href="${resetUrl}">${resetUrl}</a></p>

        <p>If you did not request this password reset, please ignore this email. Your password will remain unchanged.</p>

        <hr style="border: none; border-top: 1px solid #e0e0e0; margin-top: 30px; margin-bottom: 20px;" />
        <p style="font-size: 12px; color: #6b7280; text-align: center;">
          Tenpaten SMS Support Team
        </p>
      </div>
    `;

    return this.sendEmail({
      to: options.email,
      subject: 'Reset Your Tenpaten SMS Password',
      html,
    });
  }
}

export const emailService = new EmailService();
