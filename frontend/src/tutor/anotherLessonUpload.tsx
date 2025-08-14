import React, { useState, ChangeEvent } from 'react';
import axios from 'axios';
import { 
  X, 
  Plus,
  Trash2,
  Loader,
  FileText,
  HelpCircle,
  ClipboardCheck,
  Save
} from 'lucide-react';
import NavBar from '../components/Navbar';
import Footer from '../components/Footer';

// Interfaces
interface Article {
  title: string;
  content: string;
  category: string;
  difficulty: string;
  estimatedReadTime: string;
  tags: string[];
  isPublic: boolean;
  coverImage: {
    file: File;
    url: string;
  } | null;
  summary: string;
}

interface QuizQuestion {
  id: number;
  type: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  points: number;
}

interface Quiz {
  title: string;
  description: string;
  category: string;
  difficulty: string;
  timeLimit: string;
  passingScore: string;
  questions: QuizQuestion[];
  tags: string[];
  isPublic: boolean;
  allowRetakes: boolean;
  showCorrectAnswers: boolean;
}

interface AssignmentFile {
  id: number;
  file: File;
  name: string;
  size: number;
  url: string;
}

interface Assignment {
  title: string;
  description: string;
  category: string;
  difficulty: string;
  dueDate: string;
  maxScore: string;
  submissionType: 'file' | 'text' | 'both';
  instructions: string;
  attachments: AssignmentFile[];
  tags: string[];
  isPublic: boolean;
  allowLateSubmissions: boolean;
}

interface ContentType {
  value: string;
  label: string;
  icon: React.ComponentType<any>;
}

interface ValidationErrors {
  [key: string]: string;
}

type ContentTypeValue = 'video' | 'article' | 'quiz' | 'assignment';

