import React, { useState } from 'react';
import { Calendar, Clock, Plus, Edit2, Trash2, User, Save, X, CheckCircle, XCircle } from 'lucide-react';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';


const TutorAvailabilityCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [timeSlots, setTimeSlots] = useState([]);
  const [showAddSlot, setShowAddSlot] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [newSlot, setNewSlot] = useState({
    date: '',
    startTime: '',
    endTime: '',
    isAvailable: true,
    notes: ''
  });

  // Tutor profile (you can customize this)
  const tutorProfile = {
    name: 'Dr. Sarah Johnson',
    subject: 'Mathematics & Physics',
    avatar: '👩‍🏫',
    email: 'sarah.johnson@example.com'
  };

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  const getTimeSlotsForDate = (date) => {
    const dateStr = formatDate(date);
    return timeSlots.filter(slot => slot.date === dateStr);
  };

  const handleDateClick = (day) => {
    if (day) {
      const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      setSelectedDate(clickedDate);
    }
  };

  const handleAddSlot = () => {
    if (selectedDate) {
      setNewSlot({
        date: formatDate(selectedDate),
        startTime: '',
        endTime: '',
        isAvailable: true,
        notes: ''
      });
      setShowAddSlot(true);
    }
  };

  const handleSaveSlot = () => {
    if (newSlot.startTime && newSlot.endTime) {
      const slot = {
        id: Date.now(),
        ...newSlot
      };
      
      if (editingSlot) {
        setTimeSlots(timeSlots.map(s => s.id === editingSlot.id ? { ...slot, id: editingSlot.id } : s));
        setEditingSlot(null);
      } else {
        setTimeSlots([...timeSlots, slot]);
      }
      
      setShowAddSlot(false);
      setNewSlot({
        date: '',
        startTime: '',
        endTime: '',
        isAvailable: true,
        notes: ''
      });
    }
  };

  const handleEditSlot = (slot) => {
    setNewSlot({
      date: slot.date,
      startTime: slot.startTime,
      endTime: slot.endTime,
      isAvailable: slot.isAvailable,
      notes: slot.notes || ''
    });
    setEditingSlot(slot);
    setShowAddSlot(true);
  };

  const handleDeleteSlot = (slotId) => {
    setTimeSlots(timeSlots.filter(slot => slot.id !== slotId));
  };

  const toggleAvailability = (slotId) => {
    setTimeSlots(timeSlots.map(slot => 
      slot.id === slotId ? { ...slot, isAvailable: !slot.isAvailable } : slot
    ));
  };

  const navigateMonth = (direction) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1));
    setSelectedDate(null);
  };

  const days = getDaysInMonth(currentDate);
  const selectedDateSlots = selectedDate ? getTimeSlotsForDate(selectedDate) : [];
  const totalSlots = timeSlots.length;
  const availableSlots = timeSlots.filter(slot => slot.isAvailable).length;

  return (
    <>
    <Navbar/>
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-blue-200 p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-3xl">
                  {tutorProfile.avatar}
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{tutorProfile.name}</h1>
                  <p className="text-blue-600 font-medium">{tutorProfile.subject}</p>
                  <p className="text-sm text-gray-500">{tutorProfile.email}</p>
                </div>
              </div>
              <div className="flex space-x-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{totalSlots}</div>
                  <div className="text-sm font-medium text-gray-600">Total Slots</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-500">{availableSlots}</div>
                  <div className="text-sm font-medium text-gray-600">Available</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-700">{totalSlots - availableSlots}</div>
                  <div className="text-sm font-medium text-gray-600">Booked</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Calendar Section */}
          <div className="xl:col-span-3">
            <div className="bg-white rounded-2xl shadow-sm border border-blue-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={() => navigateMonth(-1)}
                  className="p-3 hover:bg-blue-50 text-blue-600 rounded-full transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h2 className="text-2xl font-bold text-gray-900">
                  {months[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h2>
                <button
                  onClick={() => navigateMonth(1)}
                  className="p-3 hover:bg-blue-50 text-blue-600 rounded-full transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-7 gap-2 mb-4">
                {daysOfWeek.map(day => (
                  <div key={day} className="p-3 text-center font-semibold text-blue-600 text-sm">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-2">
                {days.map((day, index) => {
                  const isCurrentDay = day && selectedDate && 
                    day === selectedDate.getDate() && 
                    currentDate.getMonth() === selectedDate.getMonth() &&
                    currentDate.getFullYear() === selectedDate.getFullYear();
                  
                  const daySlots = day ? getTimeSlotsForDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day)) : [];

                  return (
                    <div
                      key={index}
                      onClick={() => handleDateClick(day)}
                      className={`min-h-[100px] p-3 rounded-xl cursor-pointer transition-all duration-200 border-2 ${
                        day ? 'hover:shadow-md hover:scale-105' : ''
                      } ${
                        isCurrentDay 
                          ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white border-blue-600' 
                          : day 
                            ? 'bg-white border-blue-200 hover:border-blue-400 hover:bg-blue-50' 
                            : 'bg-transparent border-transparent'
                      }`}
                    >
                      {day && (
                        <>
                          <div className={`font-bold text-lg mb-2 ${isCurrentDay ? 'text-white' : 'text-gray-900'}`}>
                            {day}
                          </div>
                          <div className="space-y-1">
                            {daySlots.slice(0, 2).map(slot => (
                              <div
                                key={slot.id}
                                className={`text-xs p-1 rounded-md font-medium ${
                                  slot.isAvailable 
                                    ? 'bg-blue-100 text-blue-700' 
                                    : 'bg-blue-200 text-blue-800'
                                }`}
                              >
                                {slot.startTime}-{slot.endTime}
                              </div>
                            ))}
                            {daySlots.length > 2 && (
                              <div className={`text-xs ${isCurrentDay ? 'text-white' : 'text-blue-600'}`}>
                                +{daySlots.length - 2} more
                              </div>
                            )}
                            {daySlots.length === 0 && (
                              <div className={`text-xs ${isCurrentDay ? 'text-white opacity-75' : 'text-blue-400'}`}>
                                No slots
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Selected Date Panel */}
            {selectedDate && (
              <div className="bg-white rounded-2xl shadow-sm border border-blue-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center">
                    <Calendar className="mr-2 text-blue-600" size={20} />
                    {selectedDate.toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </h3>
                  <button
                    onClick={handleAddSlot}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-blue-800 flex items-center text-sm transition-all shadow-sm"
                  >
                    <Plus size={16} className="mr-1" />
                    Add Slot
                  </button>
                </div>

                <div className="space-y-3">
                  {selectedDateSlots.length === 0 ? (
                    <div className="text-center py-8">
                      <Clock className="mx-auto text-blue-400 mb-2" size={32} />
                      <p className="text-gray-600 font-medium">No time slots scheduled</p>
                      <p className="text-sm text-blue-500">Click "Add Slot" to create one</p>
                    </div>
                  ) : (
                    selectedDateSlots.map(slot => (
                      <div
                        key={slot.id}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          slot.isAvailable 
                            ? 'bg-blue-50 border-blue-200' 
                            : 'bg-blue-100 border-blue-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              {slot.isAvailable ? (
                                <CheckCircle className="text-blue-600" size={16} />
                              ) : (
                                <XCircle className="text-blue-700" size={16} />
                              )}
                              <span className="font-semibold text-gray-900">
                                {slot.startTime} - {slot.endTime}
                              </span>
                            </div>
                            <div className={`text-sm font-medium ${
                              slot.isAvailable ? 'text-blue-600' : 'text-blue-700'
                            }`}>
                              {slot.isAvailable ? 'Available' : 'Booked'}
                            </div>
                            {slot.notes && (
                              <div className="text-sm text-gray-600 mt-1">{slot.notes}</div>
                            )}
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => toggleAvailability(slot.id)}
                              className={`p-2 rounded-lg transition-colors ${
                                slot.isAvailable 
                                  ? 'bg-blue-200 text-blue-700 hover:bg-blue-300' 
                                  : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                              }`}
                              title={slot.isAvailable ? 'Mark as booked' : 'Mark as available'}
                            >
                              {slot.isAvailable ? <XCircle size={16} /> : <CheckCircle size={16} />}
                            </button>
                            <button
                              onClick={() => handleEditSlot(slot)}
                              className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                              title="Edit slot"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteSlot(slot.id)}
                              className="p-2 bg-blue-50 text-blue-500 rounded-lg hover:bg-blue-100 transition-colors"
                              title="Delete slot"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-sm border border-blue-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button 
                  onClick={() => setSelectedDate(new Date())}
                  className="w-full p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-left font-medium"
                >
                  View Today's Schedule
                </button>
                <button className="w-full p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-left font-medium">
                  Export Schedule
                </button>
                <button className="w-full p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-left font-medium">
                  Set Recurring Slots
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Add/Edit Slot Modal */}
        {showAddSlot && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-blue-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  {editingSlot ? 'Edit Time Slot' : 'Add Time Slot'}
                </h3>
                <button
                  onClick={() => {
                    setShowAddSlot(false);
                    setEditingSlot(null);
                    setNewSlot({
                      date: '',
                      startTime: '',
                      endTime: '',
                      isAvailable: true,
                      notes: ''
                    });
                  }}
                  className="text-blue-500 hover:text-blue-700 p-2 rounded-full hover:bg-blue-50"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-blue-700 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={newSlot.date}
                    onChange={(e) => setNewSlot({...newSlot, date: e.target.value})}
                    className="w-full p-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-blue-700 mb-2">
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={newSlot.startTime}
                      onChange={(e) => setNewSlot({...newSlot, startTime: e.target.value})}
                      className="w-full p-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-blue-700 mb-2">
                      End Time
                    </label>
                    <input
                      type="time"
                      value={newSlot.endTime}
                      onChange={(e) => setNewSlot({...newSlot, endTime: e.target.value})}
                      className="w-full p-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-blue-700 mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={newSlot.notes}
                    onChange={(e) => setNewSlot({...newSlot, notes: e.target.value})}
                    placeholder="Add any notes about this time slot..."
                    className="w-full p-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    rows="3"
                  />
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="availability"
                    checked={newSlot.isAvailable}
                    onChange={(e) => setNewSlot({...newSlot, isAvailable: e.target.checked})}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="availability" className="text-sm font-medium text-blue-700">
                    Mark as available for booking
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-8">
                <button
                  onClick={() => {
                    setShowAddSlot(false);
                    setEditingSlot(null);
                  }}
                  className="px-6 py-2 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveSlot}
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 flex items-center transition-all shadow-sm"
                >
                  <Save size={16} className="mr-2" />
                  {editingSlot ? 'Update' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    <Footer/>
    </>
  );
};

export default TutorAvailabilityCalendar;