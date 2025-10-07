import prisma from "../prismaClient";
import { SlotStatus } from "@prisma/client";

export interface TimeSlot {
  slot_id: string;
  date: string;
  start_time: string;
  end_time: string;
  status: SlotStatus;
}

export interface CreateTimeSlotData {
  i_tutor_id: string;
  date: string;
  start_time: string;
  end_time: string;
  status?: SlotStatus;
}

export interface UpdateTimeSlotData {
  date?: string;
  start_time?: string;
  end_time?: string;
  status?: SlotStatus;
}

// Get tutor ID by user's firebase UID
export const getTutorIdByFirebaseUid = async (firebaseUid: string) => {
  const user = await prisma.user.findUnique({
    where: { firebase_uid: firebaseUid },
    include: {
      Individual_Tutor: true
    }
  });

  if (!user) {
    throw new Error('User not found');
  }

  if (user.role !== 'Individual') {
    throw new Error('User is not an individual tutor');
  }

  if (!user.Individual_Tutor || user.Individual_Tutor.length === 0) {
    throw new Error('Tutor profile not found');
  }

  return user.Individual_Tutor[0].i_tutor_id;
};

// Get all time slots for a specific tutor
export const getTutorTimeSlots = async (tutorId: string) => {
  const timeSlots = await prisma.free_Time_Slots.findMany({
    where: {
      i_tutor_id: tutorId
    },
    orderBy: [
      { date: 'asc' },
      { start_time: 'asc' }
    ]
  });

  // Filter out all past time slots (past dates and past times for today)
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const filteredSlots = timeSlots.filter(slot => {
    const slotDate = new Date(slot.date);
    slotDate.setHours(0, 0, 0, 0);
    
    // If slot date is before today, it's in the past - exclude it
    if (slotDate.getTime() < today.getTime()) {
      return false;
    }
    
    // If slot date is after today, it's in the future - include it
    if (slotDate.getTime() > today.getTime()) {
      return true;
    }
    
    // For today's slots, we need to properly parse the time
    let slotHour: number;
    let slotMinute: number;
    
    if (slot.start_time instanceof Date) {
      // If it's a Date object, extract hours and minutes
      slotHour = slot.start_time.getUTCHours();
      slotMinute = slot.start_time.getUTCMinutes();
    } else {
      // If it's a string, parse it
      const timeStr = String(slot.start_time);
      if (timeStr.includes('T')) {
        // ISO format like "1970-01-01T19:00:00.000Z"
        const timePart = timeStr.split('T')[1];
        const [hours, minutes] = timePart.split(':').map(Number);
        slotHour = hours;
        slotMinute = minutes || 0;
      } else if (timeStr.includes(':')) {
        // Direct time format like "19:00"
        const [hours, minutes] = timeStr.split(':').map(Number);
        slotHour = hours;
        slotMinute = minutes || 0;
      } else {
        return false; // Skip unparseable times
      }
    }
    
    // Convert both times to minutes since midnight for easier comparison
    const slotMinutesFromMidnight = slotHour * 60 + slotMinute;
    const currentMinutesFromMidnight = currentHour * 60 + currentMinute;
    
    // Include slots that start AFTER current time (exclude slots that have already started)
    return slotMinutesFromMidnight > currentMinutesFromMidnight;
  });

  return filteredSlots;
};

