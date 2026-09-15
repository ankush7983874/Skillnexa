import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { Faculty } from '../models/Faculty';
import { User } from '../models/User';
import { FacultyOpportunity } from '../models/FacultyOpportunity';
import { FacultyApplication } from '../models/FacultyApplication';
import { Company } from '../models/Company';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { auditService } from '../services/auditService';

export const getFacultyProfile = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?._id;
  let faculty = await Faculty.findOne({ user: userId }).populate('user', 'name email phone avatarUrl role');

  if (!faculty) {
    faculty = await Faculty.create({ user: userId });
  }

  return res.status(200).json(ApiResponse.success('Faculty profile retrieved', faculty));
};

export const updateFacultyProfile = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?._id;
  const {
    institution,
    department,
    designation,
    specialization,
    researchAreas,
    bio,
    education,
    experienceYears,
    skills,
    certifications,
    projects,
    contactEmail,
    phone,
  } = req.body;

  let faculty = await Faculty.findOne({ user: userId });
  if (!faculty) {
    faculty = await Faculty.create({ user: userId });
  }

  if (institution !== undefined) faculty.institution = institution;
  if (department !== undefined) faculty.department = department;
  if (designation !== undefined) faculty.designation = designation;
  if (specialization !== undefined) faculty.specialization = specialization;
  if (researchAreas !== undefined) faculty.researchAreas = researchAreas;
  if (bio !== undefined) faculty.bio = bio;
  if (education !== undefined) faculty.education = education;
  if (experienceYears !== undefined) faculty.experienceYears = experienceYears;
  if (skills !== undefined) faculty.skills = skills;
  if (certifications !== undefined) faculty.certifications = certifications;
  if (projects !== undefined) faculty.projects = projects;
  if (contactEmail !== undefined) faculty.contactEmail = contactEmail;
  if (phone !== undefined) faculty.phone = phone;

  await faculty.save();
  await auditService.log({ userId, role: 'FACULTY', action: 'FACULTY_PROFILE_UPDATED', req });

  return res.status(200).json(ApiResponse.success('Faculty profile updated successfully', faculty));
};

export const createFacultyOpportunity = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?._id;
  const company = await Company.findOne({ user: userId });
  if (!company) throw ApiError.notFound('Company profile not found');

  const { title, type, description, requirements, duration, compensation, location, deadline } = req.body;

  if (!title || !type || !description) {
    throw ApiError.badRequest('Title, type, and description are required');
  }

  const opportunity = await FacultyOpportunity.create({
    company: company._id,
    companyName: company.companyName || 'Partner Company',
    title,
    type,
    description,
    requirements: Array.isArray(requirements) ? requirements : [],
    duration: duration || 'Flexible',
    compensation: compensation || 'Unpaid / Institutional Support',
    location: location || 'Remote / On-site',
    deadline: deadline ? new Date(deadline) : undefined,
  });

  await auditService.log({ userId, role: 'COMPANY', action: 'FACULTY_OPPORTUNITY_CREATED', resourceId: opportunity._id.toString(), req });

  return res.status(201).json(ApiResponse.success('Faculty opportunity posted successfully', opportunity));
};

export const listFacultyOpportunities = async (req: AuthenticatedRequest, res: Response) => {
  const { type, search } = req.query;
  const filter: any = { status: 'OPEN' };

  if (type) filter.type = type;
  if (search) {
    filter.$or = [
      { title: { $regex: search as string, $options: 'i' } },
      { description: { $regex: search as string, $options: 'i' } },
      { companyName: { $regex: search as string, $options: 'i' } },
    ];
  }

  const opportunities = await FacultyOpportunity.find(filter).sort({ createdAt: -1 });
  return res.status(200).json(ApiResponse.success('Faculty opportunities retrieved', opportunities));
};

export const applyFacultyOpportunity = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?._id;
  const faculty = await Faculty.findOne({ user: userId });
  if (!faculty) throw ApiError.notFound('Faculty profile not found');

  const { opportunityId, proposal, cvUrl } = req.body;
  const opportunity = await FacultyOpportunity.findById(opportunityId);
  if (!opportunity || opportunity.status !== 'OPEN') {
    throw ApiError.notFound('Opportunity not found or closed');
  }

  const existing = await FacultyApplication.findOne({ opportunity: opportunityId, faculty: faculty._id });
  if (existing) {
    throw ApiError.badRequest('You have already applied to this opportunity');
  }

  const application = await FacultyApplication.create({
    opportunity: opportunityId,
    faculty: faculty._id,
    user: userId,
    proposal: proposal || '',
    cvUrl: cvUrl || '',
    status: 'APPLIED',
  });

  await auditService.log({ userId, role: 'FACULTY', action: 'FACULTY_OPPORTUNITY_APPLIED', resourceId: application._id.toString(), req });

  return res.status(201).json(ApiResponse.success('Applied to faculty opportunity successfully', application));
};

export const getMyFacultyApplications = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?._id;
  const faculty = await Faculty.findOne({ user: userId });
  if (!faculty) throw ApiError.notFound('Faculty profile not found');

  const applications = await FacultyApplication.find({ faculty: faculty._id })
    .populate('opportunity')
    .sort({ createdAt: -1 });

  return res.status(200).json(ApiResponse.success('Faculty applications retrieved', applications));
};

export const updateFacultyApplicationStatus = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?._id;
  const { applicationId } = req.params;
  const { status, notes } = req.body;

  const application = await FacultyApplication.findById(applicationId).populate('opportunity');
  if (!application) throw ApiError.notFound('Application not found');

  const company = await Company.findOne({ user: userId });
  const opp = application.opportunity as any;
  if (!company || opp.company.toString() !== company._id.toString()) {
    throw ApiError.forbidden('Unauthorized to update this application');
  }

  application.status = status;
  if (notes) application.notes = notes;
  await application.save();

  await auditService.log({ userId, role: 'COMPANY', action: 'FACULTY_APPLICATION_STATUS_UPDATED', resourceId: application._id.toString(), metadata: { status }, req });

  return res.status(200).json(ApiResponse.success('Faculty application status updated', application));
};
