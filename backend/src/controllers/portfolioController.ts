import { Request, Response } from 'express';
import { Student } from '../models/Student';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

// ==========================================
// PORTFOLIO GENERAL
// ==========================================

export const getMyPortfolio = async (req: AuthenticatedRequest, res: Response) => {
  const student = await Student.findOne({ user: req.user?._id }).populate('user', 'name email avatarUrl');
  if (!student) {
    throw ApiError.notFound('Student profile not found');
  }

  // Recalculate completion percentage before returning
  const completion = student.calculateCompletionPercentage();
  if (student.profileCompletionPercentage !== completion) {
    student.profileCompletionPercentage = completion;
    await student.save();
  }

  res.status(200).json(ApiResponse.success('Portfolio retrieved successfully', student));
};

export const getPublicPortfolio = async (req: AuthenticatedRequest, res: Response) => {
  const { studentId } = req.params;
  const isCompany = req.user?.role === 'COMPANY';

  // Try lookup by Student._id first, then fallback to User._id
  let student = await Student.findById(studentId).populate('user', 'name email avatarUrl').catch(() => null);
  if (!student) {
    student = await Student.findOne({ user: studentId }).populate('user', 'name email avatarUrl');
  }
  if (!student) {
    throw ApiError.notFound('Student profile not found');
  }

  // Check privacy settings
  if (isCompany && !student.privacySettings.companyVisiblePortfolio) {
    throw ApiError.forbidden('This student\'s portfolio is private');
  }
  if (!isCompany && req.user?._id.toString() !== student.user._id.toString() && !student.privacySettings.publicPortfolio) {
    throw ApiError.forbidden('This student\'s portfolio is private');
  }

  // Filter based on visibility
  const filteredData = { ...student.toObject() };
  if (!student.privacySettings.resumeVisibility) delete (filteredData as any).resumeUrl;
  if (!student.privacySettings.certificateVisibility) delete (filteredData as any).certificates;
  if (!student.privacySettings.projectVisibility) delete (filteredData as any).projects;

  res.status(200).json(ApiResponse.success('Portfolio retrieved successfully', filteredData));
};

export const updatePrivacySettings = async (req: AuthenticatedRequest, res: Response) => {
  // Accept both: { privacySettings: {...} } and flat body { isPublic, showCgpa, ... }
  const rawSettings = req.body.privacySettings || req.body;
  const student = await Student.findOne({ user: req.user?._id });
  if (!student) throw ApiError.notFound('Student profile not found');

  // Map flat frontend keys to model keys
  const mapped: any = {};
  if (rawSettings.isPublic !== undefined) mapped.publicPortfolio = rawSettings.isPublic;
  if (rawSettings.showCgpa !== undefined) mapped.showCgpa = rawSettings.showCgpa;
  if (rawSettings.showContactInfo !== undefined) mapped.showContactInfo = rawSettings.showContactInfo;
  if (rawSettings.showProjects !== undefined) mapped.projectVisibility = rawSettings.showProjects;
  if (rawSettings.showCertificates !== undefined) mapped.certificateVisibility = rawSettings.showCertificates;
  if (rawSettings.showAchievements !== undefined) mapped.showAchievements = rawSettings.showAchievements;
  if (rawSettings.showInternships !== undefined) mapped.showInternships = rawSettings.showInternships;
  if (rawSettings.showAssessmentScores !== undefined) mapped.showAssessmentScores = rawSettings.showAssessmentScores;
  if (rawSettings.companyVisiblePortfolio !== undefined) mapped.companyVisiblePortfolio = rawSettings.companyVisiblePortfolio;
  if (rawSettings.resumeVisibility !== undefined) mapped.resumeVisibility = rawSettings.resumeVisibility;
  // Also accept direct model keys from nested body
  if (rawSettings.publicPortfolio !== undefined) mapped.publicPortfolio = rawSettings.publicPortfolio;
  if (rawSettings.projectVisibility !== undefined) mapped.projectVisibility = rawSettings.projectVisibility;
  if (rawSettings.certificateVisibility !== undefined) mapped.certificateVisibility = rawSettings.certificateVisibility;

  student.privacySettings = { ...student.privacySettings, ...mapped };
  await student.save();

  res.status(200).json(ApiResponse.success('Privacy settings updated', student.privacySettings));
};

