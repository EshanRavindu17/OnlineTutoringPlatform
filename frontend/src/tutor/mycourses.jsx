import React, { useState, useMemo, useEffect } from 'react';
import {
  Calendar,
  Play,
  Eye,
  Download,
  Search,
  Clock,
  BookOpen,
  Users
} from 'lucide-react';
import axios from 'axios';
import NavBar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';

const TutorVideosPage = () => {
  const [videos, setVideos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc');
  const [viewMode, setViewMode] = useState('grid');

  // Fetch the current tutor's videos once
  useEffect(() => {
    axios.get('http://localhost:8000/api/videos/686242b9a59b76567df790a4')
      .then(({ data }) => setVideos(data))
      .catch(err => console.error('Failed to load videos:', err));
  }, []);

  // Build unique subject list
  const subjects = useMemo(() => {
    const uniq = Array.from(new Set(videos.map(v => v.subject)));
    return uniq.sort();
  }, [videos]);

  // Option lists with keys
  const subjectOptions = useMemo(() => [
    { value: 'all',   label: 'All Subjects' },
    ...subjects.map(subj => ({ value: subj, label: subj }))
  ], [subjects]);

  const statusOptions = [
    { value: 'all',       label: 'All Status'  },
    { value: 'published', label: 'Published'   },
    { value: 'draft',     label: 'Draft'       }
  ];

  const sortOptions = [
    { value: 'date-desc',  label: 'Newest First' },
    { value: 'date-asc',   label: 'Oldest First' },
    { value: 'views-desc', label: 'Most Views'   },
    { value: 'title-asc',  label: 'Title A-Z'     }
  ];

  // Filter & sort
  const filteredAndSorted = useMemo(() => {
    let arr = videos.filter(video => {
      const textMatch = video.title.toLowerCase().includes(searchTerm.toLowerCase())
        || video.subject.toLowerCase().includes(searchTerm.toLowerCase());
      const subjectMatch = selectedSubject === 'all' || video.subject === selectedSubject;
      const statusMatch = selectedStatus === 'all' || video.status === selectedStatus;
      return textMatch && subjectMatch && statusMatch;
    });

    arr.sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':  return new Date(b.uploadDate) - new Date(a.uploadDate);
        case 'date-asc':   return new Date(a.uploadDate) - new Date(b.uploadDate);
        case 'views-desc': return b.views - a.views;
        case 'title-asc':  return a.title.localeCompare(b.title);
        default: return 0;
      }
    });

    return arr;
  }, [videos, searchTerm, selectedSubject, selectedStatus, sortBy]);

  const formatDate = dateStr =>
    new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });

  const VideoCard = ({ video }) => (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-4">
      <div className="relative">
        <img src={video.thumbnail} alt={video.title}
             className="w-full h-48 object-cover rounded" />
        <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 text-xs rounded">
          {video.duration}
        </div>
        <span className={
          `absolute top-2 left-2 text-xs font-medium px-2 py-1 rounded-full ${
            video.status === 'published'
              ? 'bg-green-100 text-green-800'
              : 'bg-yellow-100 text-yellow-800'
          }`
        }>
          {video.status}
        </span>
      </div>
      <h3 className="font-semibold text-gray-900 mt-2 line-clamp-2">{video.title}</h3>
      <p className="text-sm text-gray-600">{video.subject}</p>
      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span className="flex items-center">
          <Calendar className="w-4 h-4 mr-1" /> {formatDate(video.uploadDate)}
        </span>
        <span className="flex items-center">
          <Eye className="w-4 h-4 mr-1" /> {video.views} views
        </span>
      </div>
      <div className="flex justify-between items-center mt-2">
        <span className="flex items-center text-xs text-gray-600">
          <Users className="w-4 h-4 mr-1" /> {video.students} students
        </span>
        <div className="flex space-x-2">
          <button className="p-2 hover:bg-gray-100 rounded-full"><Play className="w-4 h-4 text-blue-600" /></button>
          <button className="p-2 hover:bg-gray-100 rounded-full"><Download className="w-4 h-4 text-gray-600" /></button>
        </div>
      </div>
    </div>
  );

  const VideoRow = ({ video }) => (
    <div className="bg-white border rounded-lg p-4 flex items-center hover:shadow-sm transition">
      <img src={video.thumbnail} alt={video.title}
           className="w-24 h-16 object-cover rounded mr-4" />
      <div className="flex-1">
        <h3 className="font-semibold text-gray-900 truncate">{video.title}</h3>
        <p className="text-sm text-gray-600">{video.subject}</p>
      </div>
      <div className="flex items-center space-x-6 text-xs text-gray-500">
        <span className="flex items-center"><Calendar className="w-4 h-4 mr-1" />{formatDate(video.uploadDate)}</span>
        <span className="flex items-center"><Clock className="w-4 h-4 mr-1" />{video.duration}</span>
        <span className="flex items-center"><Eye className="w-4 h-4 mr-1" />{video.views}</span>
        <span className="flex items-center"><Users className="w-4 h-4 mr-1" />{video.students}</span>
      </div>
      <span className={
        `ml-4 px-2 py-1 text-xs font-medium rounded-full ${
          video.status === 'published'
            ? 'bg-green-100 text-green-800'
            : 'bg-yellow-100 text-yellow-800'
        }`
      }>
        {video.status}
      </span>
      <button className="ml-2 p-2 hover:bg-gray-100 rounded-full"><Play className="w-4 h-4 text-blue-600" /></button>
    </div>
  );

  return (
    <>
    <NavBar />
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-600 shadow-sm border-b">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
    <h1 className="text-3xl font-bold text-white">My Courses</h1>
    <p className="text-blue-200 mt-2">
      Manage and view all your uploaded Courses
    </p>
  </div>
</header>


      {/* Filters */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="bg-white rounded-lg shadow p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search videos..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-wrap items-center space-x-4">
            <select
              value={selectedSubject}
              onChange={e => setSelectedSubject(e.target.value)}
              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {subjectOptions.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {statusOptions.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {sortOptions.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            <div className="flex border rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 ${viewMode==='grid'? 'bg-blue-500 text-white' : 'text-gray-600 '} rounded-l-lg`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 ${viewMode==='list'? 'bg-blue-500 text-white' : 'text-gray-600 '} rounded-r-lg`}
              >
                List
              </button>
            </div>
          </div>
        </div>

        {/* Summary */}
        <p className="mt-4 text-gray-600">
          Showing {filteredAndSorted.length} of {videos.length} videos
        </p>

        {/* Videos */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {filteredAndSorted.map(video => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        ) : (
          <div className="space-y-4 mt-6">
            {filteredAndSorted.map(video => (
              <VideoRow key={video.id} video={video} />
            ))}
          </div>
        )}

        {/* Empty */}
        {filteredAndSorted.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No videos found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search or upload your first video.
            </p>
          </div>
        )}
      </div>
    </div>
    <Footer/>
    </>
  );
};

export default TutorVideosPage;
