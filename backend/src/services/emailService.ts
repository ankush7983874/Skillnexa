import nodemailer, { Transporter } from 'nodemailer';
import { EmailLog } from '../models/EmailLog';

let activeTransporter: Transporter | null = null;
let etherealTransporter: Transporter | null = null;

const getEtherealTransporter = async (): Promise<Transporter> => {
  if (etherealTransporter) return etherealTransporter;
  try {
    const testAccount = await nodemailer.createTestAccount();
    etherealTransporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: { user: testAccount.user, pass: testAccount.pass },
    });
    console.log(`[EMAIL_SERVICE] Created Ethereal Sandbox fallback transport (${testAccount.user})`);
  } catch (err: any) {
    console.warn(`[EMAIL_SERVICE] Ethereal account creation fallback failed: ${err.message}`);
    etherealTransporter = nodemailer.createTransport({ jsonTransport: true });
  }
  return etherealTransporter;
};

const getGmailTransporter = (): Transporter => {
  if (activeTransporter) return activeTransporter;

  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;
  const user = process.env.SMTP_USER || 'skillnexa.official100@gmail.com';
  const pass = process.env.SMTP_PASS || process.env.SMTP_PASSWORD || '';

  if (pass.startsWith('PASTE_')) {
    console.warn(`[EMAIL_SERVICE] WARNING: SMTP_PASS contains placeholder "${pass}". Replace it in D:\\SkillNexa\\backend\\.env with your 16-character Google App Password for live Gmail delivery.`);
  }

  activeTransporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
    tls: { rejectUnauthorized: false },
  });

  console.log(`[EMAIL_SERVICE] Initialized Nodemailer Gmail SMTP transporter (${host}:${port}) for user ${user}`);
  return activeTransporter;
};

