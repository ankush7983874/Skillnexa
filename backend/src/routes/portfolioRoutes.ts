import { Router } from 'express';
import {
  getMyPortfolio,
  getPublicPortfolio,
  updatePrivacySettings,
  addProject,
  updateProject,
  deleteProject,
  addCertificate,
  updateCertificate,
  deleteCertificate,
  addAchievement,
  updateAchievement,
  deleteAchievement,
  addInternship,
  updateInternship,
  deleteInternship,
  uploadResume,
  deleteResume
} from '../controllers/portfolioController';
import { protect } from '../middleware/authMiddleware';
import { authorize } from '../middleware/rbacMiddleware';
import { asyncHandler } from '../middleware/asyncHandler';
import { upload } from '../middleware/upload';

const router = Router();

// General Portfolio
router.get('/', protect, authorize('STUDENT'), asyncHandler(getMyPortfolio));
router.put('/privacy', protect, authorize('STUDENT'), asyncHandler(updatePrivacySettings));
router.get('/:studentId', protect, asyncHandler(getPublicPortfolio));

// Projects
router.post('/projects', protect, authorize('STUDENT'), asyncHandler(addProject));
router.put('/projects/:id', protect, authorize('STUDENT'), asyncHandler(updateProject));
router.delete('/projects/:id', protect, authorize('STUDENT'), asyncHandler(deleteProject));

// Certificates
router.post('/certificates', protect, authorize('STUDENT'), upload.single('certificate'), asyncHandler(addCertificate));
router.put('/certificates/:id', protect, authorize('STUDENT'), upload.single('certificate'), asyncHandler(updateCertificate));
router.delete('/certificates/:id', protect, authorize('STUDENT'), asyncHandler(deleteCertificate));

// Achievements
router.post('/achievements', protect, authorize('STUDENT'), asyncHandler(addAchievement));
router.put('/achievements/:id', protect, authorize('STUDENT'), asyncHandler(updateAchievement));
router.delete('/achievements/:id', protect, authorize('STUDENT'), asyncHandler(deleteAchievement));

// Internships
router.post('/internships', protect, authorize('STUDENT'), asyncHandler(addInternship));
router.put('/internships/:id', protect, authorize('STUDENT'), asyncHandler(updateInternship));
router.delete('/internships/:id', protect, authorize('STUDENT'), asyncHandler(deleteInternship));

// Resume
router.post('/resume', protect, authorize('STUDENT'), upload.single('resume'), asyncHandler(uploadResume));
router.delete('/resume', protect, authorize('STUDENT'), asyncHandler(deleteResume));

export default router;
