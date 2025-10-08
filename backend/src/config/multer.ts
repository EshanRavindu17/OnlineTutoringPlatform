import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from './cloudinary';
import path from 'path';
import { access } from 'fs';

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: (req, file) => ({
    folder: 'uploads',
    allowedFormats: ['jpg', 'png', 'jpeg'],
    resource_type: 'auto', // Use 'auto' for better format detection
    access_mode: 'public',
  }),
});

// Document storage for PDFs
const documentStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: (req, file) => ({
    folder: 'documents',
    allowedFormats: ['pdf'],
    resource_type: 'auto', // Use 'auto' instead of 'raw' for proper PDF handling
    access_mode: 'public',
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
    access_mode: 'public',
    public_id: `material_${Date.now()}_${Math.random().toString(36).substring(7)}`,
  }),
});

// Recordings storage for class recordings
const recordingsStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: (req, file) => ({
    folder: 'tutorly/recordings',
    resource_type: 'video',
    access_mode: 'public',
    public_id: `recording_${Date.now()}_${Math.random().toString(36).substring(7)}`,
  }),
});

// File filter for all session materials (including videos)
const materialsFileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Define allowed file types for all materials
  const allowedMimeTypes = [
    // Images
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/bmp',
    // Documents
    'application/pdf',
    'application/msword', // .doc
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'application/vnd.ms-excel', // .xls
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.ms-powerpoint', // .ppt
    'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
    'text/plain', // .txt
    'text/csv', // .csv
    'application/rtf', // .rtf
    // Videos (now included in materials)
    'video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/flv', 'video/webm',
    // Audio
    'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a',
    // Archives
    'application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed'
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    const error = new Error(`File type ${file.mimetype} is not supported.`);
    cb(error as any, false);
  }
};

// Simple file filter for recordings (video files)
const recordingsFileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Define allowed video types for recordings
  const allowedMimeTypes = [
    'video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/flv', 'video/webm'
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    const error = new Error(`File type ${file.mimetype} is not supported for recordings.`);
    cb(error as any, false);
  }
};

// Basic upload configuration
const upload = multer({ storage: storage });

// Document upload configuration
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
    fileSize: 100 * 1024 * 1024, // 100MB limit to accommodate videos and other materials
  },
  fileFilter: materialsFileFilter
});

const recordingsUpload = multer({
  storage: recordingsStorage,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB limit for recordings
  },
  fileFilter: recordingsFileFilter
});

export default upload;
export { 
  documentUpload, 
  materialsUpload, 
  recordingsUpload 
};
