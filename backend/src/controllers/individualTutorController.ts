import { Request,Response } from "express";
import { getAllSubjects, getAllTitles,getAllTitlesBySubject, createSubject, createTitle, getTutorProfile, getTutorStatistics, updateUserPhoto, uploadAndUpdateUserPhoto, updateTutorQualifications, updateTutorHourlyRate, updateTutorSubjectsAndTitles, updateTutorPersonalInfo } from "../services/individualTutorService";


export const getAllSubjectsController = async (req: Request, res: Response) => {
  try {
    const subjects = await getAllSubjects();
    res.json(subjects);
  } catch (error) {
    console.error("Error fetching subjects:", error);
    res.status(500).json({ error: "Failed to fetch subjects" });
  }
};

export const getAllTitlesBySubjectController = async (req: Request, res: Response) => {
  const { sub_id } = req.params;
  try {
    const titles = await getAllTitlesBySubject(sub_id);
    res.json(titles);
  } catch (error) {
    console.error("Error fetching titles:", error);
    res.status(500).json({ error: "Failed to fetch titles" });
  }
};

export const getAllTitlesController = async (req: Request, res: Response) => {
  try {
    const titles = await getAllTitles();
    res.json(titles);
  } catch (error) {
    console.error("Error fetching titles:", error);
    res.status(500).json({ error: "Failed to fetch titles" });
  }
};

export const createSubjectController = async (req: Request, res: Response) => {
  const { name } = req.body;
  try {
    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Subject name is required" });
    }
    const subject = await createSubject(name.trim());
    res.status(201).json(subject);
  } catch (error) {
    console.error("Error creating subject:", error);
    res.status(500).json({ error: "Failed to create subject" });
  }
};

export const createTitleController = async (req: Request, res: Response) => {
  const { name, sub_id } = req.body;
  try {
    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Title name is required" });
    }
    if (!sub_id) {
      return res.status(400).json({ error: "Subject ID is required" });
    }
    const title = await createTitle(name.trim(), sub_id);
    res.status(201).json(title);
  } catch (error) {
    console.error("Error creating title:", error);
    res.status(500).json({ error: "Failed to create title" });
  }
};

// Get tutor profile data for dashboard
export const getTutorProfileController = async (req: Request, res: Response) => {
    try {
        const { firebaseUid } = req.params;
        
        if (!firebaseUid) {
            return res.status(400).json({ error: "Firebase UID is required" });
        }

        const profile = await getTutorProfile(firebaseUid);
        
        if (!profile) {
            return res.status(404).json({ error: "Tutor profile not found" });
        }

        return res.status(200).json(profile);
    } catch (error) {
        console.error("Error fetching tutor profile:", error);
        return res.status(500).json({ error: "An error occurred while fetching the tutor profile" });
    }
};

// Get tutor statistics for dashboard
export const getTutorStatsController = async (req: Request, res: Response) => {
    try {
        const { tutorId } = req.params;
        
        if (!tutorId) {
            return res.status(400).json({ error: "Tutor ID is required" });
        }

        const stats = await getTutorStatistics(tutorId);
        
        return res.status(200).json(stats);
    } catch (error) {
        console.error("Error fetching tutor statistics:", error);
        return res.status(500).json({ error: "An error occurred while fetching the tutor statistics" });
    }
};

// Update user profile photo
export const updateUserPhotoController = async (req: Request, res: Response) => {
    try {
        const { firebaseUid } = req.params;
        const { photoUrl } = req.body;
        
        if (!firebaseUid) {
            return res.status(400).json({ error: "Firebase UID is required" });
        }

        if (!photoUrl || typeof photoUrl !== 'string') {
            return res.status(400).json({ error: "Photo URL is required and must be a string" });
        }

        // Validate URL format (basic validation)
        try {
            new URL(photoUrl);
        } catch (urlError) {
            return res.status(400).json({ error: "Invalid photo URL format" });
        }

        const updatedUser = await updateUserPhoto(firebaseUid, photoUrl);
        
        return res.status(200).json({
            message: "Profile photo updated successfully",
            user: updatedUser
        });
    } catch (error) {
        console.error("Error updating user photo:", error);
        if (error instanceof Error && error.message === 'User not found') {
            return res.status(404).json({ error: "User not found" });
        }
        return res.status(500).json({ error: "An error occurred while updating the profile photo" });
    }
};

// Upload and update user profile photo with file
export const uploadUserPhotoController = async (req: Request, res: Response) => {
    try {
        const { firebaseUid } = req.params;
        
        if (!firebaseUid) {
            return res.status(400).json({ error: "Firebase UID is required" });
        }

        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        const updatedUser = await uploadAndUpdateUserPhoto(firebaseUid, req.file);
        
        return res.status(200).json({
            message: "Profile photo uploaded and updated successfully",
            user: updatedUser
        });
    } catch (error) {
        console.error("Error uploading user photo:", error);
        if (error instanceof Error && error.message === 'User not found') {
            return res.status(404).json({ error: "User not found" });
        }
        return res.status(500).json({ error: "An error occurred while uploading the profile photo" });
    }
};

