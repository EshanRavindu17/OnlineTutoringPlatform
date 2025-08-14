import React, { useState, useEffect, ChangeEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { X, Save } from 'lucide-react';
import NavBar from '../components/Navbar';
import Footer from '../components/Footer';

interface Lesson {
  id: number;
  title: string;
  description: string;
  type: 'video' | 'text' | 'quiz' | 'assignment';
  duration: string;
  file?: File | null;
  content?: string;
  isCompleted: boolean;
}

interface Section {
  id: number;
  title: string;
  description: string;
  lessons: Lesson[];
}

interface CourseData {
  title: string;
  subtitle: string;
  description: string;
  category: string;
  subcategory: string;
  level: string;
  language: string;
  price: string;
  comparePrice: string;
  duration: string;
  maxStudents: string;
  tags: string[];
  requirements: string[];
  learningOutcomes: string[];
  targetAudience: string[];
  thumbnail: File | null;
  previewVideo: File | null;
  status: 'draft' | 'published';
  certification: boolean;
  curriculum: Section[];
}

interface ValidationErrors {
  [key: string]: string;
}

const CreateCoursePage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [savedProgress, setSavedProgress] = useState<boolean>(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.fromUpload) {
      setCurrentStep(location.state.step || 3);
    }
  }, [location]);

  const [courseData, setCourseData] = useState<CourseData>({
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
          description: '', 
          type: 'video', 
          duration: '', 
          file: null, 
          isCompleted: false 
        }]
      }
    ]
  });

  const [newTag, setNewTag] = useState<string>('');
  
  const categories = [
    'Programming', 'Design', 'Business', 'Marketing', 'Data Science',
    'Music', 'Health', 'Photography', 'Language', 'Personal Development'
  ];

  const subcategories: { [key: string]: string[] } = {
    'Programming': ['Web Development', 'Mobile Development', 'Data Structures', 'Algorithms'],
    'Design': ['UI/UX Design', 'Graphic Design', 'Web Design', 'Product Design'],
    'Business': ['Entrepreneurship', 'Management', 'Finance', 'Strategy'],
    'Marketing': ['Digital Marketing', 'Content Marketing', 'SEO', 'Social Media'],
    'Data Science': ['Machine Learning', 'Data Analysis', 'Statistics', 'Python'],
    'Music': ['Piano', 'Guitar', 'Singing', 'Music Theory'],
    'Health': ['Fitness', 'Nutrition', 'Mental Health', 'Yoga'],
    'Photography': ['Portrait', 'Landscape', 'Photo Editing', 'Commercial'],
    'Language': ['English', 'Spanish', 'French', 'Mandarin'],
    'Personal Development': ['Leadership', 'Communication', 'Productivity', 'Mindfulness']
  };

  const validateStep = (step: number): boolean => {
    const newErrors: ValidationErrors = {};
    
    switch (step) {
      case 1:
        if (!courseData.title.trim()) newErrors.title = 'Course title is required';
        if (!courseData.subtitle.trim()) newErrors.subtitle = 'Course subtitle is required';
        if (!courseData.description.trim()) newErrors.description = 'Course description is required';
        if (!courseData.category) newErrors.category = 'Category is required';
        if (!courseData.level) newErrors.level = 'Level is required';
        break;
      case 2:
        if (!courseData.price.trim()) newErrors.price = 'Price is required';
        if (!courseData.duration.trim()) newErrors.duration = 'Duration is required';
        if (courseData.requirements.filter(req => req.trim()).length === 0) {
          newErrors.requirements = 'At least one requirement is needed';
        }
        break;
      case 3:
        if (!courseData.thumbnail) newErrors.thumbnail = 'Course thumbnail is required';
        break;
      case 4:
        const hasContent = courseData.curriculum.some(section => 
          section.lessons.some(lesson => lesson.title.trim())
        );
        if (!hasContent) newErrors.curriculum = 'At least one lesson is required';
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof CourseData, value: any): void => {
    setCourseData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleTagAdd = (): void => {
    if (newTag.trim() && !courseData.tags.includes(newTag.trim())) {
      handleInputChange('tags', [...courseData.tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string): void => {
    handleInputChange('tags', courseData.tags.filter(tag => tag !== tagToRemove));
  };

  const nextStep = (): void => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 5));
    }
  };

  const prevStep = (): void => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const saveDraft = async (): Promise<void> => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSavedProgress(true);
      setTimeout(() => setSavedProgress(false), 3000);
    } catch (error) {
      console.error('Error saving draft:', error);
    }
  };

  const handleSubmit = async (status: 'draft' | 'published'): Promise<void> => {
    if (!validateStep(currentStep)) return;
    
    try {
      const formData = new FormData();
      formData.append('courseData', JSON.stringify({ ...courseData, status }));
      
      if (courseData.thumbnail) {
        formData.append('thumbnail', courseData.thumbnail);
      }
      
      if (courseData.previewVideo) {
        formData.append('previewVideo', courseData.previewVideo);
      }

      // Add lesson files
      courseData.curriculum.forEach((section, sectionIndex) => {
        section.lessons.forEach((lesson, lessonIndex) => {
          if (lesson.file) {
            formData.append(`lesson_${sectionIndex}_${lessonIndex}`, lesson.file);
          }
        });
      });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log(`Course ${status} successfully!`);
      navigate('/mycourses');
    } catch (error) {
      console.error(`Error ${status === 'draft' ? 'saving' : 'publishing'} course:`, error);
    }
  };

  const renderStepIndicator = (): React.ReactElement => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3, 4, 5].map((step) => (
        <div key={step} className="flex items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step <= currentStep
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-600'
            }`}
          >
            {step}
          </div>
          {step < 5 && (
            <div
              className={`w-16 h-1 mx-2 ${
                step < currentStep ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );

  const renderBasicInfo = (): React.ReactElement => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Course Title *
        </label>
        <input
          type="text"
          value={courseData.title}
          onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('title', e.target.value)}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.title ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Enter your course title"
          maxLength={60}
        />
        {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
        <p className="text-gray-500 text-sm mt-1">{courseData.title.length}/60 characters</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Course Subtitle *
        </label>
        <input
          type="text"
          value={courseData.subtitle}
          onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('subtitle', e.target.value)}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.subtitle ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Enter your course subtitle"
          maxLength={120}
        />
        {errors.subtitle && <p className="text-red-500 text-sm mt-1">{errors.subtitle}</p>}
        <p className="text-gray-500 text-sm mt-1">{courseData.subtitle.length}/120 characters</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Course Description *
        </label>
        <textarea
          value={courseData.description}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) => handleInputChange('description', e.target.value)}
          rows={6}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.description ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Describe what students will learn in this course"
          maxLength={1000}
        />
        {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
        <p className="text-gray-500 text-sm mt-1">{courseData.description.length}/1000 characters</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category *
          </label>
          <select
            value={courseData.category}
            onChange={(e: ChangeEvent<HTMLSelectElement>) => handleInputChange('category', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.category ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select a category</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Subcategory
          </label>
          <select
            value={courseData.subcategory}
            onChange={(e: ChangeEvent<HTMLSelectElement>) => handleInputChange('subcategory', e.target.value)}
            disabled={!courseData.category}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
          >
            <option value="">Select a subcategory</option>
            {courseData.category && subcategories[courseData.category]?.map(sub => (
              <option key={sub} value={sub}>{sub}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Level *
          </label>
          <select
            value={courseData.level}
            onChange={(e: ChangeEvent<HTMLSelectElement>) => handleInputChange('level', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.level ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select level</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
            <option value="All Levels">All Levels</option>
          </select>
          {errors.level && <p className="text-red-500 text-sm mt-1">{errors.level}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Language
          </label>
          <select
            value={courseData.language}
            onChange={(e: ChangeEvent<HTMLSelectElement>) => handleInputChange('language', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select language</option>
            <option value="English">English</option>
            <option value="Spanish">Spanish</option>
            <option value="French">French</option>
            <option value="German">German</option>
            <option value="Chinese">Chinese</option>
            <option value="Japanese">Japanese</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tags
        </label>
        <div className="flex flex-wrap gap-2 mb-3">
          {courseData.tags.map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="ml-2 text-blue-600 hover:text-blue-800"
              >
                <X size={14} />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newTag}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setNewTag(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Add a tag"
            onKeyPress={(e) => e.key === 'Enter' && handleTagAdd()}
          />
          <button
            type="button"
            onClick={handleTagAdd}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Course</h1>
            <p className="text-gray-600">Share your knowledge with the world</p>
          </div>

          {renderStepIndicator()}

          <div className="mb-8">
            {currentStep === 1 && renderBasicInfo()}
            {/* Add other steps here as needed */}
          </div>

          <div className="flex justify-between items-center pt-6 border-t border-gray-200">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>

            <div className="flex gap-3">
              <button
                onClick={saveDraft}
                className="flex items-center gap-2 px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Save size={18} />
                {savedProgress ? 'Saved!' : 'Save Draft'}
              </button>

              {currentStep === 5 ? (
                <div className="flex gap-3">
                  <button
                    onClick={() => handleSubmit('draft')}
                    className="px-6 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    Save as Draft
                  </button>
                  <button
                    onClick={() => handleSubmit('published')}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Publish Course
                  </button>
                </div>
              ) : (
                <button
                  onClick={nextStep}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Next
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CreateCoursePage;
