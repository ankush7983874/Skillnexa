import { Request, Response } from 'express';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { User, IUser } from '../models/User';
import { Student } from '../models/Student';
import { Company } from '../models/Company';
import { Faculty } from '../models/Faculty';
import { Institution } from '../models/Institution';
import { OtpLog } from '../models/OtpLog';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { generateToken } from '../utils/jwtUtils';
import { captchaService } from '../utils/captcha';
import { emailService } from '../services/emailService';
import { auditService } from '../services/auditService';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
} from '../validators/authValidator';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

export const getCaptcha = async (req: Request, res: Response) => {
  const challenge = captchaService.generate();
  return res.status(200).json(ApiResponse.success('CAPTCHA challenge generated', challenge));
};

export const getSmtpStatus = async (req: Request, res: Response) => {
  const status = await emailService.verifySMTP();
  return res.status(200).json(ApiResponse.success('SMTP Health Status', status));
};

// ------------------------------------------------------------------
// STUDENT REGISTRATION OTP WORKFLOW (MANDATORY OTP)
// ------------------------------------------------------------------

export const requestStudentRegistrationOtp = async (req: Request, res: Response) => {
  const { name, email, password, phone, college, branch, cgpa, passoutYear, captchaToken, captchaAnswer } = req.body;

  if (!email || !name || !password) {
    throw ApiError.badRequest('Name, Email, and Password are required for registration.');
  }

  // 1. Verify CAPTCHA Server-Side
  const isCaptchaValid = captchaService.verify(captchaToken, captchaAnswer);
  if (!isCaptchaValid) {
    await auditService.log({ action: 'REGISTRATION_OTP_FAILED_CAPTCHA', result: 'FAILURE', metadata: { email }, req });
    throw ApiError.badRequest('CAPTCHA verification failed. Please solve the security question and try again.');
  }

  const normalizedEmail = email.toLowerCase().trim();

  // 2. Check if account already exists
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    throw ApiError.badRequest('An account with this email address already exists. Please login.');
  }

  // 3. Rate Limit / Cooldown / Lockout Check for REGISTRATION purpose
  let otpLog = await OtpLog.findOne({ email: normalizedEmail, purpose: 'REGISTRATION' });
  if (otpLog) {
    if (otpLog.lockedUntil && otpLog.lockedUntil.getTime() > Date.now()) {
      const waitMin = Math.ceil((otpLog.lockedUntil.getTime() - Date.now()) / 60000);
      throw ApiError.badRequest(`Too many verification attempts. Registration locked. Please wait ${waitMin} minutes.`);
    }

    if (otpLog.resendAvailableAt && otpLog.resendAvailableAt.getTime() > Date.now()) {
      const waitSec = Math.ceil((otpLog.resendAvailableAt.getTime() - Date.now()) / 1000);
      throw ApiError.badRequest(`Please wait ${waitSec} seconds before requesting another code.`);
    }
  }

  // 4. Pre-hash password before temporary storage
  const hashedPassword = await bcrypt.hash(password, 10);

  // 5. Generate 6-digit OTP
  const rawOtp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpHash = crypto.createHash('sha256').update(rawOtp).digest('hex');
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
  const resendAvailableAt = new Date(Date.now() + 60 * 1000); // 60s cooldown

  const registrationPayload = {
    name,
    email: normalizedEmail,
    hashedPassword,
    college: college || '',
    branch: branch || '',
    cgpa: cgpa || '',
    passoutYear: passoutYear || '',
    phone: phone || '',
  };

  if (otpLog) {
    otpLog.otpHash = otpHash;
    otpLog.expiresAt = expiresAt;
    otpLog.resendAvailableAt = resendAvailableAt;
    otpLog.attempts = 0;
    otpLog.isVerified = false;
    otpLog.registrationPayload = registrationPayload;
    await otpLog.save();
  } else {
    await OtpLog.create({
      email: normalizedEmail,
      otpHash,
      purpose: 'REGISTRATION',
      expiresAt,
      resendAvailableAt,
      attempts: 0,
      isVerified: false,
      registrationPayload,
    });
  }

  // 6. Deliver OTP via Gmail SMTP (sendStudentRegistrationOTP)
  await emailService.sendStudentRegistrationOTP(normalizedEmail, rawOtp);
  await auditService.log({ action: 'REGISTRATION_OTP_REQUESTED', result: 'SUCCESS', metadata: { email: normalizedEmail }, req });

  const emailParts = normalizedEmail.split('@');
  const obfuscatedEmail = `${emailParts[0].substring(0, 2)}***@${emailParts[1]}`;

  return res.status(200).json(
    ApiResponse.success('Verification code sent to your email.', {
      email: normalizedEmail,
      obfuscatedEmail,
      expiresIn: '5 minutes',
      resendCooldownSeconds: 60,
    })
  );
};

