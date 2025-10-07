import React from 'react';
import { Star, DollarSign, Camera, Settings } from 'lucide-react';
import { NotificationCenter } from '../../pages/individualTutor/NotificationCenter';

interface DashboardHeaderProps {
  tutorProfile: {
    photo_url?: string | null;
    name: string;
    rating: number;
    totalReviews: number;
    hourlyRate: number;
  };
  notifications: any[];
  onImageEdit: () => void;
  onMarkAsRead: (notificationId: number) => void;
  onMarkAllAsRead: () => void;
  onDeleteNotification: (notificationId: number) => void;
  showHeaderActions?: boolean;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  tutorProfile,
  notifications,
  onImageEdit,
  onMarkAsRead,
  onMarkAllAsRead,
  onDeleteNotification,
  showHeaderActions = false
}) => {
  return (
    <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 text-white">
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="relative group">
              <img 
                src={tutorProfile.photo_url || '/default-profile.png'} 
                alt={tutorProfile.name}
                className="w-20 h-20 rounded-full border-4 border-white shadow-lg"
              />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-400 rounded-full border-2 border-white"></div>
              
              {/* Image Edit Button */}
              <button
                onClick={onImageEdit}
                className="absolute inset-0 w-20 h-20 rounded-full bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              >
                <Camera className="w-6 h-6 text-white" />
              </button>
            </div>
            <div>
              <h1 className="text-3xl font-bold">{tutorProfile.name}</h1>
              <p className="text-blue-100 text-lg mb-2">Individual Tutor</p>
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <Star className="w-5 h-5 text-yellow-300 mr-1" />
                  <span className="font-semibold">{tutorProfile.rating}</span>
                  <span className="text-blue-200 ml-1">({tutorProfile.totalReviews} reviews)</span>
                </div>
                <div className="flex items-center">
                  <DollarSign className="w-5 h-5 text-green-300 mr-1" />
                  <span className="font-semibold">LKR {tutorProfile.hourlyRate}/hour</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-right space-y-2">
            {showHeaderActions && (
              <div className="flex items-center space-x-4">
                <NotificationCenter
                  notifications={notifications}
                  onMarkAsRead={onMarkAsRead}
                  onMarkAllAsRead={onMarkAllAsRead}
                  onDeleteNotification={onDeleteNotification}
                  buttonClassName="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors flex items-center relative"
                  iconColor="text-white"
                />
                <button className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors flex items-center">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </button>
              </div>
            )}
            <div className="text-sm text-blue-200">
              Last login: {new Date().toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;