// Get time slots for a specific tutor within a date range
export const getTutorTimeSlotsInRange = async (
  tutorId: string, 
  startDate: string, 
  endDate: string
) => {
  const timeSlots = await prisma.free_Time_Slots.findMany({
    where: {
      i_tutor_id: tutorId,
      date: {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    },
    orderBy: [
      { date: 'asc' },
      { start_time: 'asc' }
    ]
  });

  // Filter out all past time slots (past dates and past times for today)
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const filteredSlots = timeSlots.filter(slot => {
    const slotDate = new Date(slot.date);
    slotDate.setHours(0, 0, 0, 0);
    
    // If slot date is before today, it's in the past - exclude it
    if (slotDate.getTime() < today.getTime()) {
      return false;
    }
    
    // If slot date is after today, it's in the future - include it
    if (slotDate.getTime() > today.getTime()) {
      return true;
    }
    
    // For today's slots, we need to properly parse the time
    let slotHour: number;
    let slotMinute: number;
    
    if (slot.start_time instanceof Date) {
      // If it's a Date object, extract hours and minutes
      slotHour = slot.start_time.getUTCHours();
      slotMinute = slot.start_time.getUTCMinutes();
    } else {
      // If it's a string, parse it
      const timeStr = String(slot.start_time);
      if (timeStr.includes('T')) {
        // ISO format like "1970-01-01T19:00:00.000Z"
        const timePart = timeStr.split('T')[1];
        const [hours, minutes] = timePart.split(':').map(Number);
        slotHour = hours;
        slotMinute = minutes || 0;
      } else if (timeStr.includes(':')) {
        // Direct time format like "19:00"
        const [hours, minutes] = timeStr.split(':').map(Number);
        slotHour = hours;
        slotMinute = minutes || 0;
      } else {
        return false; // Skip unparseable times
      }
    }
    
    // Convert both times to minutes since midnight for easier comparison
    const slotMinutesFromMidnight = slotHour * 60 + slotMinute;
    const currentMinutesFromMidnight = currentHour * 60 + currentMinute;
    
    // Include slots that start AFTER current time (exclude slots that have already started)
    return slotMinutesFromMidnight > currentMinutesFromMidnight;
  });

  return filteredSlots;
};

// Create a new time slot
export const createTimeSlot = async (data: CreateTimeSlotData) => {
  // Check if slot already exists for this tutor at this date and time
  const existingSlot = await prisma.free_Time_Slots.findFirst({
    where: {
      i_tutor_id: data.i_tutor_id,
      date: new Date(data.date),
      start_time: new Date(`1970-01-01T${data.start_time}:00.000Z`),
      end_time: new Date(`1970-01-01T${data.end_time}:00.000Z`)
    }
  });

  if (existingSlot) {
    throw new Error('Time slot already exists for this date and time');
  }

  // Validate date is not in the past
  const slotDate = new Date(data.date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (slotDate < today) {
    throw new Error('Cannot create time slot for past dates');
  }

  // If the slot is for today, check if the time has passed
  if (slotDate.getTime() === today.getTime()) {
    const currentTime = new Date();
    const [hours, minutes] = data.start_time.split(':').map(Number);
    const slotTime = new Date();
    slotTime.setHours(hours, minutes, 0, 0);
    
    if (slotTime <= currentTime) {
      throw new Error('Cannot create time slot for past time today');
    }
  }

  const timeSlot = await prisma.free_Time_Slots.create({
    data: {
      i_tutor_id: data.i_tutor_id,
      date: new Date(data.date),
      start_time: new Date(`1970-01-01T${data.start_time}:00.000Z`),
      end_time: new Date(`1970-01-01T${data.end_time}:00.000Z`),
      status: data.status || SlotStatus.free
    }
  });

  return timeSlot;
};

// Update an existing time slot
// export const updateTimeSlot = async (slotId: string, data: UpdateTimeSlotData) => {
//   // Check if slot exists
//   const existingSlot = await prisma.free_Time_Slots.findUnique({
//     where: { slot_id: slotId }
//   });

//   if (!existingSlot) {
//     throw new Error('Time slot not found');
//   }

//   // If updating date or times, validate the new values
//   if (data.date || data.start_time || data.end_time) {
//     const newDate = data.date || (existingSlot.date ? existingSlot.date.toISOString().split('T')[0] : '');
//     const newStartTime = data.start_time || (existingSlot.start_time ? existingSlot.start_time.toTimeString().slice(0, 5) : '');
//     const newEndTime = data.end_time || (existingSlot.end_time ? existingSlot.end_time.toTimeString().slice(0, 5) : '');

//     // Check if another slot exists for this tutor at the new date/time
//     if (data.date || data.start_time || data.end_time) {
//       const conflictingSlot = await prisma.free_Time_Slots.findFirst({
//         where: {
//           i_tutor_id: existingSlot.i_tutor_id,
//           date: new Date(newDate),
//           start_time: new Date(`1970-01-01T${newStartTime}:00.000Z`),
//           end_time: new Date(`1970-01-01T${newEndTime}:00.000Z`),
//           slot_id: { not: slotId }
//         }
//       });

//       if (conflictingSlot) {
//         throw new Error('Another time slot already exists for this date and time');
//       }
//     }

//     // Validate date is not in the past
//     const slotDate = new Date(newDate);
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);
    
//     if (slotDate < today) {
//       throw new Error('Cannot update time slot to a past date');
//     }

//     // If the slot is for today, check if the time has passed
//     if (slotDate.getTime() === today.getTime()) {
//       const currentTime = new Date();
//       const [hours, minutes] = newStartTime.split(':').map(Number);
//       const slotTime = new Date();
//       slotTime.setHours(hours, minutes, 0, 0);
      
//       if (slotTime <= currentTime) {
//         throw new Error('Cannot update time slot to a past time today');
//       }
//     }
//   }

//   const updateData: any = {};
//   if (data.date) updateData.date = new Date(data.date);
//   if (data.start_time) updateData.start_time = new Date(`1970-01-01T${data.start_time}:00.000Z`);
//   if (data.end_time) updateData.end_time = new Date(`1970-01-01T${data.end_time}:00.000Z`);
//   if (data.status) updateData.status = data.status;

//   const updatedSlot = await prisma.free_Time_Slots.update({
//     where: { slot_id: slotId },
//     data: updateData
//   });

//   return updatedSlot;
// };

// Delete a time slot
export const deleteTimeSlot = async (slotId: string) => {
  // Check if slot exists
  const existingSlot = await prisma.free_Time_Slots.findUnique({
    where: { slot_id: slotId }
  });

  if (!existingSlot) {
    throw new Error('Time slot not found');
  }

  // Check if slot is booked (cannot delete booked slots)
  if (existingSlot.status === SlotStatus.booked) {
    throw new Error('Cannot delete time slot that has been booked');
  }

  await prisma.free_Time_Slots.delete({
    where: { slot_id: slotId }
  });

  return { message: 'Time slot deleted successfully' };
};

// Get available time slots for booking (for students to view)
export const getAvailableTimeSlots = async (tutorId?: string, date?: string) => {
  const whereClause: any = {
    status: SlotStatus.free
  };

  if (tutorId) {
    whereClause.i_tutor_id = tutorId;
  }

  if (date) {
    whereClause.date = new Date(date);
  } else {
    // Only show future dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    whereClause.date = {
      gte: today
    };
  }

  const availableSlots = await prisma.free_Time_Slots.findMany({
    where: whereClause,
    include: {
      Individual_Tutor: {
        include: {
          User: {
            select: {
              name: true,
              email: true
            }
          }
        }
      }
    },
    orderBy: [
      { date: 'asc' },
      { start_time: 'asc' }
    ]
  });

  // Filter out past time slots for today
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const filteredSlots = availableSlots.filter(slot => {
    const slotDate = new Date(slot.date);
    slotDate.setHours(0, 0, 0, 0);
    
    // If slot is not today, it's already filtered by date
    if (slotDate.getTime() !== today.getTime()) {
      return true;
    }
    
    // For today's slots, check if the time has passed
    const startTime = new Date(slot.start_time);
    const slotHour = startTime.getHours();
    const slotMinute = startTime.getMinutes();
    
    // If slot hour is greater than current hour, it's in the future
    if (slotHour > currentHour) {
      return true;
    }
    
    // If slot hour equals current hour, check minutes
    if (slotHour === currentHour && slotMinute > currentMinute) {
      return true;
    }
    
    // Otherwise, it's in the past
    return false;
  });

  return filteredSlots;
};