export const verifyStudentRegistrationOtp = async (req: Request, res: Response) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    throw ApiError.badRequest('Email and OTP code are required.');
  }

  const normalizedEmail = email.toLowerCase().trim();
  const otpLog = await OtpLog.findOne({ email: normalizedEmail, purpose: 'REGISTRATION' });

  if (!otpLog) {
    throw ApiError.badRequest('Email verification is required before account creation. Please request a new code.');
  }

  if (otpLog.lockedUntil && otpLog.lockedUntil.getTime() > Date.now()) {
    throw ApiError.badRequest('Too many verification attempts. Please request a new code.');
  }

  if (otpLog.expiresAt.getTime() < Date.now()) {
    throw ApiError.badRequest('Verification code has expired. Please request a new code.');
  }

  const providedHash = crypto.createHash('sha256').update(otp.toString().trim()).digest('hex');

  if (providedHash !== otpLog.otpHash) {
    otpLog.attempts += 1;
    if (otpLog.attempts >= otpLog.maxAttempts) {
      otpLog.lockedUntil = new Date(Date.now() + 15 * 60 * 1000);
    }
    await otpLog.save();

    await auditService.log({ action: 'REGISTRATION_OTP_VERIFY_FAILED', result: 'FAILURE', metadata: { email: normalizedEmail, attempts: otpLog.attempts }, req });
    throw ApiError.badRequest(`Invalid verification code. ${otpLog.maxAttempts - otpLog.attempts} attempts remaining.`);
  }

  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    throw ApiError.badRequest('An account with this email address already exists.');
  }

  otpLog.isVerified = true;
  otpLog.verifiedAt = new Date();
  await otpLog.save();

  const payload = otpLog.registrationPayload || {};

  const user = await User.create({
    name: payload.name || normalizedEmail.split('@')[0],
    email: normalizedEmail,
    password: payload.hashedPassword || (await bcrypt.hash(crypto.randomBytes(16).toString('hex'), 10)),
    role: 'STUDENT',
    phone: payload.phone || '',
    isEmailVerified: true,
    companyVerificationStatus: 'VERIFIED',
  });

  const student = await Student.create({
    user: user._id,
    college: payload.college || '',
    branch: payload.branch || '',
    cgpa: payload.cgpa ? parseFloat(payload.cgpa) : undefined,
    passoutYear: payload.passoutYear ? parseInt(payload.passoutYear, 10) : undefined,
  });

  const token = generateToken(user._id.toString(), user.role);

  const userResponse = user.toObject();
  delete userResponse.password;

  await auditService.log({ userId: user._id, role: 'STUDENT', action: 'STUDENT_REGISTRATION_VERIFIED_SUCCESS', result: 'SUCCESS', req });

  return res.status(201).json(
    ApiResponse.success('Student account created and verified successfully.', {
      user: userResponse,
      profile: student,
      token,
    })
  );
};

// ------------------------------------------------------------------
// STUDENT LOGIN OTP WORKFLOW (MANDATORY OTP AFTER PASSWORD)
// ------------------------------------------------------------------

