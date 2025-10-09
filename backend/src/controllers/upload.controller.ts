import { Request, Response } from 'express';

/**
 * Controller to handle material upload (uses multer middleware)
 * Multer with CloudinaryStorage automatically uploads the file
 */
export const uploadMaterialController = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Type assertion for multer file with Cloudinary properties
    const file = req.file as Express.Multer.File & {
      path: string;
      filename: string;
    };

    return res.status(200).json({
      message: 'Material uploaded successfully',
      url: file.path, // Cloudinary URL
      filename: file.filename,
      originalName: file.originalname,
    });
  } catch (error: any) {
    console.error('Error in uploadMaterialController:', error);
    return res.status(500).json({ error: error.message || 'Failed to upload material' });
  }
};

/**
 * Controller to handle multiple materials upload
 */
export const uploadMultipleMaterialsController = async (req: Request, res: Response) => {
  try {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    // Type assertion for multer files with Cloudinary properties
    const files = req.files as Array<Express.Multer.File & {
      path: string;
      filename: string;
    }>;

    const uploadedFiles = files.map(file => ({
      url: file.path,
      filename: file.filename,
      originalName: file.originalname,
    }));

    return res.status(200).json({
      message: 'Materials uploaded successfully',
      files: uploadedFiles,
    });
  } catch (error: any) {
    console.error('Error in uploadMultipleMaterialsController:', error);
    return res.status(500).json({ error: error.message || 'Failed to upload materials' });
  }
};

/**
 * Controller to handle recording upload
 */
export const uploadRecordingController = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No recording uploaded' });
    }

    const file = req.file as Express.Multer.File & {
      path: string;
      filename: string;
    };

    return res.status(200).json({
      message: 'Recording uploaded successfully',
      url: file.path,
      filename: file.filename,
      originalName: file.originalname,
    });
  } catch (error: any) {
    console.error('Error in uploadRecordingController:', error);
    return res.status(500).json({ error: error.message || 'Failed to upload recording' });
  }
};