export default function EnhancedTutorUpload(): React.JSX.Element {
  const [contentType, setContentType] = useState<ContentTypeValue>('video');
  const [newTag, setNewTag] = useState<string>('');
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [isUploading, setIsUploading] = useState<boolean>(false);

  // Article state
  const [article, setArticle] = useState<Article>({
    title: '',
    content: '',
    category: '',
    difficulty: '',
    estimatedReadTime: '',
    tags: [],
    isPublic: true,
    coverImage: null,
    summary: ''
  });

  // Quiz state
  const [quiz, setQuiz] = useState<Quiz>({
    title: '',
    description: '',
    category: '',
    difficulty: '',
    timeLimit: '',
    passingScore: '',
    questions: [],
    tags: [],
    isPublic: true,
    allowRetakes: true,
    showCorrectAnswers: true
  });

  // Assignment state
  const [assignment, setAssignment] = useState<Assignment>({
    title: '',
    description: '',
    category: '',
    difficulty: '',
    dueDate: '',
    maxScore: '',
    submissionType: 'file',
    instructions: '',
    attachments: [],
    tags: [],
    isPublic: true,
    allowLateSubmissions: false
  });

  // Notification state (for future use)
  // const [notification, setNotification] = useState<Notification>({
  //   type: '',
  //   message: '',
  //   isVisible: false
  // });

  const contentTypes: ContentType[] = [
    { value: 'article', label: 'Text Article', icon: FileText },
    { value: 'quiz', label: 'Quiz', icon: HelpCircle },
    { value: 'assignment', label: 'Assignment', icon: ClipboardCheck }
  ];

  const videoCategories: string[] = [
    'Mathematics', 'Science', 'English', 'History', 'Computer Science', 
    'Languages', 'Test Prep', 'Arts', 'Business', 'Engineering'
  ];

  const difficultyLevels: string[] = [
    'Beginner', 'Intermediate', 'Advanced', 'Expert'
  ];

  const showNotification = (type: string, message: string): void => {
    // Simple alert for now - can be enhanced later
    console.log(`${type}: ${message}`);
    alert(message);
  };

  // Article functions
  const handleArticleImageUpload = (e: ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        const imageUrl = URL.createObjectURL(file);
        setArticle(prev => ({ ...prev, coverImage: { file, url: imageUrl } }));
      } else {
        showNotification('error', 'Please select a valid image file');
      }
    }
  };

  const addArticleTag = (): void => {
    if (newTag.trim() && !article.tags.includes(newTag.trim())) {
      setArticle(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeArticleTag = (tagToRemove: string): void => {
    setArticle(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const saveArticle = async (): Promise<void> => {
    const errors: ValidationErrors = {};
    
    if (!article.title.trim()) errors.title = 'Title is required';
    if (!article.content.trim()) errors.content = 'Content is required';
    if (!article.category) errors.category = 'Category is required';
    
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('title', article.title);
      formData.append('content', article.content);
      formData.append('category', article.category);
      formData.append('difficulty', article.difficulty);
      formData.append('estimatedReadTime', article.estimatedReadTime);
      formData.append('summary', article.summary);
      formData.append('isPublic', String(article.isPublic));
      
      if (article.coverImage) {
        formData.append('coverImage', article.coverImage.file);
      }
      
      article.tags.forEach(tag => formData.append('tags[]', tag));

      await axios.post('http://localhost:8000/api/upload-article/', formData);
      showNotification('success', 'Article saved successfully!');
      
      // Reset form
      setArticle({
        title: '',
        content: '',
        category: '',
        difficulty: '',
        estimatedReadTime: '',
        tags: [],
        isPublic: true,
        coverImage: null,
        summary: ''
      });
      setValidationErrors({});
      
    } catch (error) {
      showNotification('error', 'Failed to save article');
    } finally {
      setIsUploading(false);
    }
  };

  // Quiz functions
  const addQuestion = (): void => {
    const newQuestion: QuizQuestion = {
      id: Date.now(),
      type: 'multiple-choice',
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: '',
      points: 1
    };
    setQuiz(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }));
  };

  const updateQuestion = (questionId: number, field: keyof QuizQuestion, value: any): void => {
    setQuiz(prev => ({
      ...prev,
      questions: prev.questions.map(q => 
        q.id === questionId ? { ...q, [field]: value } : q
      )
    }));
  };

  const updateQuestionOption = (questionId: number, optionIndex: number, value: string): void => {
    setQuiz(prev => ({
      ...prev,
      questions: prev.questions.map(q => 
        q.id === questionId 
          ? { ...q, options: q.options.map((opt, idx) => idx === optionIndex ? value : opt) }
          : q
      )
    }));
  };

  const removeQuestion = (questionId: number): void => {
    setQuiz(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== questionId)
    }));
  };

  const addQuizTag = (): void => {
    if (newTag.trim() && !quiz.tags.includes(newTag.trim())) {
      setQuiz(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeQuizTag = (tagToRemove: string): void => {
    setQuiz(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const saveQuiz = async (): Promise<void> => {
    const errors: ValidationErrors = {};
    
    if (!quiz.title.trim()) errors.title = 'Title is required';
    if (!quiz.category) errors.category = 'Category is required';
    if (quiz.questions.length === 0) errors.questions = 'At least one question is required';
    
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setIsUploading(true);
    try {
      await axios.post('http://localhost:8000/api/upload-quiz/', quiz);
      showNotification('success', 'Quiz saved successfully!');
      
      // Reset form
      setQuiz({
        title: '',
        description: '',
        category: '',
        difficulty: '',
        timeLimit: '',
        passingScore: '',
        questions: [],
        tags: [],
        isPublic: true,
        allowRetakes: true,
        showCorrectAnswers: true
      });
      setValidationErrors({});
      
    } catch (error) {
      showNotification('error', 'Failed to save quiz');
    } finally {
      setIsUploading(false);
    }
  };

  // Assignment functions
  const handleAssignmentFileUpload = (e: ChangeEvent<HTMLInputElement>): void => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => file.size <= 10 * 1024 * 1024); // 10MB limit
    
    if (validFiles.length !== files.length) {
      showNotification('error', 'Some files exceed the 10MB limit');
    }
    
    const fileObjects: AssignmentFile[] = validFiles.map(file => ({
      id: Date.now() + Math.random(),
      file,
      name: file.name,
      size: file.size,
      url: URL.createObjectURL(file)
    }));
    
    setAssignment(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...fileObjects]
    }));
  };

  const removeAssignmentFile = (fileId: number): void => {
    setAssignment(prev => ({
      ...prev,
      attachments: prev.attachments.filter(file => file.id !== fileId)
    }));
  };

  const addAssignmentTag = (): void => {
    if (newTag.trim() && !assignment.tags.includes(newTag.trim())) {
      setAssignment(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeAssignmentTag = (tagToRemove: string): void => {
    setAssignment(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const saveAssignment = async (): Promise<void> => {
    const errors: ValidationErrors = {};
    
    if (!assignment.title.trim()) errors.title = 'Title is required';
    if (!assignment.description.trim()) errors.description = 'Description is required';
    if (!assignment.category) errors.category = 'Category is required';
    if (!assignment.dueDate) errors.dueDate = 'Due date is required';
    
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('title', assignment.title);
      formData.append('description', assignment.description);
      formData.append('category', assignment.category);
      formData.append('difficulty', assignment.difficulty);
      formData.append('dueDate', assignment.dueDate);
      formData.append('maxScore', assignment.maxScore);
      formData.append('submissionType', assignment.submissionType);
      formData.append('instructions', assignment.instructions);
      formData.append('isPublic', String(assignment.isPublic));
      formData.append('allowLateSubmissions', String(assignment.allowLateSubmissions));
      
      assignment.attachments.forEach(file => {
        formData.append('attachments', file.file);
      });
      
      assignment.tags.forEach(tag => formData.append('tags[]', tag));

      await axios.post('http://localhost:8000/api/upload-assignment/', formData);
      showNotification('success', 'Assignment saved successfully!');
      
      // Reset form
      setAssignment({
        title: '',
        description: '',
        category: '',
        difficulty: '',
        dueDate: '',
        maxScore: '',
        submissionType: 'file',
        instructions: '',
        attachments: [],
        tags: [],
        isPublic: true,
        allowLateSubmissions: false
      });
      setValidationErrors({});
      
    } catch (error) {
      showNotification('error', 'Failed to save assignment');
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const renderContentTypeSelector = (): React.JSX.Element => (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">Select Content Type</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {contentTypes.map(type => {
          const Icon = type.icon;
          return (
            <button
              key={type.value}
              onClick={() => setContentType(type.value as ContentTypeValue)}
              className={`p-4 rounded-lg border-2 transition-all ${
                contentType === type.value
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Icon className="mx-auto mb-2" size={32} />
              <span className="text-sm font-medium">{type.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );

  const renderArticleUpload = (): React.JSX.Element => (
    <div className="grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <FileText className="mr-2 text-blue-600" size={20} />
            Write Article
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Article Title *
              </label>
              <input
                type="text"
                value={article.title}
                onChange={(e) => setArticle(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter article title"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  validationErrors.title ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {validationErrors.title && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.title}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Summary
              </label>
              <textarea
                value={article.summary}
                onChange={(e) => setArticle(prev => ({ ...prev, summary: e.target.value }))}
                placeholder="Brief summary of the article..."
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cover Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleArticleImageUpload}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {article.coverImage && (
                <div className="mt-2">
                  <img 
                    src={article.coverImage.url} 
                    alt="Cover" 
                    className="w-32 h-20 object-cover rounded-md"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Article Content *
              </label>
              <textarea
                value={article.content}
                onChange={(e) => setArticle(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Write your article content here..."
                rows={12}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  validationErrors.content ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {validationErrors.content && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.content}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="lg:col-span-1">
        <div className="bg-white rounded-lg shadow p-6 sticky top-8">
          <h3 className="text-lg font-semibold mb-4">Article Settings</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                value={article.category}
                onChange={(e) => setArticle(prev => ({ ...prev, category: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  validationErrors.category ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">Select category</option>
                {videoCategories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              {validationErrors.category && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.category}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Difficulty Level
              </label>
              <select
                value={article.difficulty}
                onChange={(e) => setArticle(prev => ({ ...prev, difficulty: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select difficulty</option>
                {difficultyLevels.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estimated Read Time (minutes)
              </label>
              <input
                type="number"
                value={article.estimatedReadTime}
                onChange={(e) => setArticle(prev => ({ ...prev, estimatedReadTime: e.target.value }))}
                placeholder="e.g., 5"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tags
              </label>
              <div className="flex space-x-2 mb-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add a tag"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addArticleTag();
                    }
                  }}
                />
                <button
                  onClick={addArticleTag}
                  className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <Plus size={16} />
                </button>
              </div>
              {article.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {tag}
                      <button
                        onClick={() => removeArticleTag(tag)}
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={article.isPublic}
                  onChange={(e) => setArticle(prev => ({ ...prev, isPublic: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Make this article public
                </span>
              </label>
            </div>

            <button
              onClick={saveArticle}
              disabled={isUploading}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isUploading ? (
                <>
                  <Loader className="animate-spin mr-2" size={16} />
                  SAVING...
                </>
              ) : (
                <>
                  <Save className="mr-2" size={16} />
                  SAVE ARTICLE
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderQuizUpload = (): React.JSX.Element => (
    <div className="grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <HelpCircle className="mr-2 text-blue-600" size={20} />
            Create Quiz
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quiz Title *
              </label>
              <input
                type="text"
                value={quiz.title}
                onChange={(e) => setQuiz(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter quiz title"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  validationErrors.title ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {validationErrors.title && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.title}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={quiz.description}
                onChange={(e) => setQuiz(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe what this quiz covers..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time Limit (minutes)
                </label>
                <input
                  type="number"
                  value={quiz.timeLimit}
                  onChange={(e) => setQuiz(prev => ({ ...prev, timeLimit: e.target.value }))}
                  placeholder="e.g., 30"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Passing Score (%)
                </label>
                <input
                  type="number"
                  value={quiz.passingScore}
                  onChange={e => setQuiz(prev => ({ ...prev, passingScore: e.target.value }))}
                  placeholder="e.g., 70"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Category & Difficulty */}
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  value={quiz.category}
                  onChange={e => setQuiz(prev => ({ ...prev, category: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    validationErrors.category ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select category</option>
                  {videoCategories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                {validationErrors.category && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.category}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Difficulty
                </label>
                <select
                  value={quiz.difficulty}
                  onChange={e => setQuiz(prev => ({ ...prev, difficulty: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select level</option>
                  {difficultyLevels.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>

            {/* Tags */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tags
              </label>
              <div className="flex space-x-2 mb-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={e => setNewTag(e.target.value)}
                  onKeyPress={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addQuizTag();
                    }
                  }}
                  placeholder="Add a tag"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={addQuizTag}
                  className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <Plus size={16} />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {quiz.tags.map(tag => (
                  <span key={tag} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs flex items-center">
                    {tag}
                    <button onClick={() => removeQuizTag(tag)} className="ml-1">
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Questions List */}
            <div className="mt-6 space-y-4">
              {quiz.questions.map((q, idx) => (
                <div key={q.id} className="border p-4 rounded-lg bg-gray-50">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Question {idx + 1}</span>
                    <button onClick={() => removeQuestion(q.id)} className="text-red-500 hover:text-red-700">
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={q.question}
                    onChange={e => updateQuestion(q.id, 'question', e.target.value)}
                    placeholder="Enter question text"
                    className="w-full px-2 py-1 border border-gray-300 rounded-md mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    {q.options.map((opt, i) => (
                      <input
                        key={i}
                        type="text"
                        value={opt}
                        onChange={e => updateQuestionOption(q.id, i, e.target.value)}
                        placeholder={`Option ${i + 1}`}
                        className="px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-1">
                      <span className="text-sm">Correct:</span>
                      <select
                        value={q.correctAnswer}
                        onChange={e => updateQuestion(q.id, 'correctAnswer', Number(e.target.value))}
                        className="px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {q.options.map((_, i) => (
                          <option key={i} value={i}>{i + 1}</option>
                        ))}
                      </select>
                    </label>
                    <label className="flex items-center gap-1">
                      <span className="text-sm">Points:</span>
                      <input
                        type="number"
                        value={q.points}
                        onChange={e => updateQuestion(q.id, 'points', Number(e.target.value))}
                        className="w-16 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </label>
                  </div>
                </div>
              ))}
              <button
                onClick={addQuestion}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm"
              >
                <Plus size={16} /> Add Question
              </button>
            </div>

            {/* Save Quiz */}
            <button
              onClick={saveQuiz}
              disabled={isUploading}
              className="mt-6 w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center"
            >
              {isUploading ? <Loader className="animate-spin mr-2" size={16} /> : <Save className="mr-2" size={16} />}
              {isUploading ? 'Saving...' : 'Save Quiz'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAssignmentUpload = (): React.JSX.Element => (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Left / center */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <ClipboardCheck className="mr-2 text-blue-600" size={20} />
            Create Assignment
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                value={assignment.title}
                onChange={e => setAssignment(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter assignment title"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  validationErrors.title ? 'border-red-300' : 'border-gray-300'
                }`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                value={assignment.description}
                onChange={e => setAssignment(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the assignment..."
                rows={4}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  validationErrors.description ? 'border-red-300' : 'border-gray-300'
                }`}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Due Date *
                </label>
                <input
                  type="date"
                  value={assignment.dueDate}
                  onChange={e => setAssignment(prev => ({ ...prev, dueDate: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    validationErrors.dueDate ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Score
                </label>
                <input
                  type="number"
                  value={assignment.maxScore}
                  onChange={e => setAssignment(prev => ({ ...prev, maxScore: e.target.value }))}
                  placeholder="e.g., 100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Submission Type
              </label>
              <select
                value={assignment.submissionType}
                onChange={e => setAssignment(prev => ({ ...prev, submissionType: e.target.value as 'file' | 'text' | 'both' }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="file">File Upload</option>
                <option value="text">Text Entry</option>
                <option value="both">Both</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Instructions
              </label>
              <textarea
                value={assignment.instructions}
                onChange={e => setAssignment(prev => ({ ...prev, instructions: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Any specific instructions..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Attachments
              </label>
              <input
                type="file"
                multiple
                onChange={handleAssignmentFileUpload}
                className="w-full"
              />
              {assignment.attachments.map(f => (
                <div key={f.id} className="flex items-center justify-between mt-2 bg-gray-100 px-3 py-1 rounded">
                  <span className="text-sm">{f.name} ({formatFileSize(f.size)})</span>
                  <button onClick={() => removeAssignmentFile(f.id)} className="text-red-500">
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-lg shadow p-6 sticky top-8">
          <h3 className="text-lg font-semibold mb-4">Settings & Tags</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                value={assignment.category}
                onChange={e => setAssignment(prev => ({ ...prev, category: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  validationErrors.category ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">Select category</option>
                {videoCategories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Difficulty
              </label>
              <select
                value={assignment.difficulty}
                onChange={e => setAssignment(prev => ({ ...prev, difficulty: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select level</option>
                {difficultyLevels.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tags
              </label>
              <div className="flex space-x-2 mb-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={e => setNewTag(e.target.value)}
                  onKeyPress={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addAssignmentTag();
                    }
                  }}
                  placeholder="Add a tag"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={addAssignmentTag}
                  className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <Plus size={16} />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {assignment.tags.map(tag => (
                  <span key={tag} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs flex items-center">
                    {tag}
                    <button onClick={() => removeAssignmentTag(tag)} className="ml-1">
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={assignment.allowLateSubmissions}
                onChange={e => setAssignment(prev => ({ ...prev, allowLateSubmissions: e.target.checked }))}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
              <label className="ml-2 text-sm text-gray-700">Allow late submissions</label>
            </div>
          </div>
          <button
            onClick={saveAssignment}
            disabled={isUploading}
            className="mt-6 w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center"
          >
            {isUploading ? <Loader className="animate-spin mr-2" size={16} /> : <Save className="mr-2" size={16} />}
            {isUploading ? 'Saving...' : 'Save Assignment'}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <NavBar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        {renderContentTypeSelector()}
        {contentType === 'article' && renderArticleUpload()}
        {contentType === 'quiz' && renderQuizUpload()}
        {contentType === 'assignment' && renderAssignmentUpload()}
      </div>
      <Footer/>
    </>
  );
}