export const requestStudentOtp = async (req: Request, res: Response) => {
  const { email, password, captchaToken, captchaAnswer } = req.body;

  if (!email) {
    throw ApiError.badRequest('Email is required.');
  }

  const isCaptchaValid = captchaService.verify(captchaToken, captchaAnswer);
  if (!isCaptchaValid) {
    await auditService.log({ action: 'LOGIN_OTP_FAILED_CAPTCHA', result: 'FAILURE', metadata: { email }, req });
    throw ApiError.badRequest('CAPTCHA verification failed. Please solve the security question and try again.');
  }

  const normalizedEmail = email.toLowerCase().trim();

  const user = await User.findOne({ email: normalizedEmail }).select('+password');
  if (!user) {
    throw ApiError.unauthorized('Invalid email or password.');
  }

  if (user.role !== 'STUDENT') {
    throw ApiError.badRequest(`An account with role ${user.role} exists with this email. Please use standard login.`);
  }

  if (password) {
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      await auditService.log({ userId: user._id, role: 'STUDENT', action: 'LOGIN_PASSWORD_FAILED', result: 'FAILURE', req });
      throw ApiError.unauthorized('Invalid email or password.');
    }
  }

  if (!user.isActive) {
    throw ApiError.forbidden('Your account has been deactivated. Please contact support.');
  }

  let otpLog = await OtpLog.findOne({ email: normalizedEmail, purpose: 'LOGIN' });
  if (otpLog) {
    if (otpLog.lockedUntil && otpLog.lockedUntil.getTime() > Date.now()) {
      const waitMin = Math.ceil((otpLog.lockedUntil.getTime() - Date.now()) / 60000);
      throw ApiError.badRequest(`Account temporarily locked due to failed attempts. Please wait ${waitMin} minutes.`);
    }

    if (otpLog.resendAvailableAt && otpLog.resendAvailableAt.getTime() > Date.now()) {
      const waitSec = Math.ceil((otpLog.resendAvailableAt.getTime() - Date.now()) / 1000);
      throw ApiError.badRequest(`Please wait ${waitSec} seconds before requesting another code.`);
    }
  }

  const rawOtp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpHash = crypto.createHash('sha256').update(rawOtp).digest('hex');
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
  const resendAvailableAt = new Date(Date.now() + 60 * 1000);

  if (otpLog) {
    otpLog.otpHash = otpHash;
    otpLog.expiresAt = expiresAt;
    otpLog.resendAvailableAt = resendAvailableAt;
    otpLog.attempts = 0;
    otpLog.isVerified = false;
    await otpLog.save();
  } else {
    await OtpLog.create({
      email: normalizedEmail,
      otpHash,
      purpose: 'LOGIN',
      expiresAt,
      resendAvailableAt,
      attempts: 0,
      isVerified: false,
    });
  }

  await emailService.sendStudentLoginOTP(normalizedEmail, rawOtp, user._id);
  await auditService.log({ userId: user._id, role: 'STUDENT', action: 'LOGIN_OTP_REQUESTED', result: 'SUCCESS', req });

  const emailParts = normalizedEmail.split('@');
  const obfuscatedEmail = `${emailParts[0].substring(0, 2)}***@${emailParts[1]}`;

  return res.status(200).json(
    ApiResponse.success('Verification code sent to your email.', {
      email: normalizedEmail,
      obfuscatedEmail,
      expiresIn: '5 minutes',
      resendCooldownSeconds: 60,
    })
  );
};

export const verifyStudentOtp = async (req: Request, res: Response) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    throw ApiError.badRequest('Email and OTP code are required.');
  }

  const normalizedEmail = email.toLowerCase().trim();
  const otpLog = await OtpLog.findOne({ email: normalizedEmail, purpose: 'LOGIN' });

  if (!otpLog) {
    throw ApiError.badRequest('Email verification is required to complete login. Please request a new code.');
  }

  if (otpLog.lockedUntil && otpLog.lockedUntil.getTime() > Date.now()) {
    throw ApiError.badRequest('Too many verification attempts. Account locked. Try again later.');
  }

  if (otpLog.expiresAt.getTime() < Date.now()) {
    throw ApiError.badRequest('Verification code has expired. Please request a new code.');
  }

  const providedHash = crypto.createHash('sha256').update(otp.toString().trim()).digest('hex');

  if (providedHash !== otpLog.otpHash) {
    otpLog.attempts += 1;
    if (otpLog.attempts >= otpLog.maxAttempts) {
      otpLog.lockedUntil = new Date(Date.now() + 15 * 60 * 1000);
    }
    await otpLog.save();

    await auditService.log({ action: 'LOGIN_OTP_VERIFY_FAILED', result: 'FAILURE', metadata: { email: normalizedEmail, attempts: otpLog.attempts }, req });
    throw ApiError.badRequest(`Invalid verification code. ${otpLog.maxAttempts - otpLog.attempts} attempts remaining.`);
  }

  otpLog.isVerified = true;
  otpLog.verifiedAt = new Date();
  await otpLog.save();

  const user = await User.findOne({ email: normalizedEmail });
  if (!user) {
    throw ApiError.notFound('Student account not found.');
  }

  if (!user.isActive) {
    throw ApiError.forbidden('Student account is deactivated. Contact administrator.');
  }

  user.isEmailVerified = true;
  await user.save();

  const token = generateToken(user._id.toString(), user.role);

  const userResponse = user.toObject();
  delete userResponse.password;

  await auditService.log({ userId: user._id, role: 'STUDENT', action: 'STUDENT_OTP_LOGIN_SUCCESS', result: 'SUCCESS', req });

  return res.status(200).json(
    ApiResponse.success('Student login successful.', {
      user: userResponse,
      token,
    })
  );
};

// ------------------------------------------------------------------
// COMPANY REGISTRATION OTP WORKFLOW (MANDATORY OTP)
// ------------------------------------------------------------------

