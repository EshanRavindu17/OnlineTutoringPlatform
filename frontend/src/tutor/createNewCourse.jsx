import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Upload, X, Plus, DollarSign, Clock, Users, BookOpen, Video, FileText, Star,
  Eye, EyeOff, Image, CheckCircle, AlertCircle, Save, Globe, Lock, Target, 
  Award, TrendingUp, Edit3, Trash2, FileDown
} from 'lucide-react';
import NavBar from '../components/Navbar';
import Footer from '../components/Footer';

const CreateCoursePage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [previewMode, setPreviewMode] = useState(false);
  const [errors, setErrors] = useState({});
  const [savedProgress, setSavedProgress] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.fromUpload) {
      setCurrentStep(location.state.step || 3);
    }
  }, [location]);

  const [courseData, setCourseData] = useState({
    title: '',
    subtitle: '',
    description: '',
    category: '',
    subcategory: '',
    level: '',
    language: '',
    price: '',
    comparePrice: '',
    duration: '',
    maxStudents: '',
    tags: [],
    requirements: [''],
    learningOutcomes: [''],
    targetAudience: [''],
    thumbnail: null,
    previewVideo: null,
    status: 'draft',
    certification: false,
    curriculum: [
      { 
        id: 1, 
        title: '', 
        description: '',
        lessons: [{ 
          id: 1, 
          title: '', 
          type: 'video', 
          duration: '', 
          description: '',
          isPreview: false 
        }] 
      }
    ],
    instructor: {
      bio: '',
      credentials: '',
      experience: ''
    },
    seo: {
      metaTitle: '',
      metaDescription: '',
      slug: ''
    }
  });

  const categories = {
    'Technology': ['Web Development', 'Mobile Development', 'Data Science', 'AI/ML', 'DevOps', 'Cybersecurity'],
    'Business': ['Marketing', 'Finance', 'Management', 'Entrepreneurship', 'Sales', 'Project Management'],
    'Design': ['Graphic Design', 'UX/UI Design', 'Digital Art', 'Photography', 'Video Editing', 'Animation'],
    'Languages': ['English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese'],
    'Personal Development': ['Leadership', 'Communication', 'Productivity', 'Mindfulness', 'Career Development'],
    'Health & Fitness': ['Yoga', 'Nutrition', 'Mental Health', 'Exercise', 'Wellness', 'Sports'],
    'Arts & Crafts': ['Drawing', 'Painting', 'Music', 'Writing', 'Crafts', 'Theater'],
    'Academic': ['Mathematics', 'Science', 'History', 'Literature', 'Philosophy', 'Research Methods']
  };

  const levels = [
    { value: 'beginner', label: 'Beginner', description: 'No prior experience required' },
    { value: 'intermediate', label: 'Intermediate', description: 'Some basic knowledge helpful' },
    { value: 'advanced', label: 'Advanced', description: 'Extensive experience required' },
    { value: 'all', label: 'All Levels', description: 'Suitable for everyone' }
  ];

  const languages = [
    'English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese', 
    'Arabic', 'Portuguese', 'Russian', 'Italian', 'Korean', 'Dutch'
  ];

  const lessonTypes = [
    { value: 'video', label: 'Video Lesson', icon: Video },
    { value: 'text', label: 'Text Article', icon: FileText },
    { value: 'quiz', label: 'Quiz', icon: CheckCircle },
    { value: 'assignment', label: 'Assignment', icon: Edit3 },
    { value: 'download', label: 'Download', icon: FileDown }
  ];

  const steps = [
    { number: 1, title: 'Basic Information', icon: BookOpen, description: 'Course title, description, and category' },
    { number: 2, title: 'Course Details', icon: Target, description: 'Learning outcomes and requirements' },
    { number: 3, title: 'Curriculum', icon: Video, description: 'Course structure and lessons' },
    { number: 4, title: 'Pricing & Publish', icon: DollarSign, description: 'Pricing and publication settings' }
  ];

  // Validation functions
  const validateStep = (step) => {
    const newErrors = {};
    
    if (step === 1) {
      if (!courseData.title.trim()) newErrors.title = 'Course title is required';
      if (!courseData.description.trim()) newErrors.description = 'Course description is required';
      if (!courseData.category) newErrors.category = 'Category is required';
      if (!courseData.level) newErrors.level = 'Level is required';
      if (!courseData.language) newErrors.language = 'Language is required';
    }
     
    if (step === 2) {
      if (courseData.learningOutcomes.filter(o => o.trim()).length === 0) {
        newErrors.learningOutcomes = 'At least one learning outcome is required';
      }
    }
    
    if (step === 4) {
      if (!courseData.price && courseData.price !== '0') newErrors.price = 'Price is required';
      if (!courseData.duration.trim()) newErrors.duration = 'Duration is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Event handlers
  const handleInputChange = (field, value) => {
    setCourseData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleNestedInputChange = (section, field, value) => {
    setCourseData(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: value }
    }));
  };

  const handleArrayChange = (field, index, value) => {
    setCourseData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayItem = (field) => {
    setCourseData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayItem = (field, index) => {
    setCourseData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const addTag = (tag) => {
    if (tag && !courseData.tags.includes(tag) && courseData.tags.length < 10) {
      setCourseData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    }
  };

  const removeTag = (tag) => {
    setCourseData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  // Curriculum management
  const addSection = () => {
    const newSection = {
      id: Date.now(),
      title: '',
      description: '',
      lessons: [{ id: Date.now(), title: '', type: 'video', duration: '', description: '', isPreview: false }]
    };
    setCourseData(prev => ({
      ...prev,
      curriculum: [...prev.curriculum, newSection]
    }));
  };

  const removeSection = (sectionIndex) => {
    setCourseData(prev => ({
      ...prev,
      curriculum: prev.curriculum.filter((_, i) => i !== sectionIndex)
    }));
  };

  const addLesson = (sectionIndex) => {
    setCourseData(prev => ({
      ...prev,
      curriculum: prev.curriculum.map((section, index) => {
        if (index === sectionIndex) {
          return {
            ...section,
            lessons: [...section.lessons, {
              id: Date.now(),
              title: '',
              type: 'video',
              duration: '',
              description: '',
              isPreview: false
            }]
          };
        }
        return section;
      })
    }));
  };

  const removeLesson = (sectionIndex, lessonIndex) => {
    setCourseData(prev => ({
      ...prev,
      curriculum: prev.curriculum.map((section, si) => {
        if (si === sectionIndex) {
          return {
            ...section,
            lessons: section.lessons.filter((_, li) => li !== lessonIndex)
          };
        }
        return section;
      })
    }));
  };

  const updateSectionField = (sectionIndex, field, value) => {
    setCourseData(prev => ({
      ...prev,
      curriculum: prev.curriculum.map((s, i) => 
        i === sectionIndex ? { ...s, [field]: value } : s
      )
    }));
  };

  const updateLessonField = (sectionIndex, lessonIndex, field, value) => {
    setCourseData(prev => ({
      ...prev,
      curriculum: prev.curriculum.map((s, si) => {
        if (si === sectionIndex) {
          return {
            ...s,
            lessons: s.lessons.map((l, li) => 
              li === lessonIndex ? { ...l, [field]: value } : l
            )
          };
        }
        return s;
      })
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCourseData(prev => ({ ...prev, thumbnail: event.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadLesson = (sectionIndex, lessonIndex) => {
    const lesson = courseData.curriculum[sectionIndex].lessons[lessonIndex];
    if (lesson.type === 'video') {
      navigate('/uploadvideo', { 
        state: { 
          sectionIndex, 
          lessonIndex, 
          returnTo: '/addnewcourse',
          step: 3
        } 
      });
    } else {
      navigate('/anotherLessonUpload', { state: { sectionIndex, lessonIndex, type: lesson.type } });
    }
  };

  const saveProgress = () => {
    setSavedProgress(true);
    setTimeout(() => setSavedProgress(false), 2000);
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(Math.min(4, currentStep + 1));
    }
  };

  const prevStep = () => {
    setCurrentStep(Math.max(1, currentStep - 1));
  };

  const renderProgressBar = () => {
    const progress = (currentStep / 4) * 100;
    return (
      <div className="w-full bg-gray-200 rounded-full h-2 mb-8">
        <div 
          className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    );
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-between mb-8">
      {steps.map((step, index) => (
        <div key={step.number} className="flex-1">
          <div className="flex items-center">
            <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 ${
              currentStep >= step.number 
                ? 'bg-blue-600 border-blue-600 text-white shadow-lg' 
                : currentStep === step.number - 1
                ? 'border-blue-300 text-blue-600 bg-blue-50'
                : 'border-gray-300 text-gray-400 bg-gray-50'
            }`}>
              {currentStep > step.number ? (
                <CheckCircle className="w-6 h-6" />
              ) : (
                <step.icon className="w-6 h-6" />
              )}
            </div>
            <div className="ml-4 flex-1">
              <div className={`text-sm font-semibold ${
                currentStep >= step.number ? 'text-blue-600' : 'text-gray-400'
              }`}>
                {step.title}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {step.description}
              </div>
            </div>
          </div>
          {index < steps.length - 1 && (
            <div className={`h-0.5 mt-6 ${
              currentStep > step.number ? 'bg-blue-600' : 'bg-gray-300'
            }`} />
          )}
        </div>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-8">
      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Course Title *
            </label>
            <input
              type="text"
              value={courseData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter an engaging course title"
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.title}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Course Subtitle
            </label>
            <input
              type="text"
              value={courseData.subtitle}
              onChange={(e) => handleInputChange('subtitle', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Brief description of what students will learn"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Category *
              </label>
              <select
                value={courseData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.category ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select Category</option>
                {Object.keys(categories).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              {errors.category && (
                <p className="text-red-500 text-sm mt-1">{errors.category}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Subcategory
              </label>
              <select
                value={courseData.subcategory}
                onChange={(e) => handleInputChange('subcategory', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                disabled={!courseData.category}
              >
                <option value="">Select Subcategory</option>
                {courseData.category && categories[courseData.category]?.map(subcat => (
                  <option key={subcat} value={subcat}>{subcat}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Level *
              </label>
              <div className="space-y-2">
                {levels.map(level => (
                  <label key={level.value} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="level"
                      value={level.value}
                      checked={courseData.level === level.value}
                      onChange={(e) => handleInputChange('level', e.target.value)}
                      className="mr-3"
                    />
                    <div>
                      <div className="font-medium">{level.label}</div>
                      <div className="text-sm text-gray-500">{level.description}</div>
                    </div>
                  </label>
                ))}
              </div>
              {errors.level && (
                <p className="text-red-500 text-sm mt-1">{errors.level}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Language *
              </label>
              <select
                value={courseData.language}
                onChange={(e) => handleInputChange('language', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.language ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select Language</option>
                {languages.map(lang => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
              {errors.language && (
                <p className="text-red-500 text-sm mt-1">{errors.language}</p>
              )}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Course Thumbnail *
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
            {courseData.thumbnail ? (
              <div className="relative">
                <img 
                  src={courseData.thumbnail} 
                  alt="Course thumbnail" 
                  className="w-full h-48 object-cover rounded-lg"
                />
                <button
                  onClick={() => setCourseData(prev => ({ ...prev, thumbnail: null }))}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <Image className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <div className="mb-4">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Upload Thumbnail
                  </button>
                  <input 
                    ref={fileInputRef}
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </div>
                <p className="text-sm text-gray-500">
                  Recommended: 1280x720 pixels (16:9 ratio)<br />
                  Formats: JPG, PNG, WEBP (max 5MB)
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Course Description *
        </label>
        <textarea
          value={courseData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          rows={6}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
            errors.description ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Describe what students will learn in this course. Include key topics, skills they'll develop, and any unique aspects of your teaching approach..."
        />
        {errors.description && (
          <p className="text-red-500 text-sm mt-1">{errors.description}</p>
        )}
        <p className="text-sm text-gray-500 mt-2">
          {courseData.description.length}/2000 characters
        </p>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-8">
      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              What will students learn? *
            </label>
            <div className="space-y-3">
              {courseData.learningOutcomes.map((outcome, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-1">
                    <span className="text-blue-600 text-sm font-medium">{index + 1}</span>
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={outcome}
                      onChange={(e) => handleArrayChange('learningOutcomes', index, e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="e.g., Build responsive websites with React and modern CSS"
                    />
                  </div>
                  {courseData.learningOutcomes.length > 1 && (
                    <button
                      onClick={() => removeArrayItem('learningOutcomes', index)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {errors.learningOutcomes && (
              <p className="text-red-500 text-sm mt-1">{errors.learningOutcomes}</p>
            )}
            <button
              onClick={() => addArrayItem('learningOutcomes')}
              className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1 mt-3"
            >
              <Plus className="w-4 h-4" /> Add learning outcome
            </button>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Course Requirements
            </label>
            <div className="space-y-3">
              {courseData.requirements.map((requirement, index) => (
                <div key={index} className="flex items-center gap-3">
                  <input
                    type="text"
                    value={requirement}
                    onChange={(e) => handleArrayChange('requirements', index, e.target.value)}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="e.g., Basic knowledge of HTML and CSS"
                  />
                  {courseData.requirements.length > 1 && (
                    <button
                      onClick={() => removeArrayItem('requirements', index)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              onClick={() => addArrayItem('requirements')}
              className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1 mt-3"
            >
              <Plus className="w-4 h-4" /> Add requirement
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Target Audience
            </label>
            <div className="space-y-3">
              {courseData.targetAudience.map((audience, index) => (
                <div key={index} className="flex items-center gap-3">
                  <input
                    type="text"
                    value={audience}
                    onChange={(e) => handleArrayChange('targetAudience', index, e.target.value)}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="e.g., Web developers looking to learn React"
                  />
                  {courseData.targetAudience.length > 1 && (
                    <button
                      onClick={() => removeArrayItem('targetAudience', index)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              onClick={() => addArrayItem('targetAudience')}
              className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1 mt-3"
            >
              <Plus className="w-4 h-4" /> Add target audience
            </button>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Course Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {courseData.tags.map(tag => (
                <span
                  key={tag}
                  className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-1"
                >
                  {tag}
                  <button onClick={() => removeTag(tag)}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <input
              type="text"
              placeholder="Type a tag and press Enter"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addTag(e.target.value.trim());
                  e.target.value = '';
                }
              }}
            />
            <p className="text-sm text-gray-500 mt-2">
              {courseData.tags.length}/10 tags
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">📚 Build Your Course Curriculum</h3>
            <p className="text-gray-700 text-lg mb-3">
              Organize your course into sections and lessons. Think of sections as chapters and lessons as individual topics.
            </p>
            <div className="bg-white p-4 rounded-lg border border-blue-100">
              <h4 className="font-semibold text-blue-900 mb-2">💡 Quick Tips:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Start with 3-5 sections for a well-structured course</li>
                <li>• Each section should have 3-8 lessons</li>
                <li>• Keep lessons between 5-20 minutes for better engagement</li>
                <li>• Mark 1-2 lessons as "Free Preview" to attract students</li>
              </ul>
            </div>
          </div>
          <button
            onClick={addSection}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium shadow-md"
          >
            <Plus className="w-5 h-5" /> Add New Section
          </button>
        </div>
      </div>

      {/* Course Sections */}
      <div className="space-y-6">
        {courseData.curriculum.map((section, sectionIndex) => (
          <div key={section.id} className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
            
            {/* Section Header */}
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center font-bold">
                  {sectionIndex + 1}
                </div>
                <h4 className="text-lg font-semibold text-gray-900">
                  Section {sectionIndex + 1}
                </h4>
              </div>
              {courseData.curriculum.length > 1 && (
                <button
                  onClick={() => removeSection(sectionIndex)}
                  className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete this section"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Section Details */}
            <div className="grid lg:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  📝 Section Title *
                </label>
                <input
                  type="text"
                  value={section.title}
                  onChange={(e) => updateSectionField(sectionIndex, 'title', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-medium"
                  placeholder={`e.g., "Getting Started with ${courseData.title || 'Your Topic'}"`}
                />
                <p className="text-xs text-gray-500 mt-1">Give your section a clear, descriptive name</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  📄 Section Description
                </label>
                <textarea
                  value={section.description}
                  onChange={(e) => updateSectionField(sectionIndex, 'description', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="e.g., 'In this section, you'll learn the fundamentals and set up your environment...'"
                />
                <p className="text-xs text-gray-500 mt-1">Briefly explain what students will learn in this section</p>
              </div>
            </div>

            {/* Lessons */}
            <div className="border-t pt-6">
              <div className="flex items-center gap-2 mb-4">
                <h5 className="text-md font-semibold text-gray-800">🎯 Lessons</h5>
                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                  {section.lessons.length} lesson{section.lessons.length !== 1 ? 's' : ''}
                </span>
              </div>
              
              <div className="space-y-4">
                {section.lessons.map((lesson, lessonIndex) => (
                  <div key={lesson.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                    
                    {/* Lesson Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="bg-gray-200 text-gray-600 w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium">
                          {lessonIndex + 1}
                        </div>
                        <span className="font-medium text-gray-700">Lesson {lessonIndex + 1}</span>
                      </div>
                      {section.lessons.length > 1 && (
                        <button
                          onClick={() => removeLesson(sectionIndex, lessonIndex)}
                          className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded transition-colors"
                          title="Delete this lesson"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Lesson Details Grid */}
                    <div className="grid lg:grid-cols-12 gap-4 mb-4">
                      <div className="lg:col-span-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          📹 Lesson Title *
                        </label>
                        <input
                          type="text"
                          value={lesson.title}
                          onChange={(e) => updateLessonField(sectionIndex, lessonIndex, 'title', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="e.g., 'What is JavaScript?'"
                        />
                      </div>
                      
                      <div className="lg:col-span-3">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          🎬 Content Type
                        </label>
                        <select
                          value={lesson.type}
                          onChange={(e) => updateLessonField(sectionIndex, lessonIndex, 'type', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        >
                          {lessonTypes.map(type => (
                            <option key={type.value} value={type.value}>{type.label}</option>
                          ))}
                        </select>
                      </div>

                      <div className="lg:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          ⏱️ Duration
                        </label>
                        <input
                          type="text"
                          value={lesson.duration}
                          onChange={(e) => updateLessonField(sectionIndex, lessonIndex, 'duration', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="10 min"
                        />
                        <p className="text-xs text-gray-500 mt-1">e.g., "5 min", "15 min"</p>
                      </div>

                      <div className="lg:col-span-3">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          👀 Preview Settings
                        </label>
                        <label className="flex items-center bg-white p-2 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={lesson.isPreview}
                            onChange={(e) => updateLessonField(sectionIndex, lessonIndex, 'isPreview', e.target.checked)}
                            className="mr-2 text-blue-600"
                          />
                          <span className="text-sm text-gray-700">
                            {lesson.isPreview ? '✅ Free Preview' : '🔒 Paid Content'}
                          </span>
                        </label>
                        <p className="text-xs text-gray-500 mt-1">Let students preview this lesson for free</p>
                      </div>
                    </div>
                    
                    {/* Lesson Description */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        📝 Lesson Description
                      </label>
                      <textarea
                        value={lesson.description}
                        onChange={(e) => updateLessonField(sectionIndex, lessonIndex, 'description', e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="e.g., 'Students will learn the basics of variables, functions, and how to write their first JavaScript program...'"
                      />
                      <p className="text-xs text-gray-500 mt-1">Explain what students will learn and accomplish in this lesson</p>
                    </div>

                    <div className="flex space-x-4 pt-2">
                      <button
                        onClick={() => uploadLesson(sectionIndex, lessonIndex)}
                        className="bg-green-600 text-white hover:bg-green-700 px-4 py-2 rounded-lg text-sm flex items-center gap-2 border border-green-600 transition-colors"
                      >
                        <Upload className="w-4 h-4" />
                        Upload Lesson
                      </button>
                    </div>
                  </div>
                ))}
                
                {/* Add Lesson Button */}
                <div className="flex space-x-4 pt-2">
                  <button
                    onClick={() => addLesson(sectionIndex)}
                    className="bg-blue-50 text-blue-700 hover:bg-blue-100 px-4 py-2 rounded-lg text-sm flex items-center gap-2 border border-blue-200 transition-colors"
                  >
                    <Plus className="w-4 h-4" /> Add New Lesson
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Course Statistics */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
        <h4 className="font-bold text-blue-900 mb-4 text-lg">📊 Your Course at a Glance</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-2xl font-bold text-blue-600">{courseData.curriculum.length}</span>
            </div>
            <p className="text-sm text-gray-600">Sections</p>
          </div>
          <div className="text-center">
            <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-2xl font-bold text-green-600">
                {courseData.curriculum.reduce((acc, section) => acc + section.lessons.length, 0)}
              </span>
            </div>
            <p className="text-sm text-gray-600">Total Lessons</p>
          </div>
          <div className="text-center">
            <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-2xl font-bold text-purple-600">
                {courseData.curriculum.reduce((acc, section) => 
                  acc + section.lessons.filter(l => l.isPreview).length, 0
                )}
              </span>
            </div>
            <p className="text-sm text-gray-600">Free Previews</p>
          </div>
          <div className="text-center">
            <div className="bg-orange-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-2xl font-bold text-orange-600">
                {courseData.curriculum.reduce((acc, section) => 
                  acc + section.lessons.filter(l => l.duration && l.duration.trim() !== '').length, 0
                )}
              </span>
            </div>
            <p className="text-sm text-gray-600">Timed Lessons</p>
          </div>
        </div>
        
        {/* Progress Indicator */}
        <div className="mt-6 p-4 bg-white rounded-lg border border-blue-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Course Structure Progress</span>
            <span className="text-sm text-blue-600">
              {courseData.curriculum.length >= 3 ? '✅ Good structure!' : '⚠️ Add more sections'}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${Math.min((courseData.curriculum.length / 3) * 100, 100)}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Recommended: 3-5 sections with 3-8 lessons each
          </p>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-8">
      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Pricing
            </h4>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Course Price *
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="number"
                      value={courseData.price}
                      onChange={(e) => handleInputChange('price', e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        errors.price ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  {errors.price && (
                    <p className="text-red-500 text-sm mt-1">{errors.price}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Compare Price
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="number"
                      value={courseData.comparePrice}
                      onChange={(e) => handleInputChange('comparePrice', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Show original price for discounts</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course Duration *
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={courseData.duration}
                    onChange={(e) => handleInputChange('duration', e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.duration ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="e.g., 4 weeks, 20 hours, Self-paced"
                  />
                </div>
                {errors.duration && (
                  <p className="text-red-500 text-sm mt-1">{errors.duration}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Students
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    value={courseData.maxStudents}
                    onChange={(e) => handleInputChange('maxStudents', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Unlimited"
                    min="1"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Leave empty for unlimited enrollment</p>
              </div>

              <div>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={courseData.certification}
                    onChange={(e) => handleInputChange('certification', e.target.checked)}
                    className="h-4 w-4 text-blue-600"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Provide Certificate of Completion
                  </span>
                </label>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Publication Settings
            </h4>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course Status
                </label>
                <select
                  value={courseData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="draft">Draft - Not visible to students</option>
                  <option value="published">Published - Live and enrollable</option>
                  <option value="private">Private - Only accessible via link</option>
                  <option value="coming_soon">Coming Soon - Visible but not enrollable</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course URL Slug
                </label>
                <input
                  type="text"
                  value={courseData.seo.slug}
                  onChange={(e) => handleNestedInputChange('seo', 'slug', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="my-awesome-course"
                />
                <p className="text-xs text-gray-500 mt-1">
                  learnconnect.com/courses/<strong>{courseData.seo.slug || 'course-slug'}</strong>
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Course Summary
            </h4>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="text-blue-600 font-medium">Title</div>
                  <div className="text-gray-900">{courseData.title || 'Not set'}</div>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="text-green-600 font-medium">Category</div>
                  <div className="text-gray-900">{courseData.category || 'Not set'}</div>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <div className="text-purple-600 font-medium">Level</div>
                  <div className="text-gray-900">{courseData.level || 'Not set'}</div>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg">
                  <div className="text-orange-600 font-medium">Price</div>
                  <div className="text-gray-900">
                    {courseData.price ? `$${courseData.price}` : 'Not set'}
                  </div>
                </div>
                <div className="p-3 bg-indigo-50 rounded-lg">
                  <div className="text-indigo-600 font-medium">Sections</div>
                  <div className="text-gray-900">{courseData.curriculum.length}</div>
                </div>
                <div className="p-3 bg-pink-50 rounded-lg">
                  <div className="text-pink-600 font-medium">Lessons</div>
                  <div className="text-gray-900">
                    {courseData.curriculum.reduce((acc, section) => acc + section.lessons.length, 0)}
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h5 className="font-medium text-gray-900 mb-2">Learning Outcomes</h5>
                <ul className="space-y-1">
                  {courseData.learningOutcomes.filter(o => o.trim()).slice(0, 3).map((outcome, index) => (
                    <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      {outcome}
                    </li>
                  ))}
                  {courseData.learningOutcomes.filter(o => o.trim()).length > 3 && (
                    <li className="text-sm text-gray-500">
                      +{courseData.learningOutcomes.filter(o => o.trim()).length - 3} more outcomes
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              Ready to Launch?
            </h4>
            <p className="text-sm text-gray-600 mb-4">
              Your course is {currentStep === 4 ? 'ready' : 'almost ready'} to be published! 
              Students will be able to discover and enroll in your course once it's live.
            </p>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-gray-600">All required fields completed</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      default: return renderStep1();
    }
  };

  return (
    <>
      <NavBar />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Header */}
        <div className="bg-blue-600 shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white">Create New Course</h1>
              <p className="text-blue-200 mt-2">Share your expertise and help students learn new skills</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setPreviewMode(!previewMode)}
                className="flex items-center gap-2 px-4 py-2 border border-blue-300 rounded-lg hover:bg-blue-500 hover:border-blue-400 transition-colors text-white"
              >
                {previewMode ? <EyeOff className="w-4 h-4 text-white" /> : <Eye className="w-4 h-4 text-white" />}
                {previewMode ? 'Exit Preview' : 'Preview'}
              </button>
              <button
                onClick={saveProgress}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Save className="w-4 h-4" />
                {savedProgress ? 'Saved!' : 'Save Progress'}
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {renderProgressBar()}
          {renderStepIndicator()}

          <div className="bg-white rounded-xl shadow-lg border p-8">
            {renderCurrentStep()}

            {/* Navigation */}
            <div className="flex justify-between items-center mt-12 pt-8 border-t border-gray-200">
              <button
                onClick={prevStep}
                disabled={currentStep === 1}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                  currentStep === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:shadow-md'
                }`}
              >
                Previous
              </button>

              <div className="flex items-center gap-4">
                <button 
                  onClick={saveProgress}
                  className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all"
                >
                  <Save className="w-4 h-4" />
                  Save as Draft
                </button>
                
                {currentStep === 4 ? (
                  <button className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 font-medium shadow-lg hover:shadow-xl transition-all">
                    <Globe className="w-4 h-4" />
                    Publish Course
                  </button>
                ) : (
                  <button
                    onClick={nextStep}
                    className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:from-blue-700 hover:to-blue-300 font-medium shadow-lg hover:shadow-xl transition-all"
                  >
                    Next Step
                    <span className="ml-2">→</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CreateCoursePage;