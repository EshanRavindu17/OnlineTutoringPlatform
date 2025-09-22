import express from 'express';
import { uploadCV, uploadCertificates, uploadAllDocuments, deleteDocument } from '../controllers/documentController';
import { documentUpload } from '../config/multer';
import { securityHeaders } from '../middleware/securityMiddleware';

const router = express.Router();

// Apply security headers to all routes
router.use(securityHeaders);

// Document upload routes (public - used during registration)
router.post('/upload-cv', documentUpload.single('cv'), uploadCV);
router.post('/upload-certificates', documentUpload.array('certificates', 3), uploadCertificates);
router.post('/upload-all', 
  documentUpload.fields([
    { name: 'cv', maxCount: 1 },
    { name: 'certificates', maxCount: 3 }
  ]), 
  uploadAllDocuments
);

// Document deletion route
router.delete('/:publicId', deleteDocument);

export default router;