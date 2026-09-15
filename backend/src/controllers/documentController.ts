import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { DocumentVerification } from '../models/DocumentVerification';
import { Student } from '../models/Student';
import { Faculty } from '../models/Faculty';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { auditService } from '../services/auditService';

export const uploadVerificationDocument = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?._id;
  const role = req.user?.role;
  const { documentType, title, fileUrl, fileMetadata } = req.body;

  if (!documentType || !title || !fileUrl) {
    throw ApiError.badRequest('Document type, title, and file URL are required');
  }

  let studentId: any;
  let facultyId: any;

  if (role === 'STUDENT') {
    const student = await Student.findOne({ user: userId });
    if (student) studentId = student._id;
  } else if (role === 'FACULTY') {
    const faculty = await Faculty.findOne({ user: userId });
    if (faculty) facultyId = faculty._id;
  }

  const doc = await DocumentVerification.create({
    user: userId,
    student: studentId,
    faculty: facultyId,
    documentType,
    title,
    fileUrl,
    fileMetadata: fileMetadata || {},
    status: 'PENDING',
  });

  await auditService.log({ userId, role, action: 'DOCUMENT_UPLOADED', resourceId: doc._id.toString(), req });

  return res.status(201).json(ApiResponse.success('Document submitted for verification', doc));
};

export const getMyDocuments = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?._id;
  const docs = await DocumentVerification.find({ user: userId }).sort({ createdAt: -1 });
  return res.status(200).json(ApiResponse.success('User document verification status retrieved', docs));
};

export const listPendingDocuments = async (req: AuthenticatedRequest, res: Response) => {
  const { status, documentType } = req.query;
  const filter: any = {};

  filter.status = status || 'PENDING';
  if (documentType) filter.documentType = documentType;

  const docs = await DocumentVerification.find(filter)
    .populate('user', 'name email role phone')
    .sort({ createdAt: -1 });

  return res.status(200).json(ApiResponse.success('Document verification list retrieved', docs));
};

export const verifyOrRejectDocument = async (req: AuthenticatedRequest, res: Response) => {
  const verifierId = req.user?._id;
  const verifierRole = req.user?.role;
  const { documentId } = req.params;
  const { status, rejectionReason } = req.body;

  if (!['VERIFIED', 'REJECTED'].includes(status)) {
    throw ApiError.badRequest('Status must be VERIFIED or REJECTED');
  }

  const doc = await DocumentVerification.findById(documentId);
  if (!doc) throw ApiError.notFound('Document verification record not found');

  doc.status = status;
  doc.verifiedBy = verifierId;
  doc.verifiedAt = new Date();
  if (status === 'REJECTED') {
    doc.rejectionReason = rejectionReason || 'Document criteria not met';
  }
  await doc.save();

  await auditService.log({
    userId: verifierId,
    role: verifierRole,
    action: `DOCUMENT_${status}`,
    resourceId: documentId,
    metadata: { rejectionReason },
    req,
  });

  return res.status(200).json(ApiResponse.success(`Document marked as ${status}`, doc));
};
