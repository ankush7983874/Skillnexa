import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { Student } from '../models/Student';
import { Company } from '../models/Company';
import { Job } from '../models/Job';
import { Application } from '../models/Application';
import { Placement } from '../models/Placement';
import { Institution } from '../models/Institution';
import { Faculty } from '../models/Faculty';
import { User } from '../models/User';
import { AssessmentResult } from '../models/AssessmentResult';
import { ApiResponse } from '../utils/ApiResponse';

export const getSystemAnalytics = async (req: AuthenticatedRequest, res: Response) => {
  const role = req.user?.role;
  const userId = req.user?._id;

  const totalUsers = await User.countDocuments();
  const totalStudents = await Student.countDocuments();
  const totalCompanies = await Company.countDocuments();
  const totalFaculty = await Faculty.countDocuments();
  const totalInstitutions = await Institution.countDocuments();
  const totalJobs = await Job.countDocuments();
  const totalApplications = await Application.countDocuments();
  const totalPlacements = await Placement.countDocuments();

  // Placement status breakdown
  const placementsByStatus = await Placement.aggregate([
    { $group: { _id: '$joiningStatus', count: { $sum: 1 } } },
  ]);

  // Skill demand distribution
  const skillsDistribution = await Student.aggregate([
    { $unwind: '$skills' },
    { $group: { _id: '$skills.name', count: { $sum: 1 }, avgScore: { $avg: '$skills.score' } } },
    { $sort: { count: -1 } },
    { $limit: 10 },
  ]);

  // Application conversion funnel
  const applicationFunnel = await Application.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  return res.status(200).json(
    ApiResponse.success('Analytics overview retrieved successfully', {
      userRole: role,
      metrics: {
        totalUsers,
        totalStudents,
        totalCompanies,
        totalFaculty,
        totalInstitutions,
        totalJobs,
        totalApplications,
        totalPlacements,
      },
      placementsByStatus: placementsByStatus.reduce((acc, curr) => ({ ...acc, [curr._id || 'PENDING']: curr.count }), {}),
      skillsDistribution: skillsDistribution.map((s) => ({ skill: s._id, studentCount: s.count, avgScore: Math.round(s.avgScore || 0) })),
      applicationFunnel: applicationFunnel.reduce((acc, curr) => ({ ...acc, [curr._id]: curr.count }), {}),
    })
  );
};
