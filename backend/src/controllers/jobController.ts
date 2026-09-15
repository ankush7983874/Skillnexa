import { Request, Response } from 'express';
import { Job } from '../models/Job';
import { InternshipPosting } from '../models/Internship';
import { Company } from '../models/Company';
import { User } from '../models/User';
import { Student } from '../models/Student';
import { CompanyFollow } from '../models/CompanyFollow';
import { notificationService } from '../services/notificationService';
import { emailService } from '../services/emailService';
import { calculateCandidateMatch } from '../services/matchingService';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { createJobSchema, createInternshipSchema } from '../validators/jobValidator';

export const createJob = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?._id;
  const userRole = req.user?.role;

  // Verification Check: Only VERIFIED companies can post jobs (PRD Rule 20)
  if (userRole === 'COMPANY' && req.user?.companyVerificationStatus !== 'VERIFIED' && req.user?.companyVerificationStatus !== 'APPROVED') {
    throw ApiError.forbidden(
      `Only VERIFIED companies can create and publish jobs. Current verification status is '${req.user?.companyVerificationStatus || 'PENDING'}'. Please contact Administrator for company verification.`
    );
  }

  let company = await Company.findOne({ user: userId });
  if (!company && userRole === 'COMPANY') {
    company = await Company.create({
      user: userId,
      companyName: req.user?.name || 'Partner Company',
    });
  }

  const validated = createJobSchema.parse(req.body);

  const job = await Job.create({
    company: company?._id || userId,
    user: userId,
    companyName: company?.companyName || req.user?.name || 'Partner Company',
    title: validated.title,
    description: validated.description,
    requiredSkills: validated.requiredSkills,
    preferredSkills: validated.preferredSkills || [],
    minCgpa: validated.minCgpa,
    allowedBranches: validated.allowedBranches || [],
    allowedGraduationYears: validated.allowedGraduationYears || [],
    experience: validated.experience,
    location: validated.location,
    salary: validated.salary,
    employmentType: validated.employmentType,
    deadline: validated.deadline,
    status: 'Published',
  });

  // Asynchronously trigger Notifications & AI Matching (non-blocking)
  setImmediate(async () => {
    try {
      const companyId = company?._id || userId;
      const companyName = company?.companyName || req.user?.name || 'Partner Company';

      // 1. Send JOB_POSTED notification to all students following this company
      const follows = await CompanyFollow.find({ company: companyId }).populate({
        path: 'student',
        populate: { path: 'user' },
      });

      for (const follow of follows) {
        const studentObj = follow.student as any;
        const studentUser = studentObj?.user;
        if (!studentUser) continue;

        const sent = await notificationService.hasNotificationBeenSent(studentUser._id, job._id, 'JOB_POSTED');
        if (!sent) {
          await notificationService.createNotification({
            userId: studentUser._id,
            title: 'New Job Posted',
            message: `${companyName} has posted a new ${job.title} opportunity.`,
            type: 'JOB_POSTED',
            jobId: job._id,
            companyId: companyId,
            relatedEntityId: job._id,
            relatedEntityType: 'Job',
          });

          if (studentUser.email) {
            emailService.sendNewJobNotification(studentUser.email, studentUser.name || 'Student', companyName, job.title, job._id, studentUser._id);
          }
        }
      }

      // 2. Trigger AI Matching & send AI_JOB_MATCH notification for Strong Matches (>= 80%)
      const allStudents = await Student.find().populate('user', 'name email');
      const STRONG_MATCH_THRESHOLD = 80;

      for (const std of allStudents) {
        const stdUser = std.user as any;
        if (!stdUser) continue;

        try {
          const matchResult = calculateCandidateMatch(std, job, stdUser);
          if (matchResult.matchScore >= STRONG_MATCH_THRESHOLD) {
            const alreadyNotified = await notificationService.hasNotificationBeenSent(stdUser._id, job._id, 'AI_JOB_MATCH');
            if (!alreadyNotified) {
              await notificationService.createNotification({
                userId: stdUser._id,
                title: 'AI Job Match Opportunity',
                message: `Your profile matches the ${job.title} role at ${companyName} with an ${matchResult.matchScore}% match.`,
                type: 'AI_JOB_MATCH',
                jobId: job._id,
                companyId: companyId,
                matchScore: matchResult.matchScore,
                matchedSkills: matchResult.matchedSkills,
                missingSkills: matchResult.missingSkills,
                relatedEntityId: job._id,
                relatedEntityType: 'Job',
              });

              if (stdUser.email) {
                emailService.sendStrongMatchNotification(stdUser.email, stdUser.name || 'Student', companyName, job.title, matchResult.matchScore, job._id, stdUser._id);
              }
            }
          }
        } catch (matchErr) {
          console.warn(`[AI_MATCH_TRIGGER] Skill matching failed for student ${std._id}:`, matchErr);
        }
      }
    } catch (evtErr) {
      console.error('[JOB_PUBLISHED_EVENTS] Background notification/matching error:', evtErr);
    }
  });

  return res.status(201).json(ApiResponse.success('Job posting created and published successfully', job));
};

export const getJobs = async (req: Request, res: Response) => {
  const { search, skill, location, companyId } = req.query;
  const filter: any = { status: 'Published' };

  if (search) {
    filter.$or = [
      { title: { $regex: search as string, $options: 'i' } },
      { companyName: { $regex: search as string, $options: 'i' } },
      { description: { $regex: search as string, $options: 'i' } },
    ];
  }

  if (skill) {
    filter.requiredSkills = { $in: [(skill as string)] };
  }

  if (location) {
    filter.location = { $regex: location as string, $options: 'i' };
  }

  if (companyId) {
    filter.company = companyId;
  }

  const jobs = await Job.find(filter).sort({ createdAt: -1 });
  return res.status(200).json(ApiResponse.success('Published jobs retrieved', jobs));
};


export const getJobById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const job = await Job.findById(id).populate('company');
  if (!job) {
    throw ApiError.notFound('Job posting not found');
  }
  return res.status(200).json(ApiResponse.success('Job details retrieved', job));
};

export const createInternship = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?._id;
  const userRole = req.user?.role;

  if (userRole === 'COMPANY' && req.user?.companyVerificationStatus !== 'VERIFIED' && req.user?.companyVerificationStatus !== 'APPROVED') {
    throw ApiError.forbidden(
      `Only VERIFIED companies can publish internships. Current verification status is '${req.user?.companyVerificationStatus || 'PENDING'}'.`
    );
  }

  const company = await Company.findOne({ user: userId });
  const validated = createInternshipSchema.parse(req.body);

  const internship = await InternshipPosting.create({
    company: company?._id || userId,
    user: userId,
    companyName: company?.companyName || req.user?.name || 'Partner Company',
    title: validated.title,
    description: validated.description,
    requiredSkills: validated.requiredSkills,
    duration: validated.duration,
    stipend: validated.stipend,
    mentor: validated.mentor || 'Senior Software Engineer',
    mode: validated.mode,
    status: 'Published',
  });

  return res.status(201).json(ApiResponse.success('Internship posting published successfully', internship));
};

export const getInternships = async (req: Request, res: Response) => {
  const internships = await InternshipPosting.find({ status: 'Published' }).sort({ createdAt: -1 });
  return res.status(200).json(ApiResponse.success('Published internships retrieved', internships));
};
