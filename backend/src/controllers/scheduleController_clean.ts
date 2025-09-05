import { Request, Response } from "express";
import { 
  getTutorTimeSlots,
  getTutorTimeSlotsInRange,
  createTimeSlot,
  updateTimeSlot,
  deleteTimeSlot,
  getAvailableTimeSlots,
  getTutorIdByFirebaseUid,
  CreateTimeSlotData,
  UpdateTimeSlotData
} from "../services/scheduleService";

// Get tutor ID by Firebase UID
export const getTutorIdController = async (req: Request, res: Response) => {
  try {
    const { firebaseUid } = req.params;

    const tutorId = await getTutorIdByFirebaseUid(firebaseUid);

    res.status(200).json({
      success: true,
      message: "Tutor ID retrieved successfully",
      data: { tutorId }
    });
  } catch (error) {
    console.error("Error fetching tutor ID:", error);
    
    if (error instanceof Error) {
      if (error.message.includes('not found') || 
          error.message.includes('not an individual tutor') || 
          error.message.includes('profile not found')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
    }

    res.status(500).json({
      success: false,
      message: "Failed to fetch tutor ID",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

// Get all time slots for a tutor
export const getTutorTimeSlotsController = async (req: Request, res: Response) => {
  try {
    const { tutorId } = req.params;
    const { startDate, endDate } = req.query;

    let timeSlots;
    if (startDate && endDate) {
      timeSlots = await getTutorTimeSlotsInRange(
        tutorId, 
        startDate as string, 
        endDate as string
      );
    } else {
      timeSlots = await getTutorTimeSlots(tutorId);
    }

    res.status(200).json({
      success: true,
      message: "Time slots retrieved successfully",
      data: timeSlots
    });
  } catch (error) {
    console.error("Error fetching tutor time slots:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch time slots",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

// Create a new time slot
export const createTimeSlotController = async (req: Request, res: Response) => {
  try {
    const { tutorId } = req.params;
    const { date, start_time, end_time, status } = req.body;

    // Validate required fields
    if (!date || !start_time || !end_time) {
      return res.status(400).json({
        success: false,
        message: "Date, start_time, and end_time are required"
      });
    }

    // Validate time format (HH:MM)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(start_time) || !timeRegex.test(end_time)) {
      return res.status(400).json({
        success: false,
        message: "Invalid time format. Use HH:MM format"
      });
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format. Use YYYY-MM-DD format"
      });
    }

    const timeSlotData: CreateTimeSlotData = {
      i_tutor_id: tutorId,
      date,
      start_time,
      end_time,
      status
    };

    const newTimeSlot = await createTimeSlot(timeSlotData);

    res.status(201).json({
      success: true,
      message: "Time slot created successfully",
      data: newTimeSlot
    });
  } catch (error) {
    console.error("Error creating time slot:", error);
    
    if (error instanceof Error) {
      if (error.message.includes('already exists') || 
          error.message.includes('past dates') || 
          error.message.includes('past time') ||
          error.message.includes('overlaps')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
    }

    res.status(500).json({
      success: false,
      message: "Failed to create time slot",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

// Update an existing time slot
export const updateTimeSlotController = async (req: Request, res: Response) => {
  try {
    const { slotId } = req.params;
    const { date, start_time, end_time, status } = req.body;

    // Validate time format if provided
    if (start_time || end_time) {
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if ((start_time && !timeRegex.test(start_time)) || (end_time && !timeRegex.test(end_time))) {
        return res.status(400).json({
          success: false,
          message: "Invalid time format. Use HH:MM format"
        });
      }
    }

    // Validate date format if provided
    if (date) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(date)) {
        return res.status(400).json({
          success: false,
          message: "Invalid date format. Use YYYY-MM-DD format"
        });
      }
    }

    const updateData: UpdateTimeSlotData = {};
    if (date) updateData.date = date;
    if (start_time) updateData.start_time = start_time;
    if (end_time) updateData.end_time = end_time;
    if (status) updateData.status = status;

    const updatedTimeSlot = await updateTimeSlot(slotId, updateData);

    res.status(200).json({
      success: true,
      message: "Time slot updated successfully",
      data: updatedTimeSlot
    });
  } catch (error) {
    console.error("Error updating time slot:", error);
    
    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      if (error.message.includes('already exists') || 
          error.message.includes('past date') || 
          error.message.includes('past time')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
    }

    res.status(500).json({
      success: false,
      message: "Failed to update time slot",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

// Delete a time slot
export const deleteTimeSlotController = async (req: Request, res: Response) => {
  try {
    const { slotId } = req.params;

    const result = await deleteTimeSlot(slotId);

    res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (error) {
    console.error("Error deleting time slot:", error);
    
    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      if (error.message.includes('has been booked')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
    }

    res.status(500).json({
      success: false,
      message: "Failed to delete time slot",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

// Get available time slots (for students to book)
export const getAvailableTimeSlotsController = async (req: Request, res: Response) => {
  try {
    const { tutorId, date } = req.query;

    const availableSlots = await getAvailableTimeSlots(
      tutorId as string, 
      date as string
    );

    res.status(200).json({
      success: true,
      message: "Available time slots retrieved successfully",
      data: availableSlots
    });
  } catch (error) {
    console.error("Error fetching available time slots:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch available time slots",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};
