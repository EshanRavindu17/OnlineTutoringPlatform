import React, { useState } from 'react';
import { User, BookOpen, Calendar, Star, Settings, Bell, Trophy, Target, Clock, MessageCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';


const EditableStudentProfile = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [editMode, setEditMode] = useState({
    basic: false,
    about: false,
    courses: false,
    goals: false,
    contact: false,
    schedule: false,
    preferences: false
  });

  // Basic Info State
  const [basicInfo, setBasicInfo] = useState({
    name: "Alex Johnson",
    email: "alex.johnson@email.com",
    grade: "11th Grade",
    school: "Lincoln High School",
    joinDate: "September 2023",
    totalHours: 127,
    completedSessions: 42,
    averageScore: 87,
    profilePicture: "/api/placeholder/150/150"
  });

  // About Me State
  const [aboutMe, setAboutMe] = useState({
    intro: "Hi! I'm Alex Johnson, a dedicated 11th-grade student at Lincoln High School. I'm passionate about mathematics and science, and I'm working hard to improve my academic performance with the help of amazing tutors.",
    goals: "My main academic goals are to maintain a GPA above 3.8, excel in AP courses, and prepare for college admissions. I'm particularly focused on strengthening my skills in advanced mathematics and physics.",
    interests: "Outside of academics, I enjoy playing chess, participating in the school's robotics club, and volunteering at the local library. I'm also learning to play the guitar in my free time."
  });

  // Current Courses State
  const [currentCourses, setCurrentCourses] = useState([
    { id: 1, subject: "Advanced Mathematics", tutor: "Dr. Sarah Wilson", progress: 75, nextSession: "Tomorrow 3:00 PM", hourlyRate: 65 },
    { id: 2, subject: "Physics", tutor: "Prof. Michael Chen", progress: 60, nextSession: "Thursday 2:00 PM", hourlyRate: 70 },
    { id: 3, subject: "Chemistry", tutor: "Ms. Emily Rodriguez", progress: 85, nextSession: "Friday 4:00 PM", hourlyRate: 60 }
  ]);

  // Goals State
  const [goals, setGoals] = useState([
    { id: 1, title: "Achieve 90% in Mathematics", progress: 75, target: "End of Semester", category: "Academic" },
    { id: 2, title: "Complete 50 Tutoring Sessions", progress: 84, target: "This Month", category: "Learning" },
    { id: 3, title: "Improve Physics Grade to B+", progress: 60, target: "Next Quarter", category: "Academic" }
  ]);

  // Contact Info State
  const [contactInfo, setContactInfo] = useState({
    email: "alex.johnson@email.com",
    phone: "+1 (555) 987-6543",
    parentEmail: "parent.johnson@email.com",
    preferredContact: "Email",
    emergencyContact: "+1 (555) 123-4567"
  });

  // Learning Preferences State
  const [preferences, setPreferences] = useState({
    learningStyle: "Visual Learner",
    preferredTime: "Afternoon (2-6 PM)",
    sessionDuration: "60 minutes",
    communicationStyle: "Interactive Discussion",
    specialNeeds: "None"
  });

  // Schedule State
  const [schedule, setSchedule] = useState([
    { day: 'Mon', sessions: [] },
    { day: 'Tue', sessions: [{ subject: 'Mathematics', tutor: 'Dr. Sarah Wilson', time: '3:00 PM', duration: '60 min' }] },
    { day: 'Wed', sessions: [] },
    { day: 'Thu', sessions: [{ subject: 'Physics', tutor: 'Prof. Michael Chen', time: '2:00 PM', duration: '45 min' }] },
    { day: 'Fri', sessions: [{ subject: 'Chemistry', tutor: 'Ms. Emily Rodriguez', time: '4:00 PM', duration: '60 min' }] },
    { day: 'Sat', sessions: [] },
    { day: 'Sun', sessions: [] }
  ]);

  const achievements = [
    { icon: "🏆", title: "Top Performer", description: "Achieved 90%+ in Mathematics" },
    { icon: "🎯", title: "Goal Achiever", description: "Completed 10 learning objectives" },
    { icon: "⭐", title: "Consistent Learner", description: "30-day learning streak" }
  ];

  const upcomingSessions = [
    { subject: "Mathematics", tutor: "Dr. Sarah Wilson", time: "Tomorrow, 3:00 PM", duration: "60 min" },
    { subject: "Physics", tutor: "Prof. Michael Chen", time: "Thursday, 2:00 PM", duration: "45 min" },
    { subject: "Chemistry", tutor: "Ms. Emily Rodriguez", time: "Friday, 4:00 PM", duration: "60 min" }
  ];

  const toggleEditMode = (section) => {
    setEditMode(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleBasicInfoChange = (field, value) => {
    setBasicInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAboutMeChange = (field, value) => {
    setAboutMe(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleContactChange = (field, value) => {
    setContactInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePreferencesChange = (field, value) => {
    setPreferences(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateCourse = (id, field, value) => {
    setCurrentCourses(prev => prev.map(course => 
      course.id === id ? { ...course, [field]: value } : course
    ));
  };

  const addCourse = () => {
    const newId = Math.max(...currentCourses.map(c => c.id)) + 1;
    setCurrentCourses(prev => [...prev, {
      id: newId,
      subject: '',
      tutor: '',
      progress: 0,
      nextSession: '',
      hourlyRate: 0
    }]);
  };

  const removeCourse = (id) => {
    setCurrentCourses(prev => prev.filter(course => course.id !== id));
  };

  const updateGoal = (id, field, value) => {
    setGoals(prev => prev.map(goal => 
      goal.id === id ? { ...goal, [field]: value } : goal
    ));
  };

  const addGoal = () => {
    const newId = Math.max(...goals.map(g => g.id)) + 1;
    setGoals(prev => [...prev, {
      id: newId,
      title: '',
      progress: 0,
      target: '',
      category: 'Academic'
    }]);
  };

  const removeGoal = (id) => {
    setGoals(prev => prev.filter(goal => goal.id !== id));
  };

  const EditButton = ({ section, className = "" }) => (
    <button
      onClick={() => toggleEditMode(section)}
      className={`text-blue-600 hover:text-blue-800 transition duration-200 ${className}`}
    >
      {editMode[section] ? '✅ Save' : '✏️ Edit'}
    </button>
  );

  const TabButton = ({ id, label, icon: Icon }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
        activeTab === id
          ? 'bg-blue-600 text-white'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      }`}
    >
      <Icon size={18} />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar/>
      <div className="max-w-6xl mx-auto p-5">
        {/* Header Section */}
        <div className="bg-blue-600 text-white p-10 rounded-2xl mb-8">
          <div className="flex justify-end mb-4">
            <EditButton section="basic" className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            <div className="text-center md:text-left">
              <img 
                src={basicInfo.profilePicture}
                alt={basicInfo.name}
                className="w-48 h-48 rounded-full border-4 border-white border-opacity-30 mx-auto md:mx-0 object-cover"
              />
            </div>
            <div className="md:col-span-2 text-center md:text-left">
              {editMode.basic ? (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={basicInfo.name}
                    onChange={(e) => handleBasicInfoChange('name', e.target.value)}
                    className="w-full text-4xl font-bold bg-transparent border-b-2 border-white border-opacity-50 text-white placeholder-white placeholder-opacity-70 focus:outline-none focus:border-opacity-100"
                    placeholder="Your Name"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      value={basicInfo.grade}
                      onChange={(e) => handleBasicInfoChange('grade', e.target.value)}
                      className="w-full bg-transparent border-b-2 border-white border-opacity-50 text-white placeholder-white placeholder-opacity-70 focus:outline-none focus:border-opacity-100"
                      placeholder="Grade"
                    />
                    <input
                      type="text"
                      value={basicInfo.school}
                      onChange={(e) => handleBasicInfoChange('school', e.target.value)}
                      className="w-full bg-transparent border-b-2 border-white border-opacity-50 text-white placeholder-white placeholder-opacity-70 focus:outline-none focus:border-opacity-100"
                      placeholder="School"
                    />
                  </div>
                  <input
                    type="email"
                    value={basicInfo.email}
                    onChange={(e) => handleBasicInfoChange('email', e.target.value)}
                    className="w-full bg-transparent border-b-2 border-white border-opacity-50 text-white placeholder-white placeholder-opacity-70 focus:outline-none focus:border-opacity-100"
                    placeholder="Email"
                  />
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <input
                        type="number"
                        value={basicInfo.totalHours}
                        onChange={(e) => handleBasicInfoChange('totalHours', parseInt(e.target.value))}
                        className="w-full text-center text-3xl font-bold bg-transparent border-b-2 border-white border-opacity-50 text-white focus:outline-none focus:border-opacity-100"
                      />
                      <span className="text-sm opacity-90">Total Hours</span>
                    </div>
                    <div>
                      <input
                        type="number"
                        value={basicInfo.completedSessions}
                        onChange={(e) => handleBasicInfoChange('completedSessions', parseInt(e.target.value))}
                        className="w-full text-center text-3xl font-bold bg-transparent border-b-2 border-white border-opacity-50 text-white focus:outline-none focus:border-opacity-100"
                      />
                      <span className="text-sm opacity-90">Sessions</span>
                    </div>
                    <div>
                      <input
                        type="number"
                        value={basicInfo.averageScore}
                        onChange={(e) => handleBasicInfoChange('averageScore', parseInt(e.target.value))}
                        className="w-full text-center text-3xl font-bold bg-transparent border-b-2 border-white border-opacity-50 text-white focus:outline-none focus:border-opacity-100"
                      />
                      <span className="text-sm opacity-90">Avg Score %</span>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <h1 className="text-4xl font-bold mb-2">{basicInfo.name}</h1>
                  <h2 className="text-xl opacity-90 mb-4">{basicInfo.grade} • {basicInfo.school}</h2>
                  <p className="text-lg opacity-90 mb-6">Member since {basicInfo.joinDate}</p>
                  
                  <div className="grid grid-cols-3 gap-8 text-center">
                    <div>
                      <span className="text-3xl font-bold block">{basicInfo.totalHours}h</span>
                      <span className="text-sm opacity-90">Total Hours</span>
                    </div>
                    <div>
                      <span className="text-3xl font-bold block">{basicInfo.completedSessions}</span>
                      <span className="text-sm opacity-90">Sessions</span>
                    </div>
                    <div>
                      <span className="text-3xl font-bold block">{basicInfo.averageScore}%</span>
                      <span className="text-sm opacity-90">Avg Score</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-4 mb-6 overflow-x-auto">
          <TabButton id="overview" label="Overview" icon={User} />
          <TabButton id="courses" label="My Courses" icon={BookOpen} />
          <TabButton id="schedule" label="Schedule" icon={Calendar} />
          <TabButton id="achievements" label="Achievements" icon={Trophy} />
        </div>

        {/* Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* About Me */}
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-2xl font-semibold text-blue-600 pb-2 border-b-2 border-gray-100">
                    About Me
                  </h3>
                  <EditButton section="about" />
                </div>
                {editMode.about ? (
                  <div className="space-y-4">
                    <textarea
                      value={aboutMe.intro}
                      onChange={(e) => handleAboutMeChange('intro', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows="3"
                      placeholder="Introduction"
                    />
                    <textarea
                      value={aboutMe.goals}
                      onChange={(e) => handleAboutMeChange('goals', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows="3"
                      placeholder="Academic Goals"
                    />
                    <textarea
                      value={aboutMe.interests}
                      onChange={(e) => handleAboutMeChange('interests', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows="2"
                      placeholder="Interests & Hobbies"
                    />
                  </div>
                ) : (
                  <div className="space-y-4 text-gray-700">
                    <p>{aboutMe.intro}</p>
                    <p>{aboutMe.goals}</p>
                    <p>{aboutMe.interests}</p>
                  </div>
                )}
              </div>

              {/* Current Courses */}
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-2xl font-semibold text-blue-600 pb-2 border-b-2 border-gray-100">
                    Current Courses
                  </h3>
                  <EditButton section="courses" />
                </div>
                {editMode.courses ? (
                  <div className="space-y-4">
                    <button
                      onClick={addCourse}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Add Course
                    </button>
                    {currentCourses.map((course) => (
                      <div key={course.id} className="border border-gray-200 p-4 rounded-lg">
                        <div className="grid grid-cols-2 gap-4 mb-3">
                          <input
                            type="text"
                            value={course.subject}
                            onChange={(e) => updateCourse(course.id, 'subject', e.target.value)}
                            placeholder="Subject"
                            className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <input
                            type="text"
                            value={course.tutor}
                            onChange={(e) => updateCourse(course.id, 'tutor', e.target.value)}
                            placeholder="Tutor Name"
                            className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-3">
                          <input
                            type="number"
                            value={course.progress}
                            onChange={(e) => updateCourse(course.id, 'progress', parseInt(e.target.value))}
                            placeholder="Progress %"
                            className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <input
                            type="text"
                            value={course.nextSession}
                            onChange={(e) => updateCourse(course.id, 'nextSession', e.target.value)}
                            placeholder="Next Session"
                            className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <button
                          onClick={() => removeCourse(course.id)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Remove Course
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {currentCourses.map((course) => (
                      <div key={course.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold text-gray-800">{course.subject}</h3>
                            <p className="text-sm text-gray-600">with {course.tutor}</p>
                          </div>
                          <span className="text-sm text-blue-600 font-medium">{course.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${course.progress}%` }}
                          ></div>
                        </div>
                        <p className="text-sm text-gray-500">Next session: {course.nextSession}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Learning Goals */}
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-2xl font-semibold text-blue-600 pb-2 border-b-2 border-gray-100">
                    Learning Goals
                  </h3>
                  <EditButton section="goals" />
                </div>
                {editMode.goals ? (
                  <div className="space-y-4">
                    <button
                      onClick={addGoal}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Add Goal
                    </button>
                    {goals.map((goal) => (
                      <div key={goal.id} className="border border-gray-200 p-4 rounded-lg">
                        <div className="grid grid-cols-2 gap-4 mb-3">
                          <input
                            type="text"
                            value={goal.title}
                            onChange={(e) => updateGoal(goal.id, 'title', e.target.value)}
                            placeholder="Goal Title"
                            className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <select
                            value={goal.category}
                            onChange={(e) => updateGoal(goal.id, 'category', e.target.value)}
                            className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="Academic">Academic</option>
                            <option value="Learning">Learning</option>
                            <option value="Personal">Personal</option>
                          </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-3">
                          <input
                            type="number"
                            value={goal.progress}
                            onChange={(e) => updateGoal(goal.id, 'progress', parseInt(e.target.value))}
                            placeholder="Progress %"
                            className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <input
                            type="text"
                            value={goal.target}
                            onChange={(e) => updateGoal(goal.id, 'target', e.target.value)}
                            placeholder="Target Date"
                            className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <button
                          onClick={() => removeGoal(goal.id)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Remove Goal
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {goals.map((goal) => (
                      <div key={goal.id} className="border-l-4 border-blue-600 pl-4 py-3">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-gray-800">{goal.title}</h4>
                          <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">{goal.category}</span>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-600">Progress</span>
                          <span className="text-sm font-semibold text-blue-600">{goal.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${goal.progress}%` }}
                          ></div>
                        </div>
                        <p className="text-sm text-gray-500">Target: {goal.target}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Upcoming Sessions */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4">Upcoming Sessions</h2>
                <div className="space-y-3">
                  {upcomingSessions.map((session, index) => (
                    <div key={index} className="border-l-4 border-blue-600 pl-4 py-2">
                      <h3 className="font-semibold text-gray-800">{session.subject}</h3>
                      <p className="text-sm text-gray-600">{session.tutor}</p>
                      <p className="text-sm text-blue-600">{session.time}</p>
                      <p className="text-xs text-gray-500">{session.duration}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact Info */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Contact Information</h2>
                  <EditButton section="contact" />
                </div>
                
                {editMode.contact ? (
                  <div className="space-y-3">
                    <input
                      type="email"
                      value={contactInfo.email}
                      onChange={(e) => handleContactChange('email', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Email"
                    />
                    <input
                      type="text"
                      value={contactInfo.phone}
                      onChange={(e) => handleContactChange('phone', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Phone"
                    />
                    <input
                      type="email"
                      value={contactInfo.parentEmail}
                      onChange={(e) => handleContactChange('parentEmail', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Parent Email"
                    />
                    <input
                      type="text"
                      value={contactInfo.emergencyContact}
                      onChange={(e) => handleContactChange('emergencyContact', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Emergency Contact"
                    />
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-gray-600 text-sm">
                      <span>📧</span>
                      <span>{contactInfo.email}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-600 text-sm">
                      <span>📱</span>
                      <span>{contactInfo.phone}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-600 text-sm">
                      <span>👨‍👩‍👧‍👦</span>
                      <span>{contactInfo.parentEmail}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-600 text-sm">
                      <span>🚨</span>
                      <span>{contactInfo.emergencyContact}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Learning Preferences */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Learning Preferences</h2>
                  <EditButton section="preferences" />
                </div>
                
                {editMode.preferences ? (
                  <div className="space-y-3">
                    <select
                      value={preferences.learningStyle}
                      onChange={(e) => handlePreferencesChange('learningStyle', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Visual Learner">Visual Learner</option>
                      <option value="Auditory Learner">Auditory Learner</option>
                      <option value="Kinesthetic Learner">Kinesthetic Learner</option>
                    </select>
                    <input
                      type="text"
                      value={preferences.preferredTime}
                      onChange={(e) => handlePreferencesChange('preferredTime', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Preferred Time"
                    />
                    <select
                      value={preferences.sessionDuration}
                      onChange={(e) => handlePreferencesChange('sessionDuration', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="30 minutes">30 minutes</option>
                      <option value="45 minutes">45 minutes</option>
                      <option value="60 minutes">60 minutes</option>
                      <option value="90 minutes">90 minutes</option>
                    </select>
                    <input
                      type="text"
                      value={preferences.communicationStyle}
                      onChange={(e) => handlePreferencesChange('communicationStyle', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Communication Style"
                    />
                    <input
                      type="text"
                      value={preferences.specialNeeds}
                      onChange={(e) => handlePreferencesChange('specialNeeds', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Special Needs"
                    />
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-gray-600 text-sm">
                      <span>🎯</span>
                      <span>{preferences.learningStyle}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-600 text-sm">
                      <span>⏰</span>
                      <span>{preferences.preferredTime}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-600 text-sm">
                      <span>⏱️</span>
                      <span>{preferences.sessionDuration}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-600 text-sm">
                      <span>💬</span>
                      <span>{preferences.communicationStyle}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-600 text-sm">
                      <span>🔧</span>
                      <span>{preferences.specialNeeds}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
                <div className="space-y-3">
                  <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    Find New Tutor
                  </button>
                  <button className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors">
                    Schedule Session
                  </button>
                  <button className="w-full flex items-center justify-center space-x-2 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors">
                    <MessageCircle size={18} />
                    <span>Message Tutors</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'courses' && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {currentCourses.map((course) => (
              <div key={course.id} className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold text-gray-800">{course.subject}</h3>
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                    Active
                  </span>
                </div>
                <p className="text-gray-600 mb-4">Tutor: {course.tutor}</p>
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Progress</span>
                    <span className="text-sm font-semibold text-blue-600">{course.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${course.progress}%` }}
                    ></div>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <p className="text-sm text-gray-600 mb-3">Next Session: {course.nextSession}</p>
                  <div className="flex space-x-2">
                    <button className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
                      View Details
                    </button>
                    <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                      <MessageCircle size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'schedule' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">My Schedule</h2>
              <div className="flex gap-2">
                <EditButton section="schedule" />
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  Schedule New Session
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
              {schedule.map((daySchedule, index) => (
                <div key={daySchedule.day} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-center text-gray-800 mb-3">{daySchedule.day}</h3>
                  <div className="space-y-2">
                    {daySchedule.sessions.map((session, sessionIndex) => (
                      <div key={sessionIndex} className="bg-blue-100 p-2 rounded text-sm">
                        <p className="font-medium">{session.subject}</p>
                        <p className="text-xs text-gray-600">{session.tutor}</p>
                        <p>{session.time}</p>
                        <p className="text-xs text-gray-500">{session.duration}</p>
                      </div>
                    ))}
                    {daySchedule.sessions.length === 0 && (
                      <div className="text-center text-gray-400 text-xs py-4">
                        No sessions
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'achievements' && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {achievements.map((achievement, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm p-6 text-center">
                <div className="text-4xl mb-4">{achievement.icon}</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{achievement.title}</h3>
                <p className="text-gray-600">{achievement.description}</p>
              </div>
            ))}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-sm p-6 text-center border-2 border-dashed border-blue-300">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Next Goal</h3>
              <p className="text-gray-600">Complete 50 tutoring sessions</p>
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '84%' }}></div>
                </div>
                <p className="text-sm text-gray-600 mt-2">42/50 sessions completed</p>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer/>
    </div>
  );
};

export default EditableStudentProfile;