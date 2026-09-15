import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { Student } from '../models/Student';
import { Company } from '../models/Company';
import { Job } from '../models/Job';
import { Faculty } from '../models/Faculty';
import { FacultyOpportunity } from '../models/FacultyOpportunity';
import { ApiResponse } from '../utils/ApiResponse';

export const globalSearch = async (req: AuthenticatedRequest, res: Response) => {
  const { query, category = 'all', page = 1, limit = 10 } = req.query;
  const q = (query as string || '').trim();

  const p = parseInt(page as string, 10);
  const l = parseInt(limit as string, 10);
  const regex = new RegExp(q, 'i');

  const results: any = {};

  if (category === 'all' || category === 'jobs') {
    results.jobs = await Job.find({
      $or: [{ title: regex }, { description: regex }, { requiredSkills: regex }, { location: regex }],
    })
      .select('title type location ctcLpa status companyName requiredSkills createdAt')
      .sort({ createdAt: -1 })
      .limit(l);
  }

  if (category === 'all' || category === 'companies') {
    results.companies = await Company.find({
      $or: [{ companyName: regex }, { industry: regex }, { location: regex }],
    })
      .select('companyName industry location status website logoUrl')
      .limit(l);
  }

  if (category === 'all' || category === 'students') {
    results.students = await Student.find({
      $or: [{ branch: regex }, { college: regex }, { 'skills.name': regex }],
    })
      .populate('user', 'name email phone avatarUrl')
      .select('college branch cgpa skills profileCompletionPercentage')
      .limit(l);
  }

  if (category === 'all' || category === 'faculty') {
    results.faculty = await Faculty.find({
      $or: [{ department: regex }, { institution: regex }, { designation: regex }, { specialization: regex }],
    })
      .populate('user', 'name email phone avatarUrl')
      .select('institution department designation specialization researchAreas')
      .limit(l);
  }

  if (category === 'all' || category === 'opportunities') {
    results.opportunities = await FacultyOpportunity.find({
      $or: [{ title: regex }, { description: regex }, { companyName: regex }],
    })
      .select('title type companyName duration location status createdAt')
      .limit(l);
  }

  return res.status(200).json(
    ApiResponse.success('Search results retrieved', {
      query: q,
      category,
      results,
    })
  );
};
