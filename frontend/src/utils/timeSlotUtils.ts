// Utility functions for time slot management

export interface TimeSlotData {
  date: Date | string;
  start_time: Date | string;
  end_time?: Date | string;
}

/**
 * Converts various date formats to YYYY-MM-DD string format
 */
export const formatDateToString = (date: Date | string): string => {
  if (date instanceof Date) {
    return date.getFullYear() + '-' + 
      String(date.getMonth() + 1).padStart(2, '0') + '-' + 
      String(date.getDate()).padStart(2, '0');
  } else if (typeof date === 'string') {
    // If it's already a string, just take the date part
    return date.split('T')[0];
  } else {
    return String(date);
  }
};

/**
 * Converts various time formats to HH:MM string format
 */
export const formatTimeToString = (time: Date | string): string => {
  if (time instanceof Date) {
    const timeStr = time.toISOString();
    return timeStr.substr(11, 5); // Extract HH:MM from ISO string
  } else if (typeof time === 'string') {
    // Check if it's an ISO string or just time
    if (time.includes('T')) {
      return time.split('T')[1].slice(0, 5);
    } else if (time.includes('1970-01-01T')) {
      // Handle 1970-01-01T format from database
      return time.split('T')[1].slice(0, 5);
    } else {
      // Already in HH:MM format
      return time.slice(0, 5);
    }
  } else {
    return String(time).slice(0, 5);
  }
};

/**
 * Converts a time slot data object to standardized format for frontend use
 */
export const normalizeTimeSlot = (slot: TimeSlotData) => {
  return {
    date: formatDateToString(slot.date),
    startTime: formatTimeToString(slot.start_time),
    endTime: slot.end_time ? formatTimeToString(slot.end_time) : undefined
  };
};

/**
 * Checks if a time slot is in the future
 */
export const isSlotInFuture = (dateStr: string, timeStr: string): boolean => {
  try {
    const slotDateTime = new Date(`${dateStr}T${timeStr}:00`);
    const now = new Date();
    return slotDateTime > now;
  } catch (error) {
    return false;
  }
};

/**
 * Formats a Date object for display (e.g., "Oct 5")
 */
export const formatDisplayDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric'
  });
};

/**
 * Common CSS classes used throughout the schedule components
 */
export const commonStyles = {
  card: 'bg-white rounded-xl shadow-sm border border-blue-200 p-6',
  cardLarge: 'bg-white rounded-2xl shadow-sm border border-blue-200 p-8',
  gradient: 'min-h-screen bg-gradient-to-br from-blue-50 to-blue-100',
  button: 'bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700'
};