import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from './cloudinary';

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: (req, file) => ({
    folder: 'uploads',
    allowedFormats: ['jpg', 'png', 'jpeg'],
    resource_type: 'auto', // Use 'auto' for better format detection
  }),
});

// Document storage for PDFs
const documentStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: (req, file) => ({
    folder: 'documents',
    allowedFormats: ['pdf'],
    resource_type: 'auto', // Use 'auto' instead of 'raw' for proper PDF handling
    public_id: `${req.body.type || 'document'}_${Date.now()}_${Math.random().toString(36).substring(7)}`,
  }),
});

// Materials storage for class materials (PDFs, images, videos, etc.)
const materialsStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: (req, file) => ({
    folder: 'tutorly/materials',
    allowedFormats: ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'jpg', 'jpeg', 'png', 'mp4', 'mov'],
    resource_type: 'auto',
    public_id: `material_${Date.now()}_${Math.random().toString(36).substring(7)}`,
  }),
});

// Recordings storage for class recordings
const recordingsStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: (req, file) => ({
    folder: 'tutorly/recordings',
    resource_type: 'video',
    public_id: `recording_${Date.now()}_${Math.random().toString(36).substring(7)}`,
  }),
});

const upload = multer({ storage: storage });
const documentUpload = multer({ 
  storage: documentStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed') as any, false);
    }
  }
});

const materialsUpload = multer({
  storage: materialsStorage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit for materials
  },
});

const recordingsUpload = multer({
  storage: recordingsStorage,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB limit for recordings
  },
});

export default upload;
export { documentUpload, materialsUpload, recordingsUpload };
