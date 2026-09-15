import { Response } from 'express';
import { Company } from '../models/Company';
import { User } from '../models/User';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { companyVerificationRequestSchema } from '../validators/jobValidator';
import { z } from 'zod';

export const getCompanyProfile = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?._id;
  const company = await Company.findOne({ user: userId }).populate('user', 'name email phone avatarUrl companyVerificationStatus');

  if (!company) {
    throw ApiError.notFound('Company profile not found');
  }

  return res.status(200).json(ApiResponse.success('Company profile retrieved', company));
};

export const updateCompanyProfile = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?._id;
  const validated = companyVerificationRequestSchema.parse(req.body);

  let company = await Company.findOne({ user: userId });
  if (!company) {
    company = new Company({ user: userId, companyName: validated.companyName });
  }

  company.companyName = validated.companyName;
  if (validated.registrationNumber !== undefined) company.registrationNumber = validated.registrationNumber;
  if (validated.officialEmail !== undefined) company.officialEmail = validated.officialEmail;
  if (validated.website !== undefined) company.website = validated.website;
  if (validated.industry !== undefined) company.industry = validated.industry;
  if (validated.companySize !== undefined) company.companySize = validated.companySize;
  if (validated.description !== undefined) company.description = validated.description;
  if (validated.location !== undefined) company.location = validated.location;
  if (validated.hrContactName !== undefined) company.hrContactName = validated.hrContactName;
  if (validated.hrContactPhone !== undefined) company.hrContactPhone = validated.hrContactPhone;

  await company.save();

  const populated = await Company.findById(company._id).populate('user', 'name email phone avatarUrl companyVerificationStatus');
  return res.status(200).json(ApiResponse.success('Company profile updated successfully', populated));
};

export const getPendingCompanies = async (req: AuthenticatedRequest, res: Response) => {
  const pendingUsers = await User.find({ role: 'COMPANY', companyVerificationStatus: 'PENDING' });
  const userIds = pendingUsers.map((u) => u._id);
  const companies = await Company.find({ user: { $in: userIds } }).populate('user', 'name email phone companyVerificationStatus createdAt');

  return res.status(200).json(ApiResponse.success('Pending verification companies retrieved', companies));
};

const updateVerificationStatusSchema = z.object({
  status: z.enum(['PENDING', 'VERIFIED', 'REJECTED', 'SUSPENDED']),
});

export const updateVerificationStatus = async (req: AuthenticatedRequest, res: Response) => {
  const { companyId } = req.params;
  const { status } = updateVerificationStatusSchema.parse(req.body);

  const company = await Company.findById(companyId);
  if (!company) {
    throw ApiError.notFound('Company not found');
  }

  const user = await User.findById(company.user);
  if (!user) {
    throw ApiError.notFound('Associated user not found');
  }

  user.companyVerificationStatus = status;
  await user.save();

  return res.status(200).json(
    ApiResponse.success(`Company verification status updated to '${status}'`, {
      company,
      user,
    })
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Company Follow Controller Methods
// ─────────────────────────────────────────────────────────────────────────────
import { Student } from '../models/Student';
import { CompanyFollow } from '../models/CompanyFollow';

export const followCompany = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?._id;
  const { companyId } = req.params;

  const student = await Student.findOne({ user: userId });
  if (!student) throw ApiError.notFound('Student profile not found');

  const company = await Company.findById(companyId);
  if (!company) throw ApiError.notFound('Company not found');

  try {
    await CompanyFollow.create({
      student: student._id,
      company: company._id,
    });
    return res.status(200).json(ApiResponse.success(`Successfully followed ${company.companyName}`, { isFollowing: true }));
  } catch (err: any) {
    if (err.code === 11000) {
      return res.status(200).json(ApiResponse.success(`Already following ${company.companyName}`, { isFollowing: true }));
    }
    throw ApiError.internal('Failed to follow company');
  }
};

export const unfollowCompany = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?._id;
  const { companyId } = req.params;

  const student = await Student.findOne({ user: userId });
  if (!student) throw ApiError.notFound('Student profile not found');

  await CompanyFollow.deleteOne({ student: student._id, company: companyId });
  return res.status(200).json(ApiResponse.success('Successfully unfollowed company', { isFollowing: false }));
};

export const checkFollowingStatus = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?._id;
  const { companyId } = req.params;

  const student = await Student.findOne({ user: userId });
  if (!student) return res.status(200).json(ApiResponse.success('Status check complete', { isFollowing: false }));

  const follow = await CompanyFollow.findOne({ student: student._id, company: companyId });
  return res.status(200).json(ApiResponse.success('Status check complete', { isFollowing: Boolean(follow) }));
};

export const getFollowedCompanies = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?._id;
  const student = await Student.findOne({ user: userId });
  if (!student) throw ApiError.notFound('Student profile not found');

  const follows = await CompanyFollow.find({ student: student._id }).populate('company');
  const companies = follows.map((f: any) => f.company).filter(Boolean);

  return res.status(200).json(ApiResponse.success('Followed companies retrieved', companies));
};