export const requestCompanyRegistrationOtp = async (req: Request, res: Response) => {
  const { name, companyName, email, password, phone, website, industry, companySize, description, location, registrationNumber, captchaToken, captchaAnswer } = req.body;

  if (!email || (!name && !companyName) || !password) {
    throw ApiError.badRequest('Company Name / HR Name, Official Email, and Password are required.');
  }

  const isCaptchaValid = captchaService.verify(captchaToken, captchaAnswer);
  if (!isCaptchaValid) {
    await auditService.log({ action: 'COMPANY_REGISTRATION_OTP_FAILED_CAPTCHA', result: 'FAILURE', metadata: { email }, req });
    throw ApiError.badRequest('CAPTCHA verification failed. Please solve the security question and try again.');
  }

  const normalizedEmail = email.toLowerCase().trim();

  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    throw ApiError.badRequest('An account with this email address already exists. Please login.');
  }

  let otpLog = await OtpLog.findOne({ email: normalizedEmail, purpose: 'COMPANY_REGISTRATION' });
  if (otpLog) {
    if (otpLog.lockedUntil && otpLog.lockedUntil.getTime() > Date.now()) {
      const waitMin = Math.ceil((otpLog.lockedUntil.getTime() - Date.now()) / 60000);
      throw ApiError.badRequest(`Too many verification attempts. Registration locked. Please wait ${waitMin} minutes.`);
    }

    if (otpLog.resendAvailableAt && otpLog.resendAvailableAt.getTime() > Date.now()) {
      const waitSec = Math.ceil((otpLog.resendAvailableAt.getTime() - Date.now()) / 1000);
      throw ApiError.badRequest(`Please wait ${waitSec} seconds before requesting another code.`);
    }
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const rawOtp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpHash = crypto.createHash('sha256').update(rawOtp).digest('hex');
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
  const resendAvailableAt = new Date(Date.now() + 60 * 1000);

  const registrationPayload = {
    name: name || companyName,
    companyName: companyName || name,
    email: normalizedEmail,
    hashedPassword,
    phone: phone || '',
    website: website || '',
    industry: industry || '',
    companySize: companySize || '',
    description: description || '',
    location: location || '',
    registrationNumber: registrationNumber || '',
  };

  if (otpLog) {
    otpLog.otpHash = otpHash;
    otpLog.expiresAt = expiresAt;
    otpLog.resendAvailableAt = resendAvailableAt;
    otpLog.attempts = 0;
    otpLog.isVerified = false;
    otpLog.registrationPayload = registrationPayload;
    await otpLog.save();
  } else {
    await OtpLog.create({
      email: normalizedEmail,
      otpHash,
      purpose: 'COMPANY_REGISTRATION',
      expiresAt,
      resendAvailableAt,
      attempts: 0,
      isVerified: false,
      registrationPayload,
    });
  }

  await emailService.sendCompanyRegistrationOTP(normalizedEmail, rawOtp);
  await auditService.log({ action: 'COMPANY_REGISTRATION_OTP_REQUESTED', result: 'SUCCESS', metadata: { email: normalizedEmail }, req });

  const emailParts = normalizedEmail.split('@');
  const obfuscatedEmail = `${emailParts[0].substring(0, 2)}***@${emailParts[1]}`;

  return res.status(200).json(
    ApiResponse.success('Verification code sent to your official email.', {
      email: normalizedEmail,
      obfuscatedEmail,
      expiresIn: '5 minutes',
      resendCooldownSeconds: 60,
    })
  );
};

export const verifyCompanyRegistrationOtp = async (req: Request, res: Response) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    throw ApiError.badRequest('Email and OTP code are required.');
  }

  const normalizedEmail = email.toLowerCase().trim();
  const otpLog = await OtpLog.findOne({ email: normalizedEmail, purpose: 'COMPANY_REGISTRATION' });

  if (!otpLog) {
    throw ApiError.badRequest('Email verification is required before account creation. Please request a new code.');
  }

  if (otpLog.lockedUntil && otpLog.lockedUntil.getTime() > Date.now()) {
    throw ApiError.badRequest('Too many verification attempts. Please request a new code.');
  }

  if (otpLog.expiresAt.getTime() < Date.now()) {
    throw ApiError.badRequest('Verification code has expired. Please request a new code.');
  }

  const providedHash = crypto.createHash('sha256').update(otp.toString().trim()).digest('hex');

  if (providedHash !== otpLog.otpHash) {
    otpLog.attempts += 1;
    if (otpLog.attempts >= otpLog.maxAttempts) {
      otpLog.lockedUntil = new Date(Date.now() + 15 * 60 * 1000);
    }
    await otpLog.save();

    await auditService.log({ action: 'COMPANY_REGISTRATION_OTP_VERIFY_FAILED', result: 'FAILURE', metadata: { email: normalizedEmail, attempts: otpLog.attempts }, req });
    throw ApiError.badRequest(`Invalid verification code. ${otpLog.maxAttempts - otpLog.attempts} attempts remaining.`);
  }

  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    throw ApiError.badRequest('An account with this email address already exists.');
  }

  otpLog.isVerified = true;
  otpLog.verifiedAt = new Date();
  await otpLog.save();

  const payload = otpLog.registrationPayload || {};

  const user = await User.create({
    name: payload.name || payload.companyName || normalizedEmail.split('@')[0],
    email: normalizedEmail,
    password: payload.hashedPassword || (await bcrypt.hash(crypto.randomBytes(16).toString('hex'), 10)),
    role: 'COMPANY',
    phone: payload.phone || '',
    isEmailVerified: true,
    companyVerificationStatus: 'PENDING',
  });

  const company = await Company.create({
    user: user._id,
    companyName: payload.companyName || payload.name || 'Company Name',
    officialEmail: normalizedEmail,
    website: payload.website || '',
    industry: payload.industry || '',
    companySize: payload.companySize || '',
    description: payload.description || '',
    location: payload.location || '',
    hrContactName: payload.name || '',
    hrContactPhone: payload.phone || '',
    registrationNumber: payload.registrationNumber || '',
  });

  const token = generateToken(user._id.toString(), user.role);

  const userResponse = user.toObject();
  delete userResponse.password;

  await auditService.log({ userId: user._id, role: 'COMPANY', action: 'COMPANY_REGISTRATION_VERIFIED_SUCCESS', result: 'SUCCESS', req });

  return res.status(201).json(
    ApiResponse.success('Company account created and verified successfully.', {
      user: userResponse,
      profile: company,
      token,
    })
  );
};

