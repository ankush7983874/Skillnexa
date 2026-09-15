import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './authMiddleware';
import { ApiError } from '../utils/ApiError';
import { UserRole } from '../models/User';

export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(ApiError.unauthorized('User not authenticated'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        ApiError.forbidden(
          `User role '${req.user.role}' is not authorized to access this resource`
        )
      );
    }

    next();
  };
};

export const requireVerifiedCompany = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return next(ApiError.unauthorized('User not authenticated'));
  }

  if (req.user.role === 'COMPANY') {
    const status = req.user.companyVerificationStatus;
    if (status !== 'VERIFIED' && status !== 'APPROVED') {
      return next(
        ApiError.forbidden(
          `Company account verification is ${status || 'PENDING'}. An Admin must approve your company account before you can use recruitment features.`
        )
      );
    }
  }

  next();
};

export const requireVerifiedFaculty = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return next(ApiError.unauthorized('User not authenticated'));
  }

  if (req.user.role === 'FACULTY') {
    const status = req.user.companyVerificationStatus;
    if (status !== 'VERIFIED' && status !== 'APPROVED') {
      return next(
        ApiError.forbidden(
          `Faculty account verification is ${status || 'PENDING'}. Institutional or Admin verification is required to access faculty features.`
        )
      );
    }
  }

  next();
};
