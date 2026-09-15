import { Request, Response } from 'express';
import { Application, ApplicationStatus } from '../models/Application';
import { Job } from '../models/Job';
import { Student } from '../models/Student';
import { Company } from '../models/Company';
import { Placement } from '../models/Placement';
import { emailService } from '../services/emailService';
import { notificationService } from '../services/notificationService';
import { calculateCandidateMatch } from '../services/matchingService';
import { z } from 'zod';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

// POST /api/applications/apply
export const applyForJob = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { jobId, applicantDetails, coverLetter, answers } = req.body;
    
    if (!jobId) {
      res.status(400).json({ success: false, message: 'Job ID is required' });
      return;
    }

    const job = await Job.findById(jobId).populate('company');
    if (!job) {
      res.status(404).json({ success: false, message: 'Job posting not found' });
      return;
    }

    if (job.status !== 'Published') {
      res.status(400).json({ success: false, message: 'Cannot apply to a job that is not published' });
      return;
    }

    const student = await Student.findOne({ user: req.user?._id }).populate('user', 'name email phone');
    if (!student) {
      res.status(404).json({ success: false, message: 'Student profile not found. Please complete your profile first.' });
      return;
    }

    // Check if already applied
    const existingApplication = await Application.findOne({ student: student._id, job: job._id });
    if (existingApplication) {
      res.status(400).json({
        success: false,
        message: 'You have already applied for this job',
        data: existingApplication,
      });
      return;
    }

    // Validate required job-specific questions if configured for the job
    const jobQuestions = job.questions || [];
    if (jobQuestions.length > 0) {
      const answersMap: Record<string, string> = {};
      (answers || []).forEach((a: any) => {
        if (a.questionId && a.answer) answersMap[a.questionId] = a.answer.trim();
      });

      for (const q of jobQuestions) {
        if (q.required && (!answersMap[q.id] || answersMap[q.id].length === 0)) {
          res.status(400).json({
            success: false,
            message: `Please answer the required question: "${q.questionText}"`,
          });
          return;
        }
      }
    }

    // Calculate AI Match Score dynamically using aggregated real student profile data
    let matchResult: any = null;
    let matchScore = 0;
    let matchBreakdown = null;

    try {
      matchResult = calculateCandidateMatch(student, job, req.user);
      matchScore = matchResult.matchScore;
      matchBreakdown = matchResult.breakdown;
    } catch (err) {
      console.warn('Could not calculate match score during application', err);
    }

    // Format pre-filled or submitted applicant details
    const formattedApplicantDetails = {
      fullName: applicantDetails?.fullName || (req.user as any)?.name || 'Student Candidate',
      email: applicantDetails?.email || (req.user as any)?.email || '',
      mobileNumber: applicantDetails?.mobileNumber || (req.user as any)?.phone || '',
      college: applicantDetails?.college || student.college || '',
      branch: applicantDetails?.branch || student.branch || '',
      degree: applicantDetails?.degree || student.degree || '',
      graduationYear: applicantDetails?.graduationYear || student.graduationYear || new Date().getFullYear(),
      cgpa: applicantDetails?.cgpa || student.cgpa || 0,
      technicalSkills: applicantDetails?.technicalSkills || (student.skills || []).map((s) => s.name),
      programmingLanguages: applicantDetails?.programmingLanguages || [],
      resumeUrl: applicantDetails?.resumeUrl || student.resumeUrl || '',
    };

    const application = await Application.create({
      student: student._id,
      job: job._id,
      company: job.company,
      status: 'APPLIED',
      matchScore,
      matchBreakdown,
      applicantDetails: formattedApplicantDetails,
      coverLetter: coverLetter || '',
      answers: answers || [],
      history: [{ status: 'APPLIED', remarks: 'Application submitted after form review' }],
    });

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: application,
    });
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(400).json({ success: false, message: 'You have already applied for this job' });
      return;
    }
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// GET /api/applications/check/:jobId (For Students)
export const checkJobApplication = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { jobId } = req.params;
    const student = await Student.findOne({ user: req.user?._id });
    if (!student) {
      res.status(404).json({ success: false, message: 'Student profile not found' });
      return;
    }

    const application = await Application.findOne({ student: student._id, job: jobId });
    if (application) {
      res.status(200).json({
        success: true,
        applied: true,
        data: application,
      });
      return;
    }

    res.status(200).json({
      success: true,
      applied: false,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// GET /api/applications/my-applications (For Students)
export const getMyApplications = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const student = await Student.findOne({ user: req.user?._id });
    if (!student) {
      res.status(404).json({ success: false, message: 'Student profile not found' });
      return;
    }

    const applications = await Application.find({ student: student._id })
      .populate('job', 'title companyName location employmentType salary deadline status')
      .populate('company', 'companyName website industry')
      .sort({ appliedAt: -1 });

    res.status(200).json({
      success: true,
      data: applications
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// GET /api/applications/job/:jobId (For Companies)
export const getJobApplications = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { jobId } = req.params;
    
    const company = await Company.findOne({ user: req.user?._id });
    if (!company) {
      res.status(404).json({ success: false, message: 'Company profile not found' });
      return;
    }

    const job = await Job.findOne({ _id: jobId, company: company._id });
    if (!job) {
      res.status(404).json({ success: false, message: 'Job not found or you do not have permission' });
      return;
    }

    const applications = await Application.find({ job: job._id })
      .populate({
        path: 'student',
        populate: { path: 'user', select: 'name email' }
      })
      .sort({ matchScore: -1, appliedAt: -1 }); // Sort by AI match score highest first

    res.status(200).json({
      success: true,
      data: applications
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// PATCH /api/applications/:id/status (For Companies)
const updateStatusSchema = z.object({
  status: z.enum(['APPLIED', 'UNDER_REVIEW', 'ELIGIBLE', 'SHORTLISTED', 'INTERVIEW', 'INTERVIEW_COMPLETED', 'SELECTED', 'REJECTED', 'WITHDRAWN']),
  remarks: z.string().optional()
});

export const updateApplicationStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const validatedData = updateStatusSchema.parse(req.body);

    const company = await Company.findOne({ user: req.user?._id });
    if (!company) {
      res.status(404).json({ success: false, message: 'Company profile not found' });
      return;
    }

    const application = await Application.findOne({ _id: id, company: company._id })
      .populate('job', 'title companyName')
      .populate({
        path: 'student',
        populate: { path: 'user', select: 'name email' }
      });
      
    if (!application) {
      res.status(404).json({ success: false, message: 'Application not found or unauthorized' });
      return;
    }

    const previousStatus = application.status;
    application.status = validatedData.status;
    application.history.push({
      status: validatedData.status,
      remarks: validatedData.remarks || `Status updated to ${validatedData.status}`,
      changedAt: new Date()
    });

    await application.save();

    const studentUser = (application.student as any)?.user;
    const jobInfo = application.job as any;

    // Handle Final Selection / Placements / Emails
    if (validatedData.status === 'SELECTED' && previousStatus !== 'SELECTED') {
      try {
        await Placement.create({
          student: application.student._id,
          company: company._id,
          job: application.job._id,
          application: application._id,
          role: jobInfo.title,
        });

        await emailService.sendCandidateSelected(
          studentUser.email,
          studentUser.name,
          jobInfo.companyName,
          jobInfo.title,
          application._id,
          studentUser._id
        );

        await notificationService.createNotification(
          studentUser._id,
          'You are Selected!',
          `Congratulations! You have been selected for the role of ${jobInfo.title} at ${jobInfo.companyName}.`,
          'APPLICATION_SELECTED',
          application._id,
          'Application'
        );
      } catch (err: any) {
        console.error('Error during selection workflow (Placement/Email/Notification):', err);
        // Do not throw; we still want to return success for the status update
      }
    } else if (validatedData.status === 'REJECTED' && previousStatus !== 'REJECTED') {
      try {
        await emailService.sendCandidateRejected(
          studentUser.email,
          studentUser.name,
          jobInfo.companyName,
          jobInfo.title,
          application._id,
          studentUser._id
        );
      } catch (err: any) {
        console.error('Error sending rejection email:', err);
      }
    } else if (validatedData.status === 'SHORTLISTED' && previousStatus !== 'SHORTLISTED') {
      try {
        await notificationService.createNotification({
          userId: studentUser._id,
          title: 'Application Shortlisted',
          message: `Congratulations! You have been shortlisted by ${jobInfo.companyName} for ${jobInfo.title}.`,
          type: 'SHORTLISTED',
          jobId: application.job._id,
          companyId: company._id,
          applicationId: application._id,
        });

        if (studentUser.email) {
          emailService.sendCandidateShortlistedNotification(
            studentUser.email,
            studentUser.name || 'Student',
            jobInfo.companyName,
            jobInfo.title,
            application._id,
            studentUser._id
          );
        }
      } catch (err) {
        console.error('Error sending shortlist notification:', err);
      }
    }

    res.status(200).json({
      success: true,
      message: `Application status updated to ${validatedData.status}`,
      data: application
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, message: 'Validation error', errors: error.errors });
      return;
    }
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
