import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { User } from '../models/User';
import { Job } from '../models/Job';
import { Company } from '../models/Company';
import { Student } from '../models/Student';
import { Faculty } from '../models/Faculty';
import { Institution } from '../models/Institution';
import { AuditLog } from '../models/AuditLog';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { auditService } from '../services/auditService';

export const listAllUsers = async (req: AuthenticatedRequest, res: Response) => {
  const { role, search, page = 1, limit = 20 } = req.query;
  const filter: any = {};

  if (role) filter.role = role;
  if (search) {
    filter.$or = [
      { name: { $regex: search as string, $options: 'i' } },
      { email: { $regex: search as string, $options: 'i' } },
    ];
  }

  const p = parseInt(page as string, 10);
  const l = parseInt(limit as string, 10);

  const users = await User.find(filter)
    .select('-password')
    .sort({ createdAt: -1 })
    .skip((p - 1) * l)
    .limit(l);

  const total = await User.countDocuments(filter);

  return res.status(200).json(
    ApiResponse.success('Users list retrieved', {
      users,
      pagination: { total, page: p, pages: Math.ceil(total / l) },
    })
  );
};

export const updateUserStatus = async (req: AuthenticatedRequest, res: Response) => {
  const adminId = req.user?._id;
  const { userId } = req.params;
  const { isActive, role, companyVerificationStatus } = req.body;

  const user = await User.findById(userId);
  if (!user) throw ApiError.notFound('User not found');

  if (isActive !== undefined) user.isActive = isActive;
  if (role !== undefined) user.role = role;
  if (companyVerificationStatus !== undefined) user.companyVerificationStatus = companyVerificationStatus;

  await user.save();

  if (user.role === 'COMPANY' && companyVerificationStatus) {
    await Company.updateOne({ user: user._id }, { status: companyVerificationStatus });
  }

  await auditService.log({ userId: adminId, role: 'ADMIN', action: 'USER_MODERATED', resourceId: userId, metadata: { isActive, role, companyVerificationStatus }, req });

  return res.status(200).json(ApiResponse.success('User updated successfully', user));
};

export const moderateJob = async (req: AuthenticatedRequest, res: Response) => {
  const adminId = req.user?._id;
  const { jobId } = req.params;
  const { status } = req.body;

  const job = await Job.findById(jobId);
  if (!job) throw ApiError.notFound('Job not found');

  job.status = status;
  await job.save();

  await auditService.log({ userId: adminId, role: 'ADMIN', action: 'JOB_MODERATED', resourceId: jobId, metadata: { status }, req });

  return res.status(200).json(ApiResponse.success(`Job status set to ${status}`, job));
};

