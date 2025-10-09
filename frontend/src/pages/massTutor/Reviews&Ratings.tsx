import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, Users, TrendingUp, Calendar, User } from 'lucide-react';
import { massTutorAPI } from '../../api/massTutorAPI';
import toast from 'react-hot-toast';

interface Review {
  r_id: string;
  rating: number | null;
  review: string | null;
  created_at: string;
  studentName: string;
  studentPhoto: string | null;
}

interface ClassReviews {
  class_id: string;
  className: string;
  subject: string;
  reviewCount: number;
  averageRating: number;
  reviews: Review[];
}

interface ReviewsData {
  totalReviews: number;
  averageRating: number;
  classesByRating: ClassReviews[];
}

export default function ReviewsRatingsPage() {
  const [reviewsData, setReviewsData] = useState<ReviewsData>({
    totalReviews: 0,
    averageRating: 0,
    classesByRating: [],
  });
  const [loading, setLoading] = useState(true);
  const [expandedClass, setExpandedClass] = useState<string | null>(null);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await massTutorAPI.getReviews();
      setReviewsData(response);
    } catch (error: any) {
      console.error('Failed to fetch reviews:', error);
      toast.error(error.response?.data?.error || 'Failed to load reviews data');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl">
            <Star className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
              Reviews & Ratings
            </h1>
            <p className="text-gray-600 mt-1">See what your students think about your classes</p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl shadow-md p-5 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Reviews</p>
              <p className="text-3xl font-bold text-gray-900">{reviewsData.totalReviews}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <MessageSquare className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-5 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Average Rating</p>
              <div className="flex items-center gap-2">
                <p className="text-3xl font-bold text-gray-900">{reviewsData.averageRating}</p>
                <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
              </div>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-5 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Classes with Reviews</p>
              <p className="text-3xl font-bold text-gray-900">{reviewsData.classesByRating.length}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Reviews by Class */}
      {reviewsData.classesByRating.length > 0 ? (
        <div className="space-y-4">
          {reviewsData.classesByRating.map((classData) => (
            <div
              key={classData.class_id}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
            >
              {/* Class Header */}
              <div
                className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 cursor-pointer hover:from-blue-100 hover:to-purple-100 transition-colors"
                onClick={() =>
                  setExpandedClass(
                    expandedClass === classData.class_id ? null : classData.class_id
                  )
                }
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-xl font-bold text-gray-900">
                        {classData.className}
                      </h2>
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                        {classData.subject}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        {renderStars(classData.averageRating)}
                        <span className="text-lg font-bold text-gray-900">
                          {classData.averageRating}
                        </span>
                      </div>
                      <span className="text-sm text-gray-600">
                        {classData.reviewCount} {classData.reviewCount === 1 ? 'review' : 'reviews'}
                      </span>
                    </div>
                  </div>
                  <button className="p-2 hover:bg-white/50 rounded-lg transition-colors">
                    <svg
                      className={`w-6 h-6 text-gray-600 transition-transform ${
                        expandedClass === classData.class_id ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Reviews List */}
              {expandedClass === classData.class_id && (
                <div className="p-6 space-y-4 bg-gray-50">
                  {classData.reviews.map((review) => (
                    <div
                      key={review.r_id}
                      className="bg-white rounded-xl p-5 border border-gray-200 hover:shadow-md transition-shadow"
                    >
                      <div className="flex gap-4">
                        {/* Student Avatar */}
                        <div className="flex-shrink-0">
                          {review.studentPhoto ? (
                            <img
                              src={review.studentPhoto}
                              alt={review.studentName}
                              className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-200"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center ring-2 ring-gray-200">
                              <User className="w-6 h-6 text-white" />
                            </div>
                          )}
                        </div>

                        {/* Review Content */}
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h3 className="font-semibold text-gray-900">
                                {review.studentName}
                              </h3>
                              <div className="flex items-center gap-2 mt-1">
                                {review.rating && renderStars(review.rating)}
                                {review.rating && (
                                  <span className="text-sm font-medium text-gray-700">
                                    {review.rating}.0
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 text-sm text-gray-500">
                              <Calendar className="w-4 h-4" />
                              {formatDate(review.created_at)}
                            </div>
                          </div>

                          {review.review && (
                            <p className="text-gray-700 leading-relaxed mt-3 bg-gray-50 rounded-lg p-3 border border-gray-100">
                              "{review.review}"
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-lg mb-4">
            <Star className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No reviews yet</h3>
          <p className="text-sm text-gray-600 mb-6 max-w-sm mx-auto">
            Your students haven't left any reviews yet. Keep providing great classes and
            reviews will start coming in!
          </p>
        </div>
      )}
    </div>
  );
}
