import nodemailer from 'nodemailer';
import env from '../config/env.config.js';

class MailService {
  constructor() {
    this.transporter = null;
    if (env.MAIL_SMTP_HOST && env.MAIL_SMTP_USER && env.MAIL_SMTP_PASS) {
      this.transporter = nodemailer.createTransport({
        host: env.MAIL_SMTP_HOST,
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: env.MAIL_SMTP_USER,
          pass: env.MAIL_SMTP_PASS,
        },
      });
    }
  }

  async sendMail({ to, subject, text, html }) {
    if (this.transporter) {
      try {
        const info = await this.transporter.sendMail({
          from: `"Identiqal" <${env.MAIL_SMTP_USER}>`,
          to,
          subject,
          text,
          html,
        });
        return info;
      } catch (error) {
        console.error(`Mail sending failed: ${error.message}`);
        throw new Error(`Email delivery failed: ${error.message}`);
      }
    } else {
      console.log(`[Mock Mail] Sent to: ${to} | Subject: ${subject}`);
      console.log(`[Mock Mail Text]: ${text}`);
      return { messageId: 'mock-id-' + Date.now() };
    }
  }

  async sendInviteEmail(email, orgName, inviteLink) {
    const subject = `You've been invited to join ${orgName} on Identiqal!`;
    const text = `Join your team workspace on Identiqal here: ${inviteLink}`;
    const html = `<p>You've been invited to join the <strong>${orgName}</strong> team workspace on Identiqal.</p>
                  <p><a href="${inviteLink}">Click here to accept the invitation</a></p>`;
    return this.sendMail({ to: email, subject, text, html });
  }
}

export default new MailService();
