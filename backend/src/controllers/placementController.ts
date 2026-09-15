import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { Placement } from '../models/Placement';
import { Application } from '../models/Application';
import { Student } from '../models/Student';
import { Company } from '../models/Company';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { auditService } from '../services/auditService';

export const listPlacements = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?._id;
  const role = req.user?.role;
  const { joiningStatus, page = 1, limit = 20 } = req.query;

  const filter: any = {};
  if (joiningStatus) filter.joiningStatus = joiningStatus;

  if (role === 'STUDENT') {
    const student = await Student.findOne({ user: userId });
    if (student) filter.student = student._id;
  } else if (role === 'COMPANY') {
    const company = await Company.findOne({ user: userId });
    if (company) filter.company = company._id;
  }

  const p = parseInt(page as string, 10);
  const l = parseInt(limit as string, 10);

  const placements = await Placement.find(filter)
    .populate({
      path: 'student',
      populate: { path: 'user', select: 'name email phone' },
    })
    .populate('company', 'companyName industry logoUrl')
    .populate('job', 'title location type ctcLpa')
    .sort({ createdAt: -1 })
    .skip((p - 1) * l)
    .limit(l);

  const total = await Placement.countDocuments(filter);

  return res.status(200).json(
    ApiResponse.success('Placements list retrieved', {
      placements,
      pagination: { total, page: p, pages: Math.ceil(total / l) },
    })
  );
};

export const updatePlacementJoiningStatus = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?._id;
  const role = req.user?.role;
  const { placementId } = req.params;
  const { joiningStatus, joiningDate, offerLetterUrl, ctcLpa, ctcBreakdown, notes } = req.body;

  const placement = await Placement.findById(placementId);
  if (!placement) throw ApiError.notFound('Placement record not found');

  if (joiningStatus) placement.joiningStatus = joiningStatus;
  if (joiningDate) placement.joiningDate = new Date(joiningDate);
  if (offerLetterUrl) placement.offerLetterUrl = offerLetterUrl;
  if (ctcLpa) placement.ctcLpa = ctcLpa;
  if (ctcBreakdown) placement.ctcBreakdown = ctcBreakdown;

  placement.history.push({
    status: joiningStatus || placement.joiningStatus,
    updatedBy: userId,
    notes: notes || `Placement status set to ${joiningStatus || placement.joiningStatus}`,
    timestamp: new Date(),
  });

  await placement.save();

  // Sync application status if joined
  if (joiningStatus === 'JOINED') {
    await Application.findByIdAndUpdate(placement.application, { status: 'PLACED' });
  }

  await auditService.log({
    userId,
    role,
    action: 'PLACEMENT_UPDATED',
    resourceId: placementId,
    metadata: { joiningStatus, ctcLpa },
    req,
  });

  return res.status(200).json(ApiResponse.success('Placement record updated successfully', placement));
};

export const createOfferLetter = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?._id;
  const { applicationId, offerLetterUrl, joiningDate, ctcLpa, salary, notes } = req.body;

  const company = await Company.findOne({ user: userId });
  if (!company) throw ApiError.notFound('Company profile not found');

  const application = await Application.findOne({ _id: applicationId, company: company._id })
    .populate('job')
    .populate({ path: 'student', populate: { path: 'user' } });

  if (!application) throw ApiError.notFound('Application not found');

  let placement = await Placement.findOne({ application: application._id });
  if (!placement) {
    placement = new Placement({
      student: application.student._id,
      company: company._id,
      job: application.job._id,
      application: application._id,
      role: (application.job as any)?.title || 'Software Developer',
      joiningStatus: 'PENDING',
      placementStatus: 'OFFER_ISSUED',
    });
  }

  if (offerLetterUrl) placement.offerLetterUrl = offerLetterUrl;
  if (joiningDate) placement.joiningDate = new Date(joiningDate);
  if (ctcLpa) placement.ctcLpa = ctcLpa;
  if (salary) placement.salary = salary;

  placement.history.push({
    status: 'OFFER_ISSUED',
    updatedBy: userId,
    notes: notes || `Offer Letter issued by ${company.companyName}`,
    timestamp: new Date(),
  });

  await placement.save();

  // Update application status
  application.status = 'SELECTED';
  await application.save();

  // Send Notification & Email to Student
  const studentUser = (application.student as any)?.user;
  const notificationServiceImport = require('../services/notificationService').notificationService;
  const emailServiceImport = require('../services/emailService').emailService;

  if (studentUser) {
    const jobTitle = (application.job as any)?.title || placement.role;
    await notificationServiceImport.createNotification({
      userId: studentUser._id,
      title: 'Job Offer Received!',
      message: `Congratulations! ${company.companyName} has issued an official job offer for ${jobTitle}.`,
      type: 'OFFER_LETTER',
      jobId: application.job._id,
      companyId: company._id,
      applicationId: application._id,
    });

    if (studentUser.email) {
      emailServiceImport.sendOfferLetterReceivedNotification(
        studentUser.email,
        studentUser.name || 'Student',
        company.companyName,
        jobTitle,
        { salary: placement.salary || `${placement.ctcLpa} LPA`, joiningDate: placement.joiningDate },
        studentUser._id
      );
    }
  }

  return res.status(200).json(ApiResponse.success('Offer Letter issued successfully', placement));
};

