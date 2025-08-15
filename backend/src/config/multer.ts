import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from './cloudinary';

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: (req, file) => ({
    folder: 'uploads',
    allowedFormats: ['jpg', 'png', 'jpeg'],
    resource_type: 'auto',
  }),
});

const upload = multer({ storage: storage });

export default upload;
