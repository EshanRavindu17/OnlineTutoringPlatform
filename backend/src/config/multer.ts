import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from './cloudinary';
import path from 'path';

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

// Enhanced Session Materials Storage
const sessionMaterialsStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: (req, file) => {
    const sessionId = req.params?.sessionId || req.body?.sessionId || 'unknown';
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(7);
    
    // Determine folder based on file type
    let folder = 'session-materials';
    if (file.mimetype.startsWith('image/')) {
      folder = 'session-materials/images';
    } else if (file.mimetype.startsWith('video/')) {
      folder = 'session-materials/videos';
    } else if (file.mimetype === 'application/pdf') {
      folder = 'session-materials/documents';
    } else if (file.mimetype.includes('presentation') || file.mimetype.includes('powerpoint')) {
      folder = 'session-materials/presentations';
    } else {
      folder = 'session-materials/files';
    }

    return {
      folder: folder,
      public_id: `${sessionId}_${timestamp}_${randomId}`,
      resource_type: 'auto',
      // Add metadata
      context: {
        session_id: sessionId,
        upload_date: new Date().toISOString(),
        original_name: file.originalname
      }
    };
  },
});

// File filter for session materials
const sessionMaterialsFileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Define allowed file types
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
    // Videos
    'video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/flv', 'video/webm',
    // Audio
    'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a',
    // Archives
    'application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed'
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    const error = new Error(`File type ${file.mimetype} is not supported. Allowed types: ${allowedMimeTypes.join(', ')}`);
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

// Enhanced session materials upload configuration
const sessionMaterialsUpload = multer({
  storage: sessionMaterialsStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit for session materials
    files: 5 // Maximum 5 files per request for batch upload
  },
  fileFilter: sessionMaterialsFileFilter
});

// Multiple files upload for batch processing
const batchMaterialsUpload = multer({
  storage: sessionMaterialsStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB per file
    files: 10 // Maximum 10 files per batch
  },
  fileFilter: sessionMaterialsFileFilter
});

export default upload;
export { 
  documentUpload, 
  sessionMaterialsUpload, 
  batchMaterialsUpload 
};