export const queryAuditLogs = async (req: AuthenticatedRequest, res: Response) => {
  const { action, role, search, page = 1, limit = 50 } = req.query;
  const filter: any = {};

  if (action) filter.action = action;
  if (role) filter.role = role;
  if (search) {
    filter.$or = [
      { action: { $regex: search as string, $options: 'i' } },
      { ipAddress: { $regex: search as string, $options: 'i' } },
    ];
  }

  const p = parseInt(page as string, 10);
  const l = parseInt(limit as string, 10);

  const logs = await AuditLog.find(filter)
    .populate('user', 'name email role')
    .sort({ timestamp: -1 })
    .skip((p - 1) * l)
    .limit(l);

  const total = await AuditLog.countDocuments(filter);

  return res.status(200).json(
    ApiResponse.success('Audit logs retrieved', {
      logs,
      pagination: { total, page: p, pages: Math.ceil(total / l) },
    })
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Admin Workflow Extensions: HOD Assignment, Faculty Verification, Admin Creation
// ─────────────────────────────────────────────────────────────────────────────

export const assignHod = async (req: AuthenticatedRequest, res: Response) => {
  const adminId = req.user?._id;
  const { userId, department } = req.body;

  if (!userId) throw ApiError.badRequest('User ID is required for HOD assignment.');

  const user = await User.findById(userId);
  if (!user) throw ApiError.notFound('User not found');

  user.role = 'HOD';
  user.companyVerificationStatus = 'VERIFIED';
  user.verifiedBy = adminId;
  user.verifiedAt = new Date();
  await user.save();

  let faculty = await Faculty.findOne({ user: user._id });
  if (!faculty) {
    faculty = await Faculty.create({
      user: user._id,
      department: department || 'Computer Science',
      designation: 'Head of Department',
      verificationStatus: 'VERIFIED',
    });
  } else {
    if (department) faculty.department = department;
    faculty.designation = 'Head of Department';
    faculty.verificationStatus = 'VERIFIED';
    await faculty.save();
  }

  await auditService.log({
    userId: adminId,
    role: 'ADMIN',
    action: 'HOD_ASSIGNED',
    resourceId: userId,
    metadata: { department: faculty.department },
    req,
  });

  return res.status(200).json(
    ApiResponse.success(`User '${user.name}' has been promoted to HOD of ${faculty.department}`, {
      user: { _id: user._id, name: user.name, email: user.email, role: user.role },
      faculty,
    })
  );
};

export const getPendingFaculty = async (req: AuthenticatedRequest, res: Response) => {
  const pendingUsers = await User.find({ role: 'FACULTY', companyVerificationStatus: 'PENDING' });
  const userIds = pendingUsers.map((u) => u._id);

  const facultyList = await Faculty.find({ user: { $in: userIds } }).populate('user', 'name email phone companyVerificationStatus createdAt');

  return res.status(200).json(ApiResponse.success('Pending faculty verification requests retrieved', facultyList));
};

export const verifyFaculty = async (req: AuthenticatedRequest, res: Response) => {
  const adminId = req.user?._id;
  const { facultyId } = req.params;
  const { status, notes } = req.body; // 'VERIFIED' | 'APPROVED' | 'REJECTED'

  const faculty = await Faculty.findById(facultyId);
  if (!faculty) throw ApiError.notFound('Faculty profile not found');

  const user = await User.findById(faculty.user);
  if (!user) throw ApiError.notFound('Associated user not found');

  const normStatus = status === 'APPROVED' ? 'VERIFIED' : status;

  user.companyVerificationStatus = normStatus as any;
  user.verifiedBy = adminId;
  user.verifiedAt = new Date();
  if (notes) user.verificationNotes = notes;
  await user.save();

  faculty.verificationStatus = normStatus as any;
  await faculty.save();

  await auditService.log({
    userId: adminId,
    role: 'ADMIN',
    action: 'FACULTY_VERIFIED',
    resourceId: facultyId,
    metadata: { status: normStatus },
    req,
  });

  return res.status(200).json(
    ApiResponse.success(`Faculty verification status updated to '${normStatus}'`, {
      user: { _id: user._id, name: user.name, email: user.email, role: user.role, companyVerificationStatus: user.companyVerificationStatus },
      faculty,
    })
  );
};

export const createAdminUser = async (req: AuthenticatedRequest, res: Response) => {
  const adminId = req.user?._id;
  const { name, email, password, phone } = req.body;

  if (!name || !email || !password) {
    throw ApiError.badRequest('Name, email, and password are required for Admin creation.');
  }

  const existing = await User.findOne({ email: email.toLowerCase().trim() });
  if (existing) throw ApiError.badRequest('An account with this email already exists.');

  const adminUser = await User.create({
    name,
    email: email.toLowerCase().trim(),
    password,
    role: 'ADMIN',
    phone: phone || '',
    isEmailVerified: true,
    companyVerificationStatus: 'VERIFIED',
    verifiedBy: adminId,
    verifiedAt: new Date(),
  });

  await auditService.log({
    userId: adminId,
    role: 'ADMIN',
    action: 'ADMIN_PROVISIONED',
    resourceId: adminUser._id.toString(),
    metadata: { email: adminUser.email },
    req,
  });

  const resp = adminUser.toObject();
  delete resp.password;

  return res.status(201).json(ApiResponse.success('New Admin account provisioned successfully.', resp));
};