// ------------------------------------------------------------------
// COMPANY LOGIN OTP WORKFLOW (MANDATORY OTP AFTER PASSWORD)
// ------------------------------------------------------------------

export const requestCompanyOtp = async (req: Request, res: Response) => {
  const { email, password, captchaToken, captchaAnswer } = req.body;

  if (!email) {
    throw ApiError.badRequest('Email is required.');
  }

  const isCaptchaValid = captchaService.verify(captchaToken, captchaAnswer);
  if (!isCaptchaValid) {
    await auditService.log({ action: 'COMPANY_LOGIN_OTP_FAILED_CAPTCHA', result: 'FAILURE', metadata: { email }, req });
    throw ApiError.badRequest('CAPTCHA verification failed. Please solve the security question and try again.');
  }

  const normalizedEmail = email.toLowerCase().trim();

  const user = await User.findOne({ email: normalizedEmail }).select('+password');
  if (!user) {
    throw ApiError.unauthorized('Invalid email or password.');
  }

  if (user.role !== 'COMPANY') {
    throw ApiError.badRequest(`An account with role ${user.role} exists with this email. Please use the appropriate login.`);
  }

  if (password) {
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      await auditService.log({ userId: user._id, role: 'COMPANY', action: 'COMPANY_LOGIN_PASSWORD_FAILED', result: 'FAILURE', req });
      throw ApiError.unauthorized('Invalid email or password.');
    }
  }

  if (!user.isActive) {
    throw ApiError.forbidden('Your account has been deactivated. Please contact support.');
  }

  let otpLog = await OtpLog.findOne({ email: normalizedEmail, purpose: 'COMPANY_LOGIN' });
  if (otpLog) {
    if (otpLog.lockedUntil && otpLog.lockedUntil.getTime() > Date.now()) {
      const waitMin = Math.ceil((otpLog.lockedUntil.getTime() - Date.now()) / 60000);
      throw ApiError.badRequest(`Account temporarily locked due to failed attempts. Please wait ${waitMin} minutes.`);
    }

    if (otpLog.resendAvailableAt && otpLog.resendAvailableAt.getTime() > Date.now()) {
      const waitSec = Math.ceil((otpLog.resendAvailableAt.getTime() - Date.now()) / 1000);
      throw ApiError.badRequest(`Please wait ${waitSec} seconds before requesting another code.`);
    }
  }

  const rawOtp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpHash = crypto.createHash('sha256').update(rawOtp).digest('hex');
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
  const resendAvailableAt = new Date(Date.now() + 60 * 1000);

  if (otpLog) {
    otpLog.otpHash = otpHash;
    otpLog.expiresAt = expiresAt;
    otpLog.resendAvailableAt = resendAvailableAt;
    otpLog.attempts = 0;
    otpLog.isVerified = false;
    await otpLog.save();
  } else {
    await OtpLog.create({
      email: normalizedEmail,
      otpHash,
      purpose: 'COMPANY_LOGIN',
      expiresAt,
      resendAvailableAt,
      attempts: 0,
      isVerified: false,
    });
  }

  await emailService.sendCompanyLoginOTP(normalizedEmail, rawOtp, user._id);
  await auditService.log({ userId: user._id, role: 'COMPANY', action: 'COMPANY_LOGIN_OTP_REQUESTED', result: 'SUCCESS', req });

  const emailParts = normalizedEmail.split('@');
  const obfuscatedEmail = `${emailParts[0].substring(0, 2)}***@${emailParts[1]}`;

  return res.status(200).json(
    ApiResponse.success('Company verification code sent to your email.', {
      email: normalizedEmail,
      obfuscatedEmail,
      expiresIn: '5 minutes',
      resendCooldownSeconds: 60,
    })
  );
};

