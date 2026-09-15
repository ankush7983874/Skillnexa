import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { Placement } from '../models/Placement';
import { Student } from '../models/Student';
import { ProctoredAssessmentAttempt } from '../models/ProctoredAssessmentAttempt';
import { DocumentVerification } from '../models/DocumentVerification';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';

export const exportPlacementsReport = async (req: AuthenticatedRequest, res: Response) => {
  const { format = 'json' } = req.query;

  const placements = await Placement.find()
    .populate({
      path: 'student',
      populate: { path: 'user', select: 'name email' },
    })
    .populate('company', 'companyName')
    .populate('job', 'title ctcLpa')
    .sort({ createdAt: -1 });

  if (format === 'csv') {
    let csv = 'Placement ID,Student Name,Student Email,Company,Job Title,CTC (LPA),Joining Status,Selection Date\n';
    placements.forEach((p: any) => {
      const studentName = p.student?.user?.name || 'N/A';
      const studentEmail = p.student?.user?.email || 'N/A';
      const companyName = p.company?.companyName || 'N/A';
      const jobTitle = p.job?.title || p.role || 'N/A';
      const ctc = p.ctcLpa || p.salary || 'N/A';
      const status = p.joiningStatus || 'PENDING';
      const date = new Date(p.selectionDate || p.createdAt).toLocaleDateString();

      csv += `"${p._id}","${studentName}","${studentEmail}","${companyName}","${jobTitle}","${ctc}","${status}","${date}"\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="SkillNexa_Placements_Report.csv"');
    return res.status(200).send(csv);
  }

  return res.status(200).json(ApiResponse.success('Placements report exported', placements));
};

export const exportProctoringLogsReport = async (req: AuthenticatedRequest, res: Response) => {
  const { format = 'json' } = req.query;

  const attempts = await ProctoredAssessmentAttempt.find({ status: { $ne: 'IN_PROGRESS' } })
    .populate('student', 'name email college branch')
    .populate('assessment', 'title passingScore')
    .sort({ createdAt: -1 });

  if (format === 'csv') {
    let csv = 'Attempt ID,Assessment,Skill Score,Integrity Score,Risk Level,Status,Tab Switches,Fullscreen Exits\n';
    attempts.forEach((a: any) => {
      csv += `"${a._id}","${a.assessmentTitle || 'Assessment'}","${a.skillScore || 0}","${a.integrityScore || 100}","${a.riskLevel || 'LOW'}","${a.status}","${a.tabSwitchCount || 0}","${a.fullscreenExitCount || 0}"\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="SkillNexa_Proctoring_Audit_Report.csv"');
    return res.status(200).send(csv);
  }

  return res.status(200).json(ApiResponse.success('Proctoring logs report exported', attempts));
};