// ==========================================
// PROJECTS
// ==========================================

export const addProject = async (req: AuthenticatedRequest, res: Response) => {
  const student = await Student.findOne({ user: req.user?._id });
  if (!student) throw ApiError.notFound('Student profile not found');

  student.projects.push(req.body);
  student.profileCompletionPercentage = student.calculateCompletionPercentage();
  await student.save();

  res.status(201).json(ApiResponse.success('Project added', student.projects[student.projects.length - 1]));
};

export const updateProject = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const student = await Student.findOne({ user: req.user?._id });
  if (!student) throw ApiError.notFound('Student profile not found');

  const project = (student.projects as any).id(id);
  if (!project) throw ApiError.notFound('Project not found');

  Object.assign(project, req.body);
  student.profileCompletionPercentage = student.calculateCompletionPercentage();
  await student.save();

  res.status(200).json(ApiResponse.success('Project updated', project));
};

export const deleteProject = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const student = await Student.findOne({ user: req.user?._id });
  if (!student) throw ApiError.notFound('Student profile not found');

  (student.projects as any).pull({ _id: id });
  student.profileCompletionPercentage = student.calculateCompletionPercentage();
  await student.save();

  res.status(200).json(ApiResponse.success('Project deleted', null));
};

// ==========================================
// CERTIFICATES
// ==========================================

export const addCertificate = async (req: AuthenticatedRequest, res: Response) => {
  const student = await Student.findOne({ user: req.user?._id });
  if (!student) throw ApiError.notFound('Student profile not found');

  const body = { ...req.body };

  // Map frontend field names to model field names
  const certData: any = {
    certificateName: body.certificateName || body.name,
    issuingOrganization: body.issuingOrganization || body.issuer,
    issueDate: body.issueDate,
    expiryDate: body.expiryDate,
    credentialId: body.credentialId,
    credentialUrl: body.credentialUrl,
    verificationStatus: 'PENDING',
  };

  if (body.description) certData.description = body.description;
  if (body.category) certData.category = body.category;
  
  if (req.file) {
    certData.certificateFile = `/uploads/certificates/${req.file.filename}`;
  }

  student.certificates.push(certData);
  student.profileCompletionPercentage = student.calculateCompletionPercentage();
  await student.save();

  res.status(201).json(ApiResponse.success('Certificate added', student.certificates[student.certificates.length - 1]));
};

export const updateCertificate = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const student = await Student.findOne({ user: req.user?._id });
  if (!student) throw ApiError.notFound('Student profile not found');

  const cert = (student.certificates as any).id(id);
  if (!cert) throw ApiError.notFound('Certificate not found');

  const certData = { ...req.body };
  if (req.file) {
    certData.certificateFile = `/uploads/certificates/${req.file.filename}`;
  }
  
  // Prevent self-verification
  if (certData.verificationStatus && certData.verificationStatus !== cert.verificationStatus) {
      if (req.user?.role === 'STUDENT') {
          delete certData.verificationStatus;
      }
  }

  Object.assign(cert, certData);
  student.profileCompletionPercentage = student.calculateCompletionPercentage();
  await student.save();

  res.status(200).json(ApiResponse.success('Certificate updated', cert));
};

export const deleteCertificate = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const student = await Student.findOne({ user: req.user?._id });
  if (!student) throw ApiError.notFound('Student profile not found');

  (student.certificates as any).pull({ _id: id });
  student.profileCompletionPercentage = student.calculateCompletionPercentage();
  await student.save();

  res.status(200).json(ApiResponse.success('Certificate deleted', null));
};

// ==========================================
// ACHIEVEMENTS
// ==========================================