// Update tutor qualifications
export const updateTutorQualificationsController = async (req: Request, res: Response) => {
    try {
        const { firebaseUid } = req.params;
        const { qualifications } = req.body;
        
        if (!firebaseUid) {
            return res.status(400).json({ error: "Firebase UID is required" });
        }

        if (!Array.isArray(qualifications)) {
            return res.status(400).json({ error: "Qualifications must be an array" });
        }

        const updatedTutor = await updateTutorQualifications(firebaseUid, qualifications);
        
        return res.status(200).json({
            message: "Qualifications updated successfully",
            tutor: updatedTutor
        });
    } catch (error) {
        console.error("Error updating qualifications:", error);
        if (error instanceof Error && error.message === 'User not found') {
            return res.status(404).json({ error: "User not found" });
        }
        if (error instanceof Error && error.message === 'Tutor profile not found') {
            return res.status(404).json({ error: "Tutor profile not found" });
        }
        return res.status(500).json({ error: "An error occurred while updating qualifications" });
    }
};

// Update tutor hourly rate
export const updateTutorHourlyRateController = async (req: Request, res: Response) => {
    try {
        const { firebaseUid } = req.params;
        const { hourlyRate } = req.body;
        
        if (!firebaseUid) {
            return res.status(400).json({ error: "Firebase UID is required" });
        }

        if (typeof hourlyRate !== 'number' && hourlyRate !== null && hourlyRate !== undefined) {
            return res.status(400).json({ error: "Hourly rate must be a number" });
        }

        // Additional validation for hourly rate range
        if (hourlyRate !== null && hourlyRate !== undefined && (hourlyRate < 0 || hourlyRate > 300)) {
            return res.status(400).json({ error: "Hourly rate must be between $0 and $300" });
        }

        const updatedTutor = await updateTutorHourlyRate(firebaseUid, hourlyRate);
        
        return res.status(200).json({
            message: "Hourly rate updated successfully",
            tutor: updatedTutor
        });
    } catch (error) {
        console.error("Error updating hourly rate:", error);
        if (error instanceof Error && error.message === 'User not found') {
            return res.status(404).json({ error: "User not found" });
        }
        if (error instanceof Error && error.message === 'Tutor profile not found') {
            return res.status(404).json({ error: "Tutor profile not found" });
        }
        if (error instanceof Error && error.message.includes('Hourly rate must be between')) {
            return res.status(400).json({ error: error.message });
        }
        return res.status(500).json({ error: "An error occurred while updating hourly rate" });
    }
};

// Update tutor subjects and titles
export const updateTutorSubjectsAndTitlesController = async (req: Request, res: Response) => {
    try {
        const { firebaseUid } = req.params;
        const { subjects, titles } = req.body;
        
        if (!firebaseUid) {
            return res.status(400).json({ error: "Firebase UID is required" });
        }

        if (!Array.isArray(subjects)) {
            return res.status(400).json({ error: "Subjects must be an array" });
        }

        if (!Array.isArray(titles)) {
            return res.status(400).json({ error: "Titles must be an array" });
        }

        const updatedTutor = await updateTutorSubjectsAndTitles(firebaseUid, subjects, titles);
        
        return res.status(200).json({
            message: "Subjects and titles updated successfully",
            tutor: updatedTutor
        });
    } catch (error) {
        console.error("Error updating subjects and titles:", error);
        if (error instanceof Error && error.message === 'User not found') {
            return res.status(404).json({ error: "User not found" });
        }
        if (error instanceof Error && error.message === 'Tutor profile not found') {
            return res.status(404).json({ error: "Tutor profile not found" });
        }
        if (error instanceof Error && error.message.includes('invalid')) {
            return res.status(400).json({ error: error.message });
        }
        return res.status(500).json({ error: "An error occurred while updating subjects and titles" });
    }
};

// Update tutor personal information
export const updateTutorPersonalInfoController = async (req: Request, res: Response) => {
    try {
        const { firebaseUid } = req.params;
        const { name, description, phone_number, heading } = req.body;

        // Validation
        if (!firebaseUid) {
            return res.status(400).json({ error: "Firebase UID is required" });
        }

        if (!name || typeof name !== 'string') {
            return res.status(400).json({ error: "Name is required and must be a string" });
        }

        if (!description || typeof description !== 'string') {
            return res.status(400).json({ error: "Description is required and must be a string" });
        }

        if (!phone_number || typeof phone_number !== 'string') {
            return res.status(400).json({ error: "Phone number is required and must be a string" });
        }

        // Optional heading validation
        if (heading && typeof heading !== 'string') {
            return res.status(400).json({ error: "Heading must be a string if provided" });
        }

        const personalData = {
            name,
            description,
            phone_number,
            heading: heading || null
        };

        const updatedTutor = await updateTutorPersonalInfo(firebaseUid, personalData);
        
        return res.status(200).json({
            message: "Personal information updated successfully",
            tutor: updatedTutor
        });
    } catch (error) {
        console.error("Error updating personal information:", error);
        if (error instanceof Error && error.message === 'User not found') {
            return res.status(404).json({ error: "User not found" });
        }
        if (error instanceof Error && error.message === 'Tutor profile not found') {
            return res.status(404).json({ error: "Tutor profile not found" });
        }
        return res.status(500).json({ error: "An error occurred while updating personal information" });
    }
};
