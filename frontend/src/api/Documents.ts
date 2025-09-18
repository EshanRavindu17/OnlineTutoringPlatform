const API_BASE_URL = 'http://localhost:5000';

export interface DocumentUploadResponse {
  cvUrl?: string;
  certificateUrls?: string[];
  message: string;
}

export interface UploadAllDocumentsResponse {
  cvUrl?: string;
  certificateUrls?: string[];
  message: string;
}

/**
 * Upload CV document to Cloudinary
 */
export const uploadCV = async (cvFile: File): Promise<{ cvUrl: string }> => {
  try {
    const formData = new FormData();
    formData.append('cv', cvFile);

    const response = await fetch(`${API_BASE_URL}/api/documents/upload-cv`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to upload CV');
    }

    return await response.json();
  } catch (error: any) {
    console.error('Error uploading CV:', error);
    throw new Error(error.message || 'Failed to upload CV');
  }
};

/**
 * Upload certificate documents to Cloudinary
 */
export const uploadCertificates = async (certificateFiles: File[]): Promise<{ certificateUrls: string[] }> => {
  try {
    const formData = new FormData();
    certificateFiles.forEach((file) => {
      formData.append('certificates', file);
    });

    const response = await fetch(`${API_BASE_URL}/api/documents/upload-certificates`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to upload certificates');
    }

    return await response.json();
  } catch (error: any) {
    console.error('Error uploading certificates:', error);
    throw new Error(error.message || 'Failed to upload certificates');
  }
};

/**
 * Upload all documents (CV + Certificates) at once
 */
export const uploadAllDocuments = async (
  cvFile?: File | null,
  certificateFiles?: File[]
): Promise<UploadAllDocumentsResponse> => {
  try {
    const formData = new FormData();
    
    if (cvFile) {
      formData.append('cv', cvFile);
    }
    
    if (certificateFiles && certificateFiles.length > 0) {
      certificateFiles.forEach((file) => {
        formData.append('certificates', file);
      });
    }

    const response = await fetch(`${API_BASE_URL}/api/documents/upload-all`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      let errorMessage = 'Failed to upload documents';
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.detail || errorMessage;
      } catch {
        // If response is not JSON, use status text
        errorMessage = `${response.status} ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error: any) {
    console.error('Error uploading documents:', error);
    throw new Error(error.message || 'Failed to upload documents');
  }
};

/**
 * Delete a document from Cloudinary by public ID
 */
export const deleteDocument = async (publicId: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/documents/${publicId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete document');
    }
  } catch (error: any) {
    console.error('Error deleting document:', error);
    throw new Error(error.message || 'Failed to delete document');
  }
};