export const addAchievement = async (req: AuthenticatedRequest, res: Response) => {
  const student = await Student.findOne({ user: req.user?._id });
  if (!student) throw ApiError.notFound('Student profile not found');

  const achievementData = { ...req.body };
  achievementData.verificationStatus = 'PENDING'; // Prevent self-verification

  student.achievements.push(achievementData);
  student.profileCompletionPercentage = student.calculateCompletionPercentage();
  await student.save();

  res.status(201).json(ApiResponse.success('Achievement added', student.achievements[student.achievements.length - 1]));
};

export const updateAchievement = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const student = await Student.findOne({ user: req.user?._id });
  if (!student) throw ApiError.notFound('Student profile not found');

  const ach = (student.achievements as any).id(id);
  if (!ach) throw ApiError.notFound('Achievement not found');

  const achievementData = { ...req.body };
  
  if (achievementData.verificationStatus && achievementData.verificationStatus !== ach.verificationStatus) {
      if (req.user?.role === 'STUDENT') {
          delete achievementData.verificationStatus;
      }
  }

  Object.assign(ach, achievementData);
  student.profileCompletionPercentage = student.calculateCompletionPercentage();
  await student.save();

  res.status(200).json(ApiResponse.success('Achievement updated', ach));
};

export const deleteAchievement = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const student = await Student.findOne({ user: req.user?._id });
  if (!student) throw ApiError.notFound('Student profile not found');

  (student.achievements as any).pull({ _id: id });
  student.profileCompletionPercentage = student.calculateCompletionPercentage();
  await student.save();

  res.status(200).json(ApiResponse.success('Achievement deleted', null));
};

// ==========================================
// INTERNSHIPS
// ==========================================

export const addInternship = async (req: AuthenticatedRequest, res: Response) => {
  const student = await Student.findOne({ user: req.user?._id });
  if (!student) throw ApiError.notFound('Student profile not found');

  student.internships.push(req.body);
  student.profileCompletionPercentage = student.calculateCompletionPercentage();
  await student.save();

  res.status(201).json(ApiResponse.success('Internship added', student.internships[student.internships.length - 1]));
};

export const updateInternship = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const student = await Student.findOne({ user: req.user?._id });
  if (!student) throw ApiError.notFound('Student profile not found');

  const int = (student.internships as any).id(id);
  if (!int) throw ApiError.notFound('Internship not found');

  Object.assign(int, req.body);
  student.profileCompletionPercentage = student.calculateCompletionPercentage();
  await student.save();

  res.status(200).json(ApiResponse.success('Internship updated', int));
};

export const deleteInternship = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const student = await Student.findOne({ user: req.user?._id });
  if (!student) throw ApiError.notFound('Student profile not found');

  (student.internships as any).pull({ _id: id });
  student.profileCompletionPercentage = student.calculateCompletionPercentage();
  await student.save();

  res.status(200).json(ApiResponse.success('Internship deleted', null));
};

// ==========================================
// RESUME
// ==========================================

export const uploadResume = async (req: AuthenticatedRequest, res: Response) => {
  const student = await Student.findOne({ user: req.user?._id });
  if (!student) throw ApiError.notFound('Student profile not found');

  if (!req.file) {
    throw ApiError.badRequest('No resume file uploaded');
  }

  student.resumeUrl = `/uploads/resumes/${req.file.filename}`;
  student.profileCompletionPercentage = student.calculateCompletionPercentage();
  await student.save();

  res.status(200).json(ApiResponse.success('Resume uploaded successfully', { resumeUrl: student.resumeUrl }));
};

export const deleteResume = async (req: AuthenticatedRequest, res: Response) => {
  const student = await Student.findOne({ user: req.user?._id });
  if (!student) throw ApiError.notFound('Student profile not found');

  student.resumeUrl = '';
  student.profileCompletionPercentage = student.calculateCompletionPercentage();
  await student.save();

  res.status(200).json(ApiResponse.success('Resume deleted', null));
};
