import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Clock, AlertCircle, Loader, Save } from 'lucide-react';
import { ScheduleService, TimeSlot as APITimeSlot, CreateTimeSlotRequest } from '../../api/ScheduleService';
import { formatDateToString, formatDisplayDate, normalizeTimeSlot, commonStyles } from '../../utils/timeSlotUtils';

interface TimeSlot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'AVAILABLE' | 'BOOKED' | 'UNAVAILABLE';
  isBooked: boolean;
  studentName?: string;
}

interface HourSlot {
  hour: number;
  timeLabel: string;
  startTime: string;
  endTime: string;
  isSelected: boolean;
  isBooked: boolean;
  slotId?: string;
}

interface ScheduleManagerProps {
  tutorId: string;
  onScheduleChange?: () => void;
}

const ScheduleManager: React.FC<ScheduleManagerProps> = ({ tutorId, onScheduleChange }) => {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date();
    const currentDayOfWeek = today.getDay();
    const daysFromMonday = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1;
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - daysFromMonday);
    weekStart.setHours(0, 0, 0, 0);
    return weekStart;
  });

  // State for the weekly grid - each day has hour slots from 6 AM to 12 AM (18 hours)
  const [weeklySchedule, setWeeklySchedule] = useState<{ [date: string]: HourSlot[] }>({});

  const daysOfWeek = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
  ];

  // Generate hour slots from 6 AM to 12 AM (18 hours total)
  const generateHourSlots = (): HourSlot[] => {
    const slots: HourSlot[] = [];
    for (let hour = 6; hour < 23; hour++) {
      const startHour = hour;
      const endHour = hour + 1;
      
      const formatHour = (h: number) => {
        const hour12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
        const period = h >= 12 ? 'PM' : 'AM';
        return `${hour12}:00 ${period}`;
      };

      slots.push({
        hour: startHour,
        timeLabel: `${formatHour(startHour)} - ${formatHour(endHour)}`,
        startTime: `${startHour.toString().padStart(2, '0')}:00`,
        endTime: `${endHour.toString().padStart(2, '0')}:00`,
        isSelected: false,
        isBooked: false,
        slotId: undefined
      });
    }
    return slots;
  };

  // Get current date and time for validation
  const now = new Date();
  const currentDate = now.getFullYear() + '-' + 
    String(now.getMonth() + 1).padStart(2, '0') + '-' + 
    String(now.getDate()).padStart(2, '0');
  const currentHour = now.getHours();

  // Helper functions - using utility functions to avoid redundancy

  const isSlotInPastWithMinutes = (date: string, hour: number): boolean => {
    // If the slot date is before today, it's definitely past
    if (date < currentDate) return true;
    
    // If it's today, check if the slot start time has passed
    if (date === currentDate) {
      const now = new Date();
      const slotStartTime = new Date();
      slotStartTime.setHours(hour, 0, 0, 0); // Set to start of the slot hour
      
      // Consider past if the current time is past the START of the slot hour
      return now >= slotStartTime;
    }
    
    return false;
  };

  // Generate week dates
  const getWeekDates = (weekStart: Date): Date[] => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const weekDates = getWeekDates(currentWeekStart);

  // Convert API time slot to component format
  const convertAPITimeSlot = (apiSlot: APITimeSlot): TimeSlot => {
    const normalized = normalizeTimeSlot({
      date: apiSlot.date,
      start_time: apiSlot.start_time,
      end_time: apiSlot.end_time
    });
    
    const convertedSlot: TimeSlot = {
      id: apiSlot.slot_id,
      date: normalized.date,
      startTime: normalized.startTime,
      endTime: normalized.endTime || normalized.startTime,
      status: apiSlot.status === 'free' ? 'AVAILABLE' : apiSlot.status === 'booked' ? 'BOOKED' : 'UNAVAILABLE',
      isBooked: apiSlot.status === 'booked',
      studentName: undefined
    };
    
    return convertedSlot;
  };

  // Initialize weekly schedule with hour slots
  const initializeWeeklySchedule = () => {
    const schedule: { [date: string]: HourSlot[] } = {};
    weekDates.forEach(date => {
      const dateStr = formatDateToString(date);
      schedule[dateStr] = generateHourSlots();
    });
    return schedule;
  };

  // Update weekly schedule with existing time slots
  const updateScheduleWithTimeSlots = (slots: TimeSlot[]) => {
    const schedule = initializeWeeklySchedule();
    
    // Backend already filters past slots correctly, so we don't need additional frontend filtering
    // Just use all slots returned from the backend
    slots.forEach(slot => {
      const dateSlots = schedule[slot.date];
      if (dateSlots) {
        const startHour = parseInt(slot.startTime.split(':')[0]);
        
        const hourSlotIndex = dateSlots.findIndex(hourSlot => hourSlot.hour === startHour);
        
        if (hourSlotIndex !== -1) {
          dateSlots[hourSlotIndex] = {
            ...dateSlots[hourSlotIndex],
            isSelected: slot.status === 'AVAILABLE',
            isBooked: slot.status === 'BOOKED',
            slotId: slot.id
          };
        }
      }
    });
    
    setWeeklySchedule(schedule);
  };

  // Load time slots for current week
  const loadTimeSlots = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const weekStart = formatDateToString(currentWeekStart);
      const weekEnd = formatDateToString(new Date(currentWeekStart.getTime() + 6 * 24 * 60 * 60 * 1000));
            
      const response = await ScheduleService.getTutorTimeSlots(tutorId, weekStart, weekEnd);
      
      if (response.success) {
        const convertedSlots = response.data.map(convertAPITimeSlot);
        
        setTimeSlots(convertedSlots);
        updateScheduleWithTimeSlots(convertedSlots);
      } else {
        setError('Failed to load time slots');
        setWeeklySchedule(initializeWeeklySchedule());
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load time slots');
      setWeeklySchedule(initializeWeeklySchedule());
    } finally {
      setLoading(false);
    }
  };

  // Load time slots when component mounts or week changes
  useEffect(() => {
    if (tutorId) {
      loadTimeSlots();
    }
  }, [tutorId, currentWeekStart]);



  // Navigation functions
  const goToPreviousWeek = () => {
    const newWeekStart = new Date(currentWeekStart);
    newWeekStart.setDate(currentWeekStart.getDate() - 7);
    setCurrentWeekStart(newWeekStart);
  };

  const goToNextWeek = () => {
    const newWeekStart = new Date(currentWeekStart);
    newWeekStart.setDate(currentWeekStart.getDate() + 7);
    setCurrentWeekStart(newWeekStart);
  };

  const goToCurrentWeek = () => {
    const today = new Date();
    const currentDayOfWeek = today.getDay();
    const daysFromMonday = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1;
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - daysFromMonday);
    weekStart.setHours(0, 0, 0, 0);
    setCurrentWeekStart(weekStart);
  };

  // Toggle hour slot selection
  const toggleHourSlot = async (date: string, hourIndex: number) => {
    const hourSlot = weeklySchedule[date][hourIndex];
    
    // Don't allow toggling booked slots or past slots
    if (hourSlot.isBooked || isSlotInPastWithMinutes(date, hourSlot.hour)) {
      return;
    }

    // Create a copy of the schedule
    const newSchedule = { ...weeklySchedule };
    const newHourSlot = { ...hourSlot };

    if (hourSlot.isSelected && hourSlot.slotId) {
      const confirmed = window.confirm(
        'Are you sure you want to remove this available time slot? Students will no longer be able to book it.'
      );
      
      if (!confirmed) {
        return;
      }
      try {
        setSaving(true);
        const response = await ScheduleService.deleteTimeSlot(hourSlot.slotId);
        
        if (response.success) {
          newHourSlot.isSelected = false;
          newHourSlot.slotId = undefined;
          newSchedule[date][hourIndex] = newHourSlot;
          setWeeklySchedule(newSchedule);
          
          // Update timeSlots state
          setTimeSlots(prev => prev.filter(slot => slot.id !== hourSlot.slotId));
          
          // Notify parent component about schedule change
          onScheduleChange?.();
        } else {
          alert('Failed to remove time slot: ' + (response.message || 'Unknown error'));
        }
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Failed to remove time slot');
      } finally {
        setSaving(false);
      }
    } else if (!hourSlot.isSelected) {
      try {
        setSaving(true);
        const createData: CreateTimeSlotRequest = {
          date: date,
          start_time: hourSlot.startTime,
          end_time: hourSlot.endTime,
          status: 'free'
        };

        const response = await ScheduleService.createTimeSlot(tutorId, createData);
        
        if (response.success) {
          const newTimeSlot = convertAPITimeSlot(response.data);
          newHourSlot.isSelected = true;
          newHourSlot.slotId = newTimeSlot.id;
          newSchedule[date][hourIndex] = newHourSlot;
          setWeeklySchedule(newSchedule);
          
          // Update timeSlots state
          setTimeSlots(prev => [...prev, newTimeSlot]);
          
          // Notify parent component about schedule change
          onScheduleChange?.();
        } else {
          alert('Failed to create time slot: ' + (response.message || 'Unknown error'));
        }
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Failed to create time slot');
      } finally {
        setSaving(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <div className="flex items-center justify-center py-8">
          <Loader className="animate-spin text-blue-600 mr-2" size={24} />
          <span className="text-gray-600">Loading schedule...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <div className="text-center py-8">
          <AlertCircle className="text-red-600 mx-auto mb-2" size={48} />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Error Loading Schedule</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={loadTimeSlots}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <Calendar className="mr-2 text-blue-600" size={24} />
            Hourly Schedule Grid
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            Click on hour blocks to set your availability (6 AM - 12 AM)
          </p>
        </div>
        {saving && (
          <div className="flex items-center text-blue-600">
            <Loader className="animate-spin mr-2" size={16} />
            Saving...
          </div>
        )}
      </div>

      {/* Week Navigation */}
      <div className="flex items-center justify-between mb-6 p-4 bg-gray-50 rounded-lg">
        <button
          onClick={goToPreviousWeek}
          className="flex items-center px-3 py-2 text-blue-600 hover:bg-blue-100 rounded-lg"
        >
          <ChevronLeft size={20} />
          Previous Week
        </button>

        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-800">
            {formatDisplayDate(weekDates[0])} - {formatDisplayDate(weekDates[6])}
          </h3>
          <p className="text-sm text-gray-600">
            {weekDates[0].getFullYear()}
          </p>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={goToCurrentWeek}
            className="px-3 py-2 text-blue-600 hover:bg-blue-100 rounded-lg text-sm"
          >
            Current Week
          </button>
          <button
            onClick={goToNextWeek}
            className="flex items-center px-3 py-2 text-blue-600 hover:bg-blue-100 rounded-lg"
          >
            Next Week
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Schedule Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-full">
          {/* Header Row - Days of Week */}
          <div className="grid grid-cols-8 gap-1 mb-2">
            <div className="p-2 text-center font-medium text-gray-600 text-sm">
              Time
            </div>
            {weekDates.map((date, index) => {
              const dateStr = formatDateToString(date);
              const dayName = daysOfWeek[index];
              const isToday = dateStr === currentDate;
              const isPast = dateStr < currentDate;
              
              return (
                <div 
                  key={dateStr}
                  className={`p-2 text-center font-medium text-sm rounded ${
                    isPast 
                      ? 'text-gray-400 bg-gray-50' 
                      : isToday 
                        ? 'text-blue-700 bg-blue-50' 
                        : 'text-gray-700'
                  }`}
                >
                  <div className="font-semibold">{dayName}</div>
                  <div className="text-xs">{formatDisplayDate(date)}</div>
                  {isToday && <div className="text-xs text-blue-600 font-medium">Today</div>}
                </div>
              );
            })}
          </div>

          {/* Hour Rows */}
          {generateHourSlots().map((hourTemplate, hourIndex) => (
            <div key={hourIndex} className="grid grid-cols-8 gap-1 mb-1">
              {/* Time Label */}
              <div className="p-2 text-center text-xs font-medium text-gray-600 border border-gray-200 rounded bg-gray-50">
                {hourTemplate.timeLabel}
              </div>
              
              {/* Hour Slots for Each Day */}
              {weekDates.map(date => {
                const dateStr = formatDateToString(date);
                const hourSlot = weeklySchedule[dateStr]?.[hourIndex] || hourTemplate;
                const isPast = isSlotInPastWithMinutes(dateStr, hourSlot.hour);
                const isToday = dateStr === currentDate;
                const canClick = !isPast && !hourSlot.isBooked;
                
                return (
                  <button
                    key={`${dateStr}-${hourIndex}`}
                    onClick={() => canClick && toggleHourSlot(dateStr, hourIndex)}
                    disabled={!canClick || saving}
                    title={
                      hourSlot.isBooked 
                        ? 'This slot is booked by a student and cannot be modified'
                        : hourSlot.isSelected 
                          ? 'Click to remove this available time slot (confirmation required)'
                          : isPast 
                            ? 'This time slot is in the past'
                            : 'Click to make this time slot available for booking'
                    }
                    className={`p-2 text-xs border rounded transition-all duration-200 min-h-[40px] ${
                      hourSlot.isBooked
                        ? 'bg-red-100 border-red-300 text-red-700 cursor-not-allowed font-medium'
                        : hourSlot.isSelected
                          ? 'bg-green-100 border-green-300 text-green-700 hover:bg-orange-50 hover:border-orange-300 hover:text-orange-600 font-medium cursor-pointer'
                          : isPast
                            ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-white border-gray-200 text-gray-600 hover:bg-blue-50 hover:border-blue-300 cursor-pointer'
                    } ${isToday && !isPast ? 'ring-1 ring-blue-200' : ''}`}
                  >
                    <div className="flex flex-col items-center justify-center">
                      {hourSlot.isBooked ? (
                        <>
                          <div className="text-red-600 mb-1">🔒</div>
                          <div className="text-[10px] leading-tight">Booked</div>
                        </>
                      ) : hourSlot.isSelected ? (
                        <>
                          <div className="text-green-600 mb-1">✓</div>
                          <div className="text-[10px] leading-tight">Available</div>
                          <div className="text-[8px] text-orange-500 mt-1">Click to remove</div>
                        </>
                      ) : isPast ? (
                        <>
                          <div className="text-gray-400 mb-1">⏰</div>
                          <div className="text-[10px] leading-tight">Past</div>
                        </>
                      ) : (
                        <>
                          <div className="text-blue-500 mb-1">+</div>
                          <div className="text-[10px] leading-tight">Click to add</div>
                        </>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h3 className="font-semibold text-blue-800 mb-3">How to Use</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-white border border-gray-200 rounded mr-2"></div>
            <span className="text-gray-700">Click to make available</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-100 border border-green-300 rounded mr-2"></div>
            <span className="text-gray-700">Available for booking</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-100 border border-red-300 rounded mr-2"></div>
            <span className="text-gray-700">Booked by student</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-gray-100 border border-gray-200 rounded mr-2"></div>
            <span className="text-gray-700">Past time slots</span>
          </div>
        </div>
        <div className="mt-3 text-xs text-blue-700">
          <p>• Each block represents a 1-hour time slot</p>
          <p>• Click empty slots to make them available for booking</p>
          <p>• Click available slots again to remove them (confirmation will be shown)</p>
          <p>• Changes are saved automatically</p>
          <p>• Booked slots cannot be modified (students have reserved them)</p>
          <p>• Past time slots are automatically hidden</p>
        </div>
      </div>
    </div>
  );
};

export default ScheduleManager;