export const verifyCompanyOtp = async (req: Request, res: Response) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    throw ApiError.badRequest('Email and OTP code are required.');
  }

  const normalizedEmail = email.toLowerCase().trim();
  const otpLog = await OtpLog.findOne({ email: normalizedEmail, purpose: 'COMPANY_LOGIN' });

  if (!otpLog) {
    throw ApiError.badRequest('Verification session not found. Please request a new code.');
  }

  if (otpLog.lockedUntil && otpLog.lockedUntil.getTime() > Date.now()) {
    throw ApiError.badRequest('Account locked due to too many failed attempts. Please request a new code.');
  }

  if (otpLog.expiresAt.getTime() < Date.now()) {
    throw ApiError.badRequest('Verification code has expired. Please request a new code.');
  }

  const providedHash = crypto.createHash('sha256').update(otp.toString().trim()).digest('hex');

  if (providedHash !== otpLog.otpHash) {
    otpLog.attempts += 1;
    if (otpLog.attempts >= otpLog.maxAttempts) {
      otpLog.lockedUntil = new Date(Date.now() + 15 * 60 * 1000);
    }
    await otpLog.save();

    await auditService.log({ action: 'COMPANY_LOGIN_OTP_VERIFY_FAILED', result: 'FAILURE', metadata: { email: normalizedEmail, attempts: otpLog.attempts }, req });
    throw ApiError.badRequest(`Invalid verification code. ${otpLog.maxAttempts - otpLog.attempts} attempts remaining.`);
  }

  otpLog.isVerified = true;
  otpLog.verifiedAt = new Date();
  await otpLog.save();

  const user = await User.findOne({ email: normalizedEmail });
  if (!user) {
    throw ApiError.notFound('Company user not found.');
  }

  const company = await Company.findOne({ user: user._id });
  const token = generateToken(user._id.toString(), user.role);

  const userResponse = user.toObject();
  delete userResponse.password;

  await auditService.log({ userId: user._id, role: 'COMPANY', action: 'COMPANY_LOGIN_VERIFIED_SUCCESS', result: 'SUCCESS', req });

  return res.status(200).json(
    ApiResponse.success('Company verification successful.', {
      user: userResponse,
      company,
      token,
    })
  );
};

export const register = async (req: Request, res: Response) => {
  // Reject any explicit attempt to register as ADMIN or HOD via raw payload or schema
  const rawRole = (req.body.role || '').toUpperCase();
  if (rawRole === 'ADMIN' || rawRole === 'HOD') {
    throw ApiError.forbidden(`Public registration for role '${rawRole}' is strictly prohibited. Admin/HOD accounts must be provisioned by System Administration.`);
  }

  const validated = registerSchema.parse(req.body);

  if (validated.role === 'STUDENT') {
    throw ApiError.badRequest('Student registration requires email OTP verification. Please use the Student OTP Registration workflow.');
  }
  if (validated.role === 'COMPANY') {
    throw ApiError.badRequest('Company registration requires email OTP verification. Please use the Company OTP Registration workflow.');
  }

  const existingUser = await User.findOne({ email: validated.email.toLowerCase() });
  if (existingUser) {
    throw ApiError.badRequest('User with this email already exists');
  }

  // FACULTY requires institutional verification (PENDING), INSTITUTION is verified
  const initialVerificationStatus = validated.role === 'FACULTY' ? 'PENDING' : 'VERIFIED';

  const user = await User.create({
    name: validated.name,
    email: validated.email.toLowerCase(),
    password: validated.password,
    role: validated.role,
    phone: validated.phone || '',
    companyVerificationStatus: initialVerificationStatus,
  });

  if (validated.role === 'FACULTY') {
    await Faculty.create({
      user: user._id,
      verificationStatus: 'PENDING',
      contactEmail: validated.email.toLowerCase(),
      phone: validated.phone || '',
    });
  } else if (validated.role === 'INSTITUTION') {
    await Institution.create({
      user: user._id,
      institutionName: validated.institutionName || validated.name,
    });
  }

  const token = generateToken(user._id.toString(), user.role);

  const userResponse = user.toObject();
  delete userResponse.password;

  const successMessage = validated.role === 'FACULTY'
    ? 'Faculty registration request submitted successfully. Your account is PENDING institutional verification.'
    : 'User registered successfully';

  return res.status(201).json(
    ApiResponse.success(successMessage, {
      user: userResponse,
      token,
    })
  );
};

