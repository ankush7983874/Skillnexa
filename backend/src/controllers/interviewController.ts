import { Response } from 'express';
import { Interview } from '../models/Interview';
import { Application } from '../models/Application';
import { Student } from '../models/Student';
import { Company } from '../models/Company';
import { emailService } from '../services/emailService';
import { notificationService } from '../services/notificationService';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { z } from 'zod';

const scheduleSchema = z.object({
  applicationId: z.string(),
  type: z.enum(['ONLINE', 'OFFLINE', 'PHONE']),
  date: z.string(),
  time: z.string(),
  locationLink: z.string().optional(),
  interviewer: z.string().optional(),
  instructions: z.string().optional(),
});

export const scheduleInterview = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const validated = scheduleSchema.parse(req.body);
    const company = await Company.findOne({ user: req.user?._id });
    if (!company) {
      res.status(404).json({ success: false, message: 'Company profile not found' });
      return;
    }

    const application = await Application.findOne({ _id: validated.applicationId, company: company._id })
      .populate('job', 'title companyName')
      .populate({
        path: 'student',
        populate: { path: 'user', select: 'name email' }
      });

    if (!application) {
      res.status(404).json({ success: false, message: 'Application not found' });
      return;
    }

    const interview = await Interview.create({
      student: application.student._id,
      company: company._id,
      job: application.job._id,
      application: application._id,
      type: validated.type,
      date: new Date(validated.date),
      time: validated.time,
      locationLink: validated.locationLink,
      interviewer: validated.interviewer,
      instructions: validated.instructions,
      status: 'SCHEDULED'
    });

    // Update application status automatically to INTERVIEW if not already
    if (application.status !== 'INTERVIEW' && application.status !== 'INTERVIEW_COMPLETED' && application.status !== 'SELECTED') {
      application.status = 'INTERVIEW';
      application.history.push({
        status: 'INTERVIEW',
        remarks: 'Interview Scheduled',
        changedAt: new Date()
      });
      await application.save();
    }

    const studentUser = (application.student as any).user;
    const jobInfo = application.job as any;

    try {
      await emailService.sendInterviewScheduled(
        studentUser.email,
        studentUser.name,
        company.companyName,
        jobInfo.title,
        interview.date,
        interview.time,
        interview.type,
        interview.locationLink || '',
        interview.instructions || '',
        application._id,
        studentUser._id
      );

      await notificationService.createNotification(
        studentUser._id,
        'Interview Scheduled',
        `An interview has been scheduled for your application to ${company.companyName}.`,
        'INTERVIEW_SCHEDULED',
        interview._id,
        'Interview'
      );
    } catch (e) {
      console.error('Error sending schedule notification', e);
    }

    res.status(201).json({ success: true, message: 'Interview scheduled successfully', data: interview });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, message: 'Validation error', errors: error.errors });
      return;
    }
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const rescheduleSchema = z.object({
  date: z.string(),
  time: z.string(),
  locationLink: z.string().optional(),
  instructions: z.string().optional(),
});

export const updateInterview = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'RESCHEDULE', 'CANCEL', 'COMPLETE'
    
    const company = await Company.findOne({ user: req.user?._id });
    if (!company) {
      res.status(404).json({ success: false, message: 'Company not found' });
      return;
    }

    const interview = await Interview.findOne({ _id: id, company: company._id })
      .populate('application')
      .populate({
        path: 'student',
        populate: { path: 'user', select: 'name email' }
      });
      
    if (!interview) {
      res.status(404).json({ success: false, message: 'Interview not found' });
      return;
    }

    const studentUser = (interview.student as any).user;
    const application = interview.application as any;
    // We need job info for emails. We'll find it manually to avoid deep populates issue
    await application.populate('job', 'title companyName');
    const jobInfo = application.job;

    if (action === 'RESCHEDULE') {
      const validated = rescheduleSchema.parse(req.body.data);
      interview.date = new Date(validated.date);
      interview.time = validated.time;
      if (validated.locationLink) interview.locationLink = validated.locationLink;
      if (validated.instructions) interview.instructions = validated.instructions;
      interview.status = 'SCHEDULED';
      
      try {
        await emailService.sendInterviewRescheduled(
          studentUser.email,
          studentUser.name,
          company.companyName,
          jobInfo.title,
          interview.date,
          interview.time,
          interview.type,
          interview.locationLink || '',
          interview.instructions || '',
          application._id,
          studentUser._id
        );
        await notificationService.createNotification(studentUser._id, 'Interview Rescheduled', `Your interview for ${jobInfo.title} has been rescheduled.`, 'INTERVIEW_RESCHEDULED');
      } catch (e) {}

    } else if (action === 'CANCEL') {
      interview.status = 'CANCELLED';
      try {
        await emailService.sendInterviewCancelled(studentUser.email, studentUser.name, company.companyName, jobInfo.title, application._id, studentUser._id);
        await notificationService.createNotification(studentUser._id, 'Interview Cancelled', `Your interview for ${jobInfo.title} has been cancelled.`, 'INTERVIEW_CANCELLED');
      } catch (e) {}
      
    } else if (action === 'COMPLETE') {
      const { feedbackScore, feedbackRemarks } = req.body.data || {};
      interview.status = 'COMPLETED';
      interview.feedbackScore = feedbackScore;
      interview.feedbackRemarks = feedbackRemarks;
      
      // Update application status to INTERVIEW_COMPLETED
      application.status = 'INTERVIEW_COMPLETED';
      application.history.push({
        status: 'INTERVIEW_COMPLETED',
        remarks: 'Interview marked as completed by company',
        changedAt: new Date()
      });
      await application.save();
    } else {
      res.status(400).json({ success: false, message: 'Invalid action' });
      return;
    }

    await interview.save();
    res.status(200).json({ success: true, message: `Interview ${action.toLowerCase()}d successfully`, data: interview });

  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// GET /api/interviews/company
export const getCompanyInterviews = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const company = await Company.findOne({ user: req.user?._id });
    if (!company) {
      res.status(404).json({ success: false, message: 'Company not found' });
      return;
    }

    const interviews = await Interview.find({ company: company._id })
      .populate('job', 'title')
      .populate({
        path: 'student',
        populate: { path: 'user', select: 'name email' }
      })
      .sort({ date: 1, time: 1 });

    res.status(200).json({ success: true, data: interviews });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// GET /api/interviews/student
export const getStudentInterviews = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const student = await Student.findOne({ user: req.user?._id });
    if (!student) {
      res.status(404).json({ success: false, message: 'Student not found' });
      return;
    }

    const interviews = await Interview.find({ student: student._id })
      .populate('job', 'title companyName')
      .populate('company', 'companyName website')
      .sort({ date: 1, time: 1 });

    res.status(200).json({ success: true, data: interviews });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
