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

export default upload;
export { documentUpload };
