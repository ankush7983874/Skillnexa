import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { Collaboration } from '../models/Collaboration';
import { Company } from '../models/Company';
import { Institution } from '../models/Institution';
import { Faculty } from '../models/Faculty';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { auditService } from '../services/auditService';

export const createCollaborationProposal = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?._id;
  const role = req.user?.role;
  const { title, type, institutionName, department, description, startDate, endDate } = req.body;

  if (!title || !type || !description) {
    throw ApiError.badRequest('Title, type, and description are required');
  }

  let companyId: any;
  let companyName = 'Partner Company';

  if (role === 'COMPANY') {
    const comp = await Company.findOne({ user: userId });
    if (!comp) throw ApiError.notFound('Company profile not found');
    companyId = comp._id;
    companyName = comp.companyName || 'Partner Company';
  } else {
    // If proposed by institution or faculty, link to first available company or default ID
    const comp = await Company.findOne();
    companyId = comp ? comp._id : userId;
    companyName = comp ? comp.companyName : 'Industry Partner';
  }

  let instId: any;
  if (role === 'INSTITUTION') {
    const inst = await Institution.findOne({ user: userId });
    if (inst) instId = inst._id;
  }

  const collaboration = await Collaboration.create({
    title,
    type,
    company: companyId,
    companyName,
    institution: instId,
    institutionName: institutionName || 'Partner Institution',
    department: department || 'Computer Science',
    description,
    proposedBy: role === 'COMPANY' ? 'COMPANY' : role === 'INSTITUTION' ? 'INSTITUTION' : 'FACULTY',
    status: 'PROPOSED',
    startDate: startDate ? new Date(startDate) : undefined,
    endDate: endDate ? new Date(endDate) : undefined,
  });

  await auditService.log({ userId, role, action: 'COLLABORATION_PROPOSED', resourceId: collaboration._id.toString(), req });

  return res.status(201).json(ApiResponse.success('Collaboration proposed successfully', collaboration));
};

export const listCollaborations = async (req: AuthenticatedRequest, res: Response) => {
  const { type, status } = req.query;
  const filter: any = {};
  if (type) filter.type = type;
  if (status) filter.status = status;

  const collaborations = await Collaboration.find(filter)
    .populate('company', 'companyName industry logoUrl')
    .populate('institution', 'institutionName location')
    .sort({ createdAt: -1 });

  return res.status(200).json(ApiResponse.success('Collaborations retrieved', collaborations));
};

export const updateCollaborationStatus = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?._id;
  const role = req.user?.role;
  const { collaborationId } = req.params;
  const { status, outcomes, documents } = req.body;

  const collaboration = await Collaboration.findById(collaborationId);
  if (!collaboration) throw ApiError.notFound('Collaboration not found');

  collaboration.status = status;
  if (Array.isArray(outcomes)) collaboration.outcomes = outcomes;
  if (Array.isArray(documents)) collaboration.documents = documents;

  await collaboration.save();
  await auditService.log({ userId, role, action: 'COLLABORATION_STATUS_UPDATED', resourceId: collaborationId, metadata: { status }, req });

  return res.status(200).json(ApiResponse.success('Collaboration updated successfully', collaboration));
};
