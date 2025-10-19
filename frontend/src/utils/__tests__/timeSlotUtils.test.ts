import {
  formatDateToString,
  formatTimeToString,
  normalizeTimeSlot,
  isSlotInFuture,
  formatDisplayDate,
  commonStyles,
  TimeSlotData
} from '../timeSlotUtils';

describe('timeSlotUtils - Critical Time Management', () => {
  describe('formatDateToString', () => {
    it('should format Date object to YYYY-MM-DD string', () => {
      const date = new Date('2024-01-15T10:30:00Z');
      const result = formatDateToString(date);
      expect(result).toBe('2024-01-15');
    });

    it('should handle string input by extracting date part', () => {
      const dateString = '2024-01-15T10:30:00Z';
      const result = formatDateToString(dateString);
      expect(result).toBe('2024-01-15');
    });

    it('should handle string without time component', () => {
      const dateString = '2024-01-15';
      const result = formatDateToString(dateString);
      expect(result).toBe('2024-01-15');
    });

    it('should handle invalid input gracefully', () => {
      const invalidInput = null as any;
      const result = formatDateToString(invalidInput);
      expect(result).toBe('null');
    });
  });

  describe('formatTimeToString', () => {
    it('should format Date object to HH:MM string', () => {
      const time = new Date('2024-01-15T14:30:00Z');
      const result = formatTimeToString(time);
      expect(result).toBe('14:30');
    });

    it('should handle ISO string with T separator', () => {
      const timeString = '2024-01-15T14:30:00Z';
      const result = formatTimeToString(timeString);
      expect(result).toBe('14:30');
    });

    it('should handle 1970-01-01T format from database', () => {
      const timeString = '1970-01-01T14:30:00Z';
      const result = formatTimeToString(timeString);
      expect(result).toBe('14:30');
    });

    it('should handle already formatted time string', () => {
      const timeString = '14:30:00';
      const result = formatTimeToString(timeString);
      expect(result).toBe('14:30');
    });
  });

  describe('normalizeTimeSlot', () => {
    it('should normalize time slot data with all fields', () => {
      const slot: TimeSlotData = {
        date: new Date('2024-01-15T00:00:00Z'),
        start_time: new Date('2024-01-15T14:30:00Z'),
        end_time: new Date('2024-01-15T15:30:00Z')
      };

      const result = normalizeTimeSlot(slot);
      
      expect(result).toEqual({
        date: '2024-01-15',
        startTime: '14:30',
        endTime: '15:30'
      });
    });

    it('should normalize time slot data without end_time', () => {
      const slot: TimeSlotData = {
        date: '2024-01-15',
        start_time: '14:30:00'
      };

      const result = normalizeTimeSlot(slot);
      
      expect(result).toEqual({
        date: '2024-01-15',
        startTime: '14:30',
        endTime: undefined
      });
    });
  });

  describe('isSlotInFuture', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      // Set to a specific date and time in local timezone
      jest.setSystemTime(new Date('2024-01-15T12:00:00'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should return true for future time slot', () => {
      const result = isSlotInFuture('2024-01-15', '15:00');
      expect(result).toBe(true);
    });

    it('should return false for past time slot', () => {
      const result = isSlotInFuture('2024-01-15', '10:00');
      expect(result).toBe(false);
    });

    it('should return false for current time slot', () => {
      const result = isSlotInFuture('2024-01-15', '12:00');
      expect(result).toBe(false);
    });

    it('should handle invalid date format gracefully', () => {
      const result = isSlotInFuture('invalid-date', '15:00');
      expect(result).toBe(false);
    });

    it('should handle invalid time format gracefully', () => {
      const result = isSlotInFuture('2024-01-15', 'invalid-time');
      expect(result).toBe(false);
    });
  });

  describe('formatDisplayDate', () => {
    it('should format date for display', () => {
      const date = new Date('2024-01-15T00:00:00Z');
      const result = formatDisplayDate(date);
      expect(result).toBe('Jan 15');
    });

    it('should handle different months correctly', () => {
      const date = new Date('2024-12-25T00:00:00Z');
      const result = formatDisplayDate(date);
      expect(result).toBe('Dec 25');
    });
  });

  describe('commonStyles', () => {
    it('should contain expected style properties', () => {
      expect(commonStyles).toHaveProperty('card');
      expect(commonStyles).toHaveProperty('cardLarge');
      expect(commonStyles).toHaveProperty('gradient');
      expect(commonStyles).toHaveProperty('button');
    });

    it('should have valid CSS classes', () => {
      expect(commonStyles.card).toContain('bg-white');
      expect(commonStyles.cardLarge).toContain('rounded-2xl');
      expect(commonStyles.gradient).toContain('bg-gradient-to-br');
      expect(commonStyles.button).toContain('bg-blue-600');
    });
  });
});