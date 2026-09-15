import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { Student } from '../models/Student';
import { Placement } from '../models/Placement';
import { Application } from '../models/Application';
import { AssessmentResult } from '../models/AssessmentResult';
import { Faculty } from '../models/Faculty';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';

export const getDepartmentAnalytics = async (req: AuthenticatedRequest, res: Response) => {
  const { department = 'Computer Science' } = req.query;

  // Filter students by department / branch
  const students = await Student.find({
    $or: [
      { branch: { $regex: department as string, $options: 'i' } },
      { department: { $regex: department as string, $options: 'i' } },
    ],
  }).populate('user', 'name email phone');

  const totalStudents = students.length;
  const studentIds = students.map((s) => s._id);

  // At-risk students: CGPA < 6.5 or 0 verified skills
  const atRiskStudents = students
    .filter((s) => (s.cgpa && s.cgpa < 6.5) || s.skills.length === 0 || !s.skills.some((sk) => sk.verified))
    .map((s) => ({
      _id: s._id,
      name: (s.user as any)?.name || 'Student',
      email: (s.user as any)?.email,
      cgpa: s.cgpa || 0,
      skillsCount: s.skills.length,
      verifiedSkillsCount: s.skills.filter((sk) => sk.verified).length,
      riskReason: (s.cgpa && s.cgpa < 6.5) ? 'Low CGPA (< 6.5)' : 'No Verified Skills',
    }));

  // Placements in department
  const placements = await Placement.find({ student: { $in: studentIds } });
  const totalPlacements = placements.length;
  const placementRate = totalStudents > 0 ? Math.round((totalPlacements / totalStudents) * 100) : 0;

  // Faculty in department
  const facultyCount = await Faculty.countDocuments({
    department: { $regex: department as string, $options: 'i' },
  });

  // Top skills in department
  const skillCounts: Record<string, number> = {};
  students.forEach((s) => {
    s.skills.forEach((sk) => {
      skillCounts[sk.name] = (skillCounts[sk.name] || 0) + 1;
    });
  });

  const topSkills = Object.entries(skillCounts)
    .map(([skill, count]) => ({ skill, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return res.status(200).json(
    ApiResponse.success('Department analytics retrieved', {
      department,
      totalStudents,
      facultyCount,
      totalPlacements,
      placementRate: `${placementRate}%`,
      atRiskCount: atRiskStudents.length,
      atRiskStudents: atRiskStudents.slice(0, 15),
      topSkills,
    })
  );
};
