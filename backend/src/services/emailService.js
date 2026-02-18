// src/services/emailService.js
const nodemailer = require('nodemailer');
const { getMaxListeners } = require('../models/User');

/**
 * Email service for sending OTP and other notifications
 */
class EmailService {
  constructor() {
    this.isConfigured = false;
    this.transporter = null;
    
    // Check if email credentials are properly configured
    const emailUser = process.env.EMAIL_USER;
    const emailPassword = process.env.EMAIL_PASSWORD;
    
    if (!emailUser || !emailPassword || emailUser.includes('your-email') || (emailPassword && emailPassword.includes('your-app'))) {
      console.warn('⚠️  Email service not properly configured.');
      console.warn('   Please set EMAIL_USER and EMAIL_PASSWORD in .env file.');
      console.warn('   Use Gmail App Password (16+ characters), not your regular Gmail password.');
      console.warn('   Setup guide: https://support.google.com/accounts/answer/185833');
      return;
    }
    
    // Configure transporter (using Gmail or your email provider)
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPassword
      }
    });
    
    this.isConfigured = true;
  }

  /**
   * Send OTP email to user
   * @param {string} email - User's email address
   * @param {string} otp - 6-digit OTP
   * @param {string} username - User's username
   * @returns {Promise<boolean>}
   */
  async sendOTPEmail(email, otp, username) {
    try {
      // Check if email service is configured
      if (!this.isConfigured || !this.transporter) {
        console.warn('⚠️  Email service not configured. OTP email will not be sent.');
        console.warn('   OTP for testing: ' + otp);
        return { success: false, code: 'NOT_CONFIGURED', message: 'Email service not configured' };
      }

      // Validate Gmail
      if (!email.toLowerCase().endsWith('@gmail.com')) {
        return { success: false, code: 'INVALID_EMAIL_PROVIDER', message: 'Only Gmail accounts are currently supported' };
      }

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Your OTP for Email Verification',
        html: `
          <div style="font-family: Arial, sans-serif; margin: 20px; color: #333;">
            <h2 style="color: #2c3e50;">Welcome, ${username}!</h2>
            <p>Thank you for signing up. To complete your email verification, please use the following OTP:</p>
            
            <div style="background-color: #f0f0f0; padding: 20px; margin: 20px 0; border-radius: 8px; text-align: center;">
              <h1 style="letter-spacing: 10px; color: #2c3e50; margin: 0;">${otp}</h1>
            </div>
            
            <p><strong>This OTP is valid for 10 minutes.</strong></p>
            
            <p style="color: #7f8c8d;">If you did not request this OTP, please ignore this email.</p>
            
            <hr style="border: none; border-top: 1px solid #ecf0f1;">
            <p style="font-size: 12px; color: #95a5a6;">
              This is an automated email from IDE Code Editor. Please do not reply to this email.
            </p>
          </div>
        `
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ OTP email sent successfully:', info.messageId);
      return { success: true, info };
    } catch (error) {
      console.error('❌ Error sending OTP email:', error && error.message ? error.message : error);
      // Return error details so caller can react differently to auth errors
      return { success: false, code: error && error.code ? error.code : 'SEND_ERROR', message: error && error.message ? error.message : String(error) };
    }
  }

  /**
   * Verify transporter connection
   * @returns {Promise<boolean>}
   */
  async verifyConnection() {
    try {
      if (!this.transporter) {
        console.warn('⚠️  Email service not configured');
        return false;
      }
      await this.transporter.verify();
      console.log('✅ Email service connected successfully');
      return true;
    } catch (error) {
      console.error('❌ Email service connection failed:', error.message);
      return false;
    }
  }
}

module.exports = new EmailService();
