import { Request, Response } from 'express';
import cloudinary from '../config/cloudinary';

/**
 * Controller for document uploads to Cloudinary
 */

/**
 * Helper function to generate PDF viewing URLs
 */
const generatePdfUrls = (cloudinaryUrl: string) => {
  return {
    originalUrl: cloudinaryUrl,
    viewUrl: cloudinaryUrl, // Direct view URL (works for PDFs with resource_type: 'auto')
    downloadUrl: cloudinaryUrl.replace('/upload/', '/upload/fl_attachment/'), // Force download
    thumbnailUrl: cloudinaryUrl.replace('/upload/', '/upload/c_fit,h_300,w_200/') // Thumbnail preview
  };
};

/**
 * Upload CV document
 * POST /api/documents/upload-cv
 */
export const uploadCV = async (req: Request, res: Response): Promise<Response> => {
  try {
    console.log('📄 CV upload request received');
    console.log('📎 File:', req.file);

    if (!req.file) {
      return res.status(400).json({ 
        error: 'No CV file provided' 
      });
    }

    // Type assertion for multer file with Cloudinary properties
    const file = req.file as Express.Multer.File & { 
      path: string;
      filename: string;
      public_id: string;
    };

    const pdfUrls = generatePdfUrls(file.path);

    return res.status(200).json({
      message: 'CV uploaded successfully',
      cvUrl: file.path,
      ...pdfUrls,
      publicId: file.public_id,
      filename: file.filename
    });
  } catch (error: any) {
    console.error('❌ Error uploading CV:', error);
    return res.status(500).json({ 
      error: 'Failed to upload CV',
      detail: error.message 
    });
  }
};

/**
 * Upload certificate documents
 * POST /api/documents/upload-certificates
 */
export const uploadCertificates = async (req: Request, res: Response): Promise<Response> => {
  try {
    console.log('📄 Certificates upload request received');
    console.log('📎 Files:', req.files);

    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      return res.status(400).json({ 
        error: 'No certificate files provided' 
      });
    }

    // Type assertion for multer files with Cloudinary properties
    const files = req.files as Array<Express.Multer.File & { 
      path: string;
      filename: string;
      public_id: string;
    }>;

    const certificateUrls = files.map(file => {
      const pdfUrls = generatePdfUrls(file.path);
      return {
        url: file.path,
        ...pdfUrls,
        publicId: file.public_id,
        filename: file.filename
      };
    });

    return res.status(200).json({
      message: 'Certificates uploaded successfully',
      certificateUrls: certificateUrls.map(cert => cert.url),
      certificates: certificateUrls
    });
  } catch (error: any) {
    console.error('❌ Error uploading certificates:', error);
    return res.status(500).json({ 
      error: 'Failed to upload certificates',
      detail: error.message 
    });
  }
};

/**
 * Upload multiple documents at once (CV + Certificates)
 * POST /api/documents/upload-all
 */
export const uploadAllDocuments = async (req: Request, res: Response): Promise<Response> => {
  try {
    console.log('📄 All documents upload request received');
    console.log('📎 Files:', req.files);

    if (!req.files || typeof req.files !== 'object') {
      return res.status(400).json({ 
        error: 'No files provided' 
      });
    }

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const result: { cvUrl?: string; certificateUrls?: string[] } = {};

    // Handle CV upload
    if (files.cv && files.cv.length > 0) {
      const cvFile = files.cv[0] as Express.Multer.File & { 
        path: string;
        filename: string;
        public_id: string;
      };
      result.cvUrl = cvFile.path;
      console.log('✅ CV uploaded:', cvFile.path);
    }

    // Handle certificate uploads
    if (files.certificates && files.certificates.length > 0) {
      const certificateFiles = files.certificates as Array<Express.Multer.File & { 
        path: string;
        filename: string;
        public_id: string;
      }>;
      result.certificateUrls = certificateFiles.map(file => file.path);
      console.log('✅ Certificates uploaded:', result.certificateUrls);
    }

    if (!result.cvUrl && !result.certificateUrls) {
      return res.status(400).json({ 
        error: 'No valid documents provided' 
      });
    }

    return res.status(200).json({
      message: 'Documents uploaded successfully',
      ...result
    });
  } catch (error: any) {
    console.error('❌ Error uploading documents:', error);
    return res.status(500).json({ 
      error: 'Failed to upload documents',
      detail: error.message 
    });
  }
};

/**
 * Delete a document from Cloudinary
 * DELETE /api/documents/:publicId
 */
export const deleteDocument = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { publicId } = req.params;

    if (!publicId) {
      return res.status(400).json({ 
        error: 'Public ID is required' 
      });
    }

    // Delete from Cloudinary
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: 'raw'
    });

    if (result.result === 'ok') {
      return res.status(200).json({
        message: 'Document deleted successfully',
        publicId: publicId
      });
    } else {
      return res.status(400).json({
        error: 'Failed to delete document',
        detail: result.result
      });
    }
  } catch (error: any) {
    console.error('❌ Error deleting document:', error);
    return res.status(500).json({ 
      error: 'Failed to delete document',
      detail: error.message 
    });
  }
};