export const emailService = {
  verifySMTP: async () => {
    try {
      const transporter = getGmailTransporter();
      await transporter.verify();
      console.log(`[EMAIL_SERVICE] Gmail SMTP Transporter connection verified successfully (${process.env.SMTP_USER})`);
      return {
        success: true,
        isTestAccount: false,
        status: 'PROD_SMTP_CONNECTED',
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
      };
    } catch (err: any) {
      console.error(`[EMAIL_SERVICE] Gmail SMTP Transporter verification error: ${err.message}`);
      return {
        success: false,
        isTestAccount: false,
        status: 'SMTP_CONNECTION_FAILED',
        error: err.message,
      };
    }
  },

  sendEmail: async (
    to: string,
    subject: string,
    html: string,
    templateName: string,
    applicationId?: any,
    userId?: any
  ) => {
    console.log(`[EMAIL_SERVICE] OTP email sending started to recipient: "${to}" | Template: ${templateName}`);
    const from = process.env.SMTP_FROM || 'SkillNexa <skillnexa.official100@gmail.com>';

    // 1. Attempt primary Gmail SMTP
    try {
      const transporter = getGmailTransporter();
      const info = await transporter.sendMail({
        from,
        to,
        subject,
        html,
      });

      console.log(`[EMAIL_SERVICE] OTP email sent successfully to "${to}". Provider: Gmail SMTP | MessageID: ${info.messageId}`);

      await EmailLog.create({
        recipient: to,
        subject,
        template: templateName,
        applicationId,
        userId,
        status: 'SENT',
        sentAt: new Date(),
      });

      return { success: true, messageId: info.messageId };
    } catch (error: any) {
      console.warn(`[EMAIL_SERVICE] Primary Gmail SMTP failed for "${to}": ${error.message}`);

      // 2. Fallback to Ethereal sandbox transport if Gmail SMTP credentials are not yet updated
      try {
        console.log(`[EMAIL_SERVICE] Retrying with Ethereal Sandbox fallback transport...`);
        const fallbackTransporter = await getEtherealTransporter();
        const fallbackInfo = await fallbackTransporter.sendMail({
          from: 'SkillNexa Demo <no-reply@skillnexa.com>',
          to,
          subject,
          html,
        });

        const previewUrl = nodemailer.getTestMessageUrl(fallbackInfo) || undefined;
        console.log(`[EMAIL_SERVICE] Fallback email delivered to Ethereal Sandbox. MessageID: ${fallbackInfo.messageId} | Preview URL: ${previewUrl}`);

        await EmailLog.create({
          recipient: to,
          subject,
          template: templateName,
          applicationId,
          userId,
          status: 'SENT',
          sentAt: new Date(),
        });

        return { success: true, messageId: fallbackInfo.messageId, previewUrl };
      } catch (fallbackErr: any) {
        console.error(`[EMAIL_SERVICE] Both Gmail SMTP and Ethereal fallback failed for "${to}": ${fallbackErr.message}`);

        await EmailLog.create({
          recipient: to,
          subject,
          template: templateName,
          applicationId,
          userId,
          status: 'FAILED',
          error: error.message,
          sentAt: new Date(),
        });

        return { success: false, error: error.message };
      }
    }
  },

  sendStudentRegistrationOTP: async (to: string, otp: string, userId?: any) => {
    const subject = 'SkillNexa Registration Verification OTP';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #070710; color: #ffffff; padding: 30px; border-radius: 16px; border: 1px solid #7c3aed;">
        <h2 style="color: #a78bfa; text-align: center;">SkillNexa Student Registration Verification</h2>
        <p style="color: #cbd5e1; font-size: 14px;">Welcome to SkillNexa! Use the following 6-digit One-Time Password (OTP) code to complete your <strong>Student Account Registration</strong>:</p>
        <div style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: #ffffff; padding: 18px; text-align: center; font-size: 34px; font-weight: bold; letter-spacing: 8px; border-radius: 12px; margin: 24px 0;">
          ${otp}
        </div>
        <p style="color: #94a3b8; font-size: 13px;">This verification code is valid for <strong>5 minutes</strong>. If you did not initiate this registration request, please ignore this email.</p>
        <div style="background-color: #1e1b4b; border-left: 4px solid #a78bfa; padding: 12px; font-size: 12px; color: #c7d2fe; margin-top: 20px;">
          <strong>Security Notice:</strong> Never share your OTP with anyone. SkillNexa support staff will never ask for your verification code.
        </div>
        <hr style="border: 0; border-top: 1px solid #1e293b; margin: 24px 0;" />
        <p style="color: #64748b; font-size: 11px; text-align: center;">SkillNexa Talent & Intelligence Platform • skillnexa.official100@gmail.com</p>
      </div>
    `;
    return emailService.sendEmail(to, subject, html, 'STUDENT_REGISTRATION_OTP', undefined, userId);
  },

  sendStudentLoginOTP: async (to: string, otp: string, userId?: any) => {
    const subject = 'SkillNexa Login Verification OTP';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #070710; color: #ffffff; padding: 30px; border-radius: 16px; border: 1px solid #7c3aed;">
        <h2 style="color: #a78bfa; text-align: center;">SkillNexa Student Login Verification</h2>
        <p style="color: #cbd5e1; font-size: 14px;">Use the following 6-digit One-Time Password (OTP) code to complete your <strong>Student Account Login</strong>:</p>
        <div style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: #ffffff; padding: 18px; text-align: center; font-size: 34px; font-weight: bold; letter-spacing: 8px; border-radius: 12px; margin: 24px 0;">
          ${otp}
        </div>
        <p style="color: #94a3b8; font-size: 13px;">This login verification code is valid for <strong>5 minutes</strong> and can only be used once.</p>
        <div style="background-color: #1e1b4b; border-left: 4px solid #a78bfa; padding: 12px; font-size: 12px; color: #c7d2fe; margin-top: 20px;">
          <strong>Security Notice:</strong> If you did not attempt to log in to SkillNexa, someone may be attempting to access your account.
        </div>
        <hr style="border: 0; border-top: 1px solid #1e293b; margin: 24px 0;" />
        <p style="color: #64748b; font-size: 11px; text-align: center;">SkillNexa Talent & Intelligence Platform • skillnexa.official100@gmail.com</p>
      </div>
    `;
    return emailService.sendEmail(to, subject, html, 'STUDENT_LOGIN_OTP', undefined, userId);
  },

  sendCompanyRegistrationOTP: async (to: string, otp: string, userId?: any) => {
    const subject = 'SkillNexa Company Registration Verification OTP';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #070710; color: #ffffff; padding: 30px; border-radius: 16px; border: 1px solid #10b981;">
        <h2 style="color: #34d399; text-align: center;">SkillNexa Company Account Verification</h2>
        <p style="color: #cbd5e1; font-size: 14px;">Welcome to SkillNexa Recruiter Portal! Use the following 6-digit One-Time Password (OTP) code to complete your <strong>Company Account Registration</strong>:</p>
        <div style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); color: #ffffff; padding: 18px; text-align: center; font-size: 34px; font-weight: bold; letter-spacing: 8px; border-radius: 12px; margin: 24px 0;">
          ${otp}
        </div>
        <p style="color: #94a3b8; font-size: 13px;">This verification code is valid for <strong>5 minutes</strong>. If you did not initiate this company registration request, please ignore this email.</p>
        <div style="background-color: #064e3b; border-left: 4px solid #34d399; padding: 12px; font-size: 12px; color: #a7f3d0; margin-top: 20px;">
          <strong>Security Notice:</strong> Never share your OTP with anyone. SkillNexa support staff will never ask for your verification code.
        </div>
        <hr style="border: 0; border-top: 1px solid #1e293b; margin: 24px 0;" />
        <p style="color: #64748b; font-size: 11px; text-align: center;">SkillNexa Talent & Intelligence Platform • skillnexa.official100@gmail.com</p>
      </div>
    `;
    return emailService.sendEmail(to, subject, html, 'COMPANY_REGISTRATION_OTP', undefined, userId);
  },

  sendCompanyLoginOTP: async (to: string, otp: string, userId?: any) => {
    const subject = 'SkillNexa Company Login Verification OTP';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #070710; color: #ffffff; padding: 30px; border-radius: 16px; border: 1px solid #10b981;">
        <h2 style="color: #34d399; text-align: center;">SkillNexa Company Login Verification</h2>
        <p style="color: #cbd5e1; font-size: 14px;">Use the following 6-digit One-Time Password (OTP) code to complete your <strong>Company Account Login</strong>:</p>
        <div style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); color: #ffffff; padding: 18px; text-align: center; font-size: 34px; font-weight: bold; letter-spacing: 8px; border-radius: 12px; margin: 24px 0;">
          ${otp}
        </div>
        <p style="color: #94a3b8; font-size: 13px;">This login verification code is valid for <strong>5 minutes</strong> and can only be used once.</p>
        <div style="background-color: #064e3b; border-left: 4px solid #34d399; padding: 12px; font-size: 12px; color: #a7f3d0; margin-top: 20px;">
          <strong>Security Notice:</strong> If you did not attempt to log in to SkillNexa, someone may be attempting to access your company portal.
        </div>
        <hr style="border: 0; border-top: 1px solid #1e293b; margin: 24px 0;" />
        <p style="color: #64748b; font-size: 11px; text-align: center;">SkillNexa Talent & Intelligence Platform • skillnexa.official100@gmail.com</p>
      </div>
    `;
    return emailService.sendEmail(to, subject, html, 'COMPANY_LOGIN_OTP', undefined, userId);
  },

  sendPasswordResetOTP: async (to: string, otp: string, userId?: any) => {
    const subject = 'SkillNexa Password Reset OTP';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #070710; color: #ffffff; padding: 30px; border-radius: 16px; border: 1px solid #7c3aed;">
        <h2 style="color: #a78bfa; text-align: center;">SkillNexa Password Reset OTP</h2>
        <p style="color: #cbd5e1; font-size: 14px;">Hello,</p>
        <p style="color: #cbd5e1; font-size: 14px;">Your SkillNexa password reset OTP is:</p>
        <div style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: #ffffff; padding: 18px; text-align: center; font-size: 34px; font-weight: bold; letter-spacing: 8px; border-radius: 12px; margin: 24px 0;">
          ${otp}
        </div>
        <p style="color: #94a3b8; font-size: 13px;">This OTP will expire in <strong>10 minutes</strong>.</p>
        <p style="color: #94a3b8; font-size: 13px;">If you did not request a password reset, you can ignore this email.</p>
        <div style="background-color: #1e1b4b; border-left: 4px solid #a78bfa; padding: 12px; font-size: 12px; color: #c7d2fe; margin-top: 20px;">
          <strong>Security Notice:</strong> Never share your OTP with anyone. If you did not request this, your account remains safe.
        </div>
        <hr style="border: 0; border-top: 1px solid #1e293b; margin: 24px 0;" />
        <p style="color: #64748b; font-size: 11px; text-align: center;">Regards,<br /><strong>SkillNexa Team</strong></p>
      </div>
    `;
    return emailService.sendEmail(to, subject, html, 'PASSWORD_RESET_OTP', undefined, userId);
  },

  sendOTP: async (to: string, otp: string, purpose: 'LOGIN' | 'REGISTRATION' | 'PASSWORD_RESET' | 'COMPANY_REGISTRATION' | 'COMPANY_LOGIN', userId?: any) => {
    if (purpose === 'COMPANY_REGISTRATION') {
      return emailService.sendCompanyRegistrationOTP(to, otp, userId);
    } else if (purpose === 'COMPANY_LOGIN') {
      return emailService.sendCompanyLoginOTP(to, otp, userId);
    } else if (purpose === 'REGISTRATION') {
      return emailService.sendStudentRegistrationOTP(to, otp, userId);
    } else if (purpose === 'PASSWORD_RESET') {
      return emailService.sendPasswordResetOTP(to, otp, userId);
    } else {
      return emailService.sendStudentLoginOTP(to, otp, userId);
    }
  },

  sendCandidateSelected: async (to: string, studentName: string, companyName: string, jobTitle: string, applicationId: any, userId: any) => {
    const subject = `Congratulations! You have been selected for ${jobTitle} at ${companyName}`;
    const html = `<h3>Congratulations ${studentName}!</h3><p>You have been selected for the position of <strong>${jobTitle}</strong> at <strong>${companyName}</strong>.</p>`;
    return emailService.sendEmail(to, subject, html, 'CANDIDATE_SELECTED', applicationId, userId);
  },

  sendCandidateRejected: async (to: string, studentName: string, companyName: string, jobTitle: string, applicationId: any, userId: any) => {
    const subject = `Update regarding your application for ${jobTitle} at ${companyName}`;
    const html = `<p>Dear ${studentName},</p><p>Thank you for applying for ${jobTitle} at ${companyName}. Unfortunately, we will not be moving forward at this time.</p>`;
    return emailService.sendEmail(to, subject, html, 'CANDIDATE_REJECTED', applicationId, userId);
  },

  sendInterviewScheduled: async (
    to: string,
    studentName: string,
    companyName: string,
    jobTitle: string,
    date: any,
    time: string,
    type: string,
    locationLink: string,
    instructions: string,
    applicationId: any,
    userId: any
  ) => {
    const subject = `Interview Scheduled: ${jobTitle} at ${companyName}`;
    const html = `<p>Dear ${studentName},</p><p>An interview for <strong>${jobTitle}</strong> has been scheduled for ${date} at ${time} (${type}).</p><p>${locationLink}</p>`;
    return emailService.sendEmail(to, subject, html, 'INTERVIEW_SCHEDULED', applicationId, userId);
  },

  sendInterviewRescheduled: async (
    to: string,
    studentName: string,
    companyName: string,
    jobTitle: string,
    date: any,
    time: string,
    type: string,
    locationLink: string,
    instructions: string,
    applicationId: any,
    userId: any
  ) => {
    const subject = `Interview Rescheduled: ${jobTitle} at ${companyName}`;
    const html = `<p>Dear ${studentName},</p><p>Your interview for <strong>${jobTitle}</strong> has been rescheduled to ${date} at ${time} (${type}).</p>`;
    return emailService.sendEmail(to, subject, html, 'INTERVIEW_RESCHEDULED', applicationId, userId);
  },

  sendInterviewCancelled: async (to: string, studentName: string, companyName: string, jobTitle: string, applicationId: any, userId: any) => {
    const subject = `Interview Cancelled: ${jobTitle} at ${companyName}`;
    const html = `<p>Dear ${studentName},</p><p>Your interview for <strong>${jobTitle}</strong> has been cancelled.</p>`;
    return emailService.sendEmail(to, subject, html, 'INTERVIEW_CANCELLED', applicationId, userId);
  },

  sendNewJobNotification: async (to: string, studentName: string, companyName: string, jobTitle: string, jobId: any, userId?: any) => {
    const subject = `New Job Opportunity: ${jobTitle} at ${companyName}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #070710; color: #ffffff; padding: 24px; border-radius: 12px; border: 1px solid #4f46e5;">
        <h2 style="color: #818cf8;">New Job Opportunity Posted!</h2>
        <p style="color: #cbd5e1;">Dear ${studentName},</p>
        <p style="color: #cbd5e1;"><strong>${companyName}</strong> (which you follow) has published a new job opening:</p>
        <div style="background-color: #1e1b4b; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <h3 style="color: #a78bfa; margin: 0 0 8px 0;">${jobTitle}</h3>
          <p style="color: #94a3b8; margin: 0; font-size: 13px;">Company: ${companyName}</p>
        </div>
        <p style="color: #cbd5e1; font-size: 13px;">Log in to your SkillNexa dashboard to view details and apply.</p>
      </div>
    `;
    return emailService.sendEmail(to, subject, html, 'NEW_JOB_POSTED', undefined, userId);
  },

  sendStrongMatchNotification: async (to: string, studentName: string, companyName: string, jobTitle: string, matchScore: number, jobId: any, userId?: any) => {
    const subject = `AI Strong Match Opportunity: ${matchScore}% match for ${jobTitle}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #070710; color: #ffffff; padding: 24px; border-radius: 12px; border: 1px solid #10b981;">
        <h2 style="color: #34d399;">AI Match Compatibility Alert (${matchScore}%)</h2>
        <p style="color: #cbd5e1;">Dear ${studentName},</p>
        <p style="color: #cbd5e1;">Your profile has achieved a strong <strong>${matchScore}% AI Compatibility Match</strong> with a new opportunity:</p>
        <div style="background-color: #064e3b; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <h3 style="color: #a7f3d0; margin: 0 0 8px 0;">${jobTitle}</h3>
          <p style="color: #6ee7b7; margin: 0; font-size: 13px;">Company: ${companyName} | Match: ${matchScore}%</p>
        </div>
        <p style="color: #cbd5e1; font-size: 13px;">Review the explainable match breakdown on your SkillNexa Job Recommendations dashboard.</p>
      </div>
    `;
    return emailService.sendEmail(to, subject, html, 'STRONG_AI_MATCH', undefined, userId);
  },

  sendCandidateShortlistedNotification: async (to: string, studentName: string, companyName: string, jobTitle: string, applicationId: any, userId?: any) => {
    const subject = `Congratulations! Shortlisted by ${companyName} for ${jobTitle}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #070710; color: #ffffff; padding: 24px; border-radius: 12px; border: 1px solid #8b5cf6;">
        <h2 style="color: #c084fc;">Application Shortlisted!</h2>
        <p style="color: #cbd5e1;">Dear ${studentName},</p>
        <p style="color: #cbd5e1;">Great news! <strong>${companyName}</strong> has reviewed your application and shortlisted you for the <strong>${jobTitle}</strong> position.</p>
        <p style="color: #94a3b8; font-size: 13px;">Stay tuned for interview schedule updates in your SkillNexa Notifications.</p>
      </div>
    `;
    return emailService.sendEmail(to, subject, html, 'CANDIDATE_SHORTLISTED', applicationId, userId);
  },

  sendOfferLetterReceivedNotification: async (to: string, studentName: string, companyName: string, jobTitle: string, offerDetails: any, userId?: any) => {
    const subject = `Official Job Offer Letter from ${companyName}!`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #070710; color: #ffffff; padding: 24px; border-radius: 12px; border: 1px solid #10b981;">
        <h2 style="color: #34d399;">Congratulations on your Job Offer! 🎉</h2>
        <p style="color: #cbd5e1;">Dear ${studentName},</p>
        <p style="color: #cbd5e1;"><strong>${companyName}</strong> has issued an official Job Offer for the role of <strong>${jobTitle}</strong>.</p>
        <div style="background-color: #064e3b; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p style="margin: 4px 0; color: #a7f3d0;">Role: <strong>${jobTitle}</strong></p>
          <p style="margin: 4px 0; color: #a7f3d0;">CTC Package: <strong>${offerDetails?.salary || offerDetails?.ctcLpa || 'Competitive'}</strong></p>
          ${offerDetails?.joiningDate ? `<p style="margin: 4px 0; color: #a7f3d0;">Joining Date: <strong>${new Date(offerDetails.joiningDate).toLocaleDateString()}</strong></p>` : ''}
        </div>
        <p style="color: #cbd5e1; font-size: 13px;">Log in to your SkillNexa account to view the offer letter and respond.</p>
      </div>
    `;
    return emailService.sendEmail(to, subject, html, 'OFFER_LETTER_RECEIVED', undefined, userId);
  },
};