export const login = async (req: Request, res: Response) => {
  const validated = loginSchema.parse(req.body);

  const user = await User.findOne({ email: validated.email.toLowerCase() }).select('+password');
  if (!user) {
    await auditService.log({ action: 'LOGIN_PASSWORD_FAILED', result: 'FAILURE', metadata: { email: validated.email }, req });
    throw ApiError.unauthorized('Invalid email or password');
  }

  if (user.role === 'STUDENT') {
    await auditService.log({ userId: user._id, role: 'STUDENT', action: 'STUDENT_PASSWORD_ONLY_LOGIN_BLOCKED', result: 'FAILURE', req });
    throw ApiError.badRequest('Student login requires Email OTP verification after password. Please use the Student Email OTP portal.');
  }

  if (user.role === 'COMPANY') {
    await auditService.log({ userId: user._id, role: 'COMPANY', action: 'COMPANY_PASSWORD_ONLY_LOGIN_BLOCKED', result: 'FAILURE', req });
    throw ApiError.badRequest('Company login requires Email OTP verification after password. Please use the Company Email OTP portal.');
  }

  const isPasswordValid = await user.comparePassword(validated.password);
  if (!isPasswordValid) {
    await auditService.log({ userId: user._id, role: user.role, action: 'LOGIN_PASSWORD_FAILED', result: 'FAILURE', req });
    throw ApiError.unauthorized('Invalid email or password');
  }

  if (!user.isActive) {
    await auditService.log({ userId: user._id, role: user.role, action: 'LOGIN_DEACTIVATED_USER', result: 'FAILURE', req });
    throw ApiError.forbidden('Your account has been deactivated. Please contact support.');
  }

  const token = generateToken(user._id.toString(), user.role);

  const userResponse = user.toObject();
  delete userResponse.password;

  await auditService.log({ userId: user._id, role: user.role, action: 'LOGIN_SUCCESS', result: 'SUCCESS', req });

  return res.status(200).json(
    ApiResponse.success('Login successful', {
      user: userResponse,
      token,
    })
  );
};

export const getMe = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?._id;
  const user = await User.findById(userId);

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  let profile = null;

  if (user.role === 'STUDENT') {
    profile = await Student.findOne({ user: user._id });
  } else if (user.role === 'COMPANY') {
    profile = await Company.findOne({ user: user._id });
  } else if (user.role === 'FACULTY') {
    profile = await Faculty.findOne({ user: user._id });
  } else if (user.role === 'INSTITUTION') {
    profile = await Institution.findOne({ user: user._id });
  }

  return res.status(200).json(
    ApiResponse.success('User details retrieved', {
      user,
      profile,
    })
  );
};

export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = forgotPasswordSchema.parse(req.body);
  const normalizedEmail = email.toLowerCase().trim();

  const user = await User.findOne({ email: normalizedEmail });

  if (user) {
    let otpLog = await OtpLog.findOne({ email: normalizedEmail, purpose: 'PASSWORD_RESET' });
    if (otpLog) {
      if (otpLog.lockedUntil && otpLog.lockedUntil.getTime() > Date.now()) {
        const waitMin = Math.ceil((otpLog.lockedUntil.getTime() - Date.now()) / 60000);
        throw ApiError.badRequest(`Too many failed attempts. Password reset locked. Please wait ${waitMin} minutes.`);
      }

      if (otpLog.resendAvailableAt && otpLog.resendAvailableAt.getTime() > Date.now()) {
        const waitSec = Math.ceil((otpLog.resendAvailableAt.getTime() - Date.now()) / 1000);
        throw ApiError.badRequest(`Please wait ${waitSec} seconds before requesting another reset code.`);
      }
    }

    const rawOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = crypto.createHash('sha256').update(rawOtp).digest('hex');
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    const resendAvailableAt = new Date(Date.now() + 60 * 1000);

    if (otpLog) {
      otpLog.otpHash = otpHash;
      otpLog.expiresAt = expiresAt;
      otpLog.resendAvailableAt = resendAvailableAt;
      otpLog.attempts = 0;
      otpLog.isVerified = false;
      await otpLog.save();
    } else {
      await OtpLog.create({
        email: normalizedEmail,
        otpHash,
        purpose: 'PASSWORD_RESET',
        expiresAt,
        resendAvailableAt,
        attempts: 0,
        isVerified: false,
      });
    }

    await emailService.sendPasswordResetOTP(normalizedEmail, rawOtp, user._id);
    await auditService.log({ userId: user._id, role: user.role, action: 'FORGOT_PASSWORD_OTP_REQUESTED', result: 'SUCCESS', req });
  }

  return res.status(200).json(
    ApiResponse.success('If the account exists, a password reset OTP has been sent.', {
      email: normalizedEmail,
      expiresIn: '10 minutes',
      resendCooldownSeconds: 60,
    })
  );
};

