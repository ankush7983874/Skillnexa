import { Router } from 'express';
import {
  register,
  login,
  getMe,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
  changePassword,
  getCaptcha,
  getSmtpStatus,
  requestStudentRegistrationOtp,
  verifyStudentRegistrationOtp,
  requestStudentOtp,
  verifyStudentOtp,
  requestCompanyRegistrationOtp,
  verifyCompanyRegistrationOtp,
  requestCompanyOtp,
  verifyCompanyOtp,
} from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';
import { asyncHandler } from '../middleware/asyncHandler';

const router = Router();

router.get('/captcha', asyncHandler(getCaptcha));
router.get('/smtp-status', asyncHandler(getSmtpStatus));

// Student Registration OTP Routes
router.post('/student/register/request-otp', asyncHandler(requestStudentRegistrationOtp));
router.post('/student/request-registration-otp', asyncHandler(requestStudentRegistrationOtp));
router.post('/student/register/verify-otp', asyncHandler(verifyStudentRegistrationOtp));
router.post('/student/verify-registration-otp', asyncHandler(verifyStudentRegistrationOtp));

// Student Login OTP Routes
router.post('/student/login/request-otp', asyncHandler(requestStudentOtp));
router.post('/student/request-otp', asyncHandler(requestStudentOtp));
router.post('/student/login/verify-otp', asyncHandler(verifyStudentOtp));
router.post('/student/verify-otp', asyncHandler(verifyStudentOtp));

// Company Registration OTP Routes
router.post('/company/register/request-otp', asyncHandler(requestCompanyRegistrationOtp));
router.post('/company/request-registration-otp', asyncHandler(requestCompanyRegistrationOtp));
router.post('/company/register/verify-otp', asyncHandler(verifyCompanyRegistrationOtp));
router.post('/company/verify-registration-otp', asyncHandler(verifyCompanyRegistrationOtp));

// Company Login OTP Routes
router.post('/company/login/request-otp', asyncHandler(requestCompanyOtp));
router.post('/company/request-otp', asyncHandler(requestCompanyOtp));
router.post('/company/login/verify-otp', asyncHandler(verifyCompanyOtp));
router.post('/company/verify-otp', asyncHandler(verifyCompanyOtp));

// Standard Auth Routes & Password Reset Workflow
router.post('/register', asyncHandler(register));
router.post('/login', asyncHandler(login));
router.get('/me', protect, asyncHandler(getMe));
router.post('/forgot-password', asyncHandler(forgotPassword));
router.post('/verify-reset-otp', asyncHandler(verifyResetOtp));
router.post('/student/verify-reset-otp', asyncHandler(verifyResetOtp));
router.post('/reset-password', asyncHandler(resetPassword));
router.post('/change-password', protect, asyncHandler(changePassword));

export default router;
