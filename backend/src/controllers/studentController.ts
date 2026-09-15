import { Response } from 'express';
import { Student } from '../models/Student';
import { User } from '../models/User';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import {
  updateStudentProfileSchema,
  addProjectSchema,
  addCertificationSchema,
  addInternshipSchema,
} from '../validators/studentValidator';

export const getProfile = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?._id;
  const student = await Student.findOne({ user: userId }).populate('user', 'name email phone avatarUrl role');

  if (!student) {
    throw ApiError.notFound('Student profile not found');
  }

  // Ensure dynamic completion score is calculated
  student.profileCompletionPercentage = student.calculateCompletionPercentage();
  await student.save();

  return res.status(200).json(ApiResponse.success('Student profile retrieved successfully', student));
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?._id;
  const validated = updateStudentProfileSchema.parse(req.body);

  let student = await Student.findOne({ user: userId });
  if (!student) {
    student = new Student({ user: userId });
  }

  if (validated.college !== undefined) student.college = validated.college;
  if (validated.degree !== undefined) student.degree = validated.degree;
  if (validated.branch !== undefined) student.branch = validated.branch;
  if (validated.semester !== undefined) student.semester = validated.semester;
  if (validated.cgpa !== undefined) student.cgpa = validated.cgpa;
  if (validated.graduationYear !== undefined) student.graduationYear = validated.graduationYear;
  if ((validated as any).yearOfGraduation !== undefined) student.graduationYear = (validated as any).yearOfGraduation;
  if (validated.softSkills !== undefined) student.softSkills = validated.softSkills;
  if (validated.interests !== undefined) student.interests = validated.interests;
  if (validated.resumeUrl !== undefined) student.resumeUrl = validated.resumeUrl;
  if (validated.githubUrl !== undefined) student.githubUrl = validated.githubUrl;
  if (validated.linkedinUrl !== undefined) student.linkedinUrl = validated.linkedinUrl;
  if (validated.portfolioUrl !== undefined) student.portfolioUrl = validated.portfolioUrl;

  // Update phone on user document if provided
  if ((validated as any).phone) {
    await User.findByIdAndUpdate(userId, { phone: (validated as any).phone });
  }

  if (validated.skills !== undefined) {
    // Merge skills preserving existing scores if verified
    const updatedSkills = validated.skills.map((newSkill) => {
      const existing = student?.skills.find((s) => s.name.toLowerCase() === newSkill.name.toLowerCase());
      return {
        name: newSkill.name,
        category: newSkill.category || 'General',
        score: existing && existing.verified ? existing.score : newSkill.score || 50,
        verified: existing ? existing.verified : false,
      };
    });
    student.skills = updatedSkills;
  }

  student.profileCompletionPercentage = student.calculateCompletionPercentage();
  await student.save();

  const populated = await Student.findById(student._id).populate('user', 'name email phone avatarUrl role');
  return res.status(200).json(ApiResponse.success('Student profile updated successfully', populated));
};

export const addProject = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?._id;
  const validated = addProjectSchema.parse(req.body);

  const student = await Student.findOne({ user: userId });
  if (!student) {
    throw ApiError.notFound('Student profile not found');
  }

  student.projects.push(validated);
  student.profileCompletionPercentage = student.calculateCompletionPercentage();
  await student.save();

  return res.status(201).json(ApiResponse.success('Project added successfully', student));
};

export const addCertification = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?._id;
  const validated = addCertificationSchema.parse(req.body);

  const student = await Student.findOne({ user: userId });
  if (!student) {
    throw ApiError.notFound('Student profile not found');
  }

  student.certificates.push({
    certificateName: validated.title,
    issuingOrganization: validated.issuer,
    issueDate: validated.issueDate,
    credentialUrl: validated.credentialUrl,
    verificationStatus: 'PENDING'
  } as any);
  student.profileCompletionPercentage = student.calculateCompletionPercentage();
  await student.save();

  return res.status(201).json(ApiResponse.success('Certification added successfully', student));
};

export const addInternship = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?._id;
  const validated = addInternshipSchema.parse(req.body);

  const student = await Student.findOne({ user: userId });
  if (!student) {
    throw ApiError.notFound('Student profile not found');
  }

  student.internships.push(validated);
  student.profileCompletionPercentage = student.calculateCompletionPercentage();
  await student.save();

  return res.status(201).json(ApiResponse.success('Internship record added successfully', student));
};

export const getPublicPortfolio = async (req: AuthenticatedRequest, res: Response) => {
  const { studentId } = req.params;

  // Lookup by Student._id first, then fallback to User._id
  let student = await Student.findById(studentId).populate('user', 'name email phone avatarUrl role').catch(() => null);
  if (!student) {
    student = await Student.findOne({ user: studentId }).populate('user', 'name email phone avatarUrl role');
  }
  if (!student) {
    throw ApiError.notFound('Student portfolio not found');
  }

  return res.status(200).json(ApiResponse.success('Student digital portfolio retrieved', student));
};