export const verifyResetOtp = async (req: Request, res: Response) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    throw ApiError.badRequest('Email and OTP code are required.');
  }

  const normalizedEmail = email.toLowerCase().trim();
  const otpLog = await OtpLog.findOne({ email: normalizedEmail, purpose: 'PASSWORD_RESET' });

  if (!otpLog) {
    throw ApiError.badRequest('No password reset request found for this email. Please request a new OTP.');
  }

  if (otpLog.lockedUntil && otpLog.lockedUntil.getTime() > Date.now()) {
    throw ApiError.badRequest('Too many incorrect attempts. Please request a new OTP.');
  }

  if (otpLog.expiresAt.getTime() < Date.now()) {
    throw ApiError.badRequest('OTP code has expired. Please request a new OTP.');
  }

  const providedHash = crypto.createHash('sha256').update(otp.toString().trim()).digest('hex');

  if (providedHash !== otpLog.otpHash) {
    otpLog.attempts += 1;
    if (otpLog.attempts >= otpLog.maxAttempts) {
      otpLog.lockedUntil = new Date(Date.now() + 15 * 60 * 1000);
    }
    await otpLog.save();

    await auditService.log({ action: 'FORGOT_PASSWORD_OTP_VERIFY_FAILED', result: 'FAILURE', metadata: { email: normalizedEmail, attempts: otpLog.attempts }, req });
    throw ApiError.badRequest(`Invalid verification code. ${otpLog.maxAttempts - otpLog.attempts} attempts remaining.`);
  }

  const user = await User.findOne({ email: normalizedEmail });
  if (!user) {
    throw ApiError.badRequest('User not found.');
  }

  const rawResetToken = crypto.randomBytes(32).toString('hex');
  const hashedResetToken = crypto.createHash('sha256').update(rawResetToken).digest('hex');

  user.resetPasswordToken = hashedResetToken;
  user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);
  await user.save();

  otpLog.isVerified = true;
  otpLog.verifiedAt = new Date();
  await otpLog.save();

  await auditService.log({ userId: user._id, role: user.role, action: 'FORGOT_PASSWORD_OTP_VERIFIED', result: 'SUCCESS', req });

  return res.status(200).json(
    ApiResponse.success('OTP code verified successfully.', {
      resetToken: rawResetToken,
      email: normalizedEmail,
      expiresIn: '15 minutes',
    })
  );

};

export const resetPassword = async (req: Request, res: Response) => {
  const { email, resetToken, newPassword, confirmPassword } = req.body;

  if (!email || !resetToken || !newPassword) {
    throw ApiError.badRequest('Email, reset token, and new password are required.');
  }

  if (confirmPassword && newPassword !== confirmPassword) {
    throw ApiError.badRequest('New password and confirm password do not match.');
  }

  if (newPassword.length < 6) {
    throw ApiError.badRequest('Password must be at least 6 characters long.');
  }

  const normalizedEmail = email.toLowerCase().trim();
  const hashedResetToken = crypto.createHash('sha256').update(resetToken.trim()).digest('hex');

  const user = await User.findOne({
    email: normalizedEmail,
    resetPasswordToken: hashedResetToken,
    resetPasswordExpires: { $gt: new Date() },
  });

  if (!user) {
    throw ApiError.badRequest('Invalid or expired reset token. Please request a new password reset OTP.');
  }

  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  await OtpLog.deleteMany({ email: normalizedEmail, purpose: 'PASSWORD_RESET' });

  await auditService.log({ userId: user._id, role: user.role, action: 'PASSWORD_RESET_SUCCESS', result: 'SUCCESS', req });

  return res.status(200).json(
    ApiResponse.success('Password updated successfully. You may now log in with your new password.')
  );
};

export const changePassword = async (req: AuthenticatedRequest, res: Response) => {
  const validated = changePasswordSchema.parse(req.body);
  const userId = req.user?._id;

  const user = await User.findById(userId).select('+password');
  if (!user) {
    throw ApiError.notFound('User not found');
  }

  const isOldPasswordValid = await user.comparePassword(validated.currentPassword);
  if (!isOldPasswordValid) {
    throw ApiError.badRequest('Invalid current password');
  }


  user.password = validated.newPassword;
  await user.save();

  return res.status(200).json(ApiResponse.success('Password updated successfully'));
};
