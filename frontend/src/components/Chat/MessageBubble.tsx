import React from 'react';
import { Message } from '../../api/chat.api';
import { auth } from '../../firebase';
import { Edit2, Trash2, Check, X } from 'lucide-react';
import chatunknown from '../../assets/chatunknown.avif';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showAvatar?: boolean;
  onDelete?: (messageId: string) => void;
  onEdit?: (messageId: string, content: string) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwn,
  showAvatar = true,
  onDelete,
  onEdit,
}) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editContent, setEditContent] = React.useState(message.content);
  const [showMenu, setShowMenu] = React.useState(false);

  const handleEdit = () => {
    if (editContent.trim() && editContent !== message.content) {
      onEdit?.(message.message_id, editContent.trim());
      setIsEditing(false);
    } else {
      setIsEditing(false);
      setEditContent(message.content);
    }
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      onDelete?.(message.message_id);
    }
    setShowMenu(false);
  };

  const formatTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const renderContent = () => {
    if (message.message_type === 'text') {
      if (isEditing) {
        return (
          <div className="space-y-3">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleEdit();
                } else if (e.key === 'Escape') {
                  setIsEditing(false);
                  setEditContent(message.content);
                }
              }}
              autoFocus
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            />
            <div className="flex items-center gap-2">
              <button 
                onClick={handleEdit} 
                className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-sm font-medium hover:from-blue-700 hover:to-purple-700 transition-all"
              >
                <Check className="w-4 h-4" />
                Save
              </button>
              <button 
                onClick={() => {
                  setIsEditing(false);
                  setEditContent(message.content);
                }} 
                className="flex items-center gap-1 px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 transition-all"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            </div>
          </div>
        );
      }
      return <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{message.content}</p>;
    } else if (message.message_type === 'file' || message.message_type === 'image') {
      return (
        <div className="space-y-2">
          {message.message_type === 'image' && message.file_url ? (
            <img 
              src={message.file_url} 
              alt={message.file_name || 'Image'} 
              className="max-w-full rounded-lg shadow-md"
            />
          ) : null}
          <a 
            href={message.file_url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            📎 {message.file_name || 'Download file'}
          </a>
        </div>
      );
    }
  };

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} group`}>
      <div className={`flex gap-2 max-w-[70%] ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        {!isOwn && showAvatar && (
          <div className="flex-shrink-0">
            <img
              src={message.User?.photo_url || chatunknown}
              alt={message.User?.name || 'User'}
              className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-md"
              onError={(e) => {
                (e.target as HTMLImageElement).src = chatunknown;
              }}
            />
          </div>
        )}
        
        {/* Message Content */}
        <div className="flex flex-col gap-1">
          {/* Sender Name */}
          {!isOwn && showAvatar && (
            <div className="px-1">
              <span className="text-xs font-semibold text-gray-700">
                {message.User?.name}
              </span>
            </div>
          )}
          
          {/* Message Bubble */}
          <div 
            className="relative"
            onMouseEnter={() => isOwn && setShowMenu(true)}
            onMouseLeave={() => setShowMenu(false)}
          >
            <div 
              className={`px-4 py-3 rounded-2xl shadow-sm transition-all duration-300 ${
                isOwn 
                  ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-br-md' 
                  : 'bg-white text-gray-900 rounded-bl-md border border-gray-200'
              } ${showMenu && isOwn ? 'shadow-lg scale-[1.02]' : ''}`}
            >
              {renderContent()}
            </div>
            
            {/* Action Menu */}
            {isOwn && showMenu && !isEditing && (
              <div className="absolute top-0 right-full mr-2 flex items-center gap-1 bg-white rounded-lg shadow-lg border border-gray-200 p-1 animate-in slide-in-from-right">
                {message.message_type === 'text' && (
                  <button 
                    onClick={() => setIsEditing(true)} 
                    title="Edit"
                    className="p-1.5 hover:bg-blue-50 rounded-md transition-colors"
                  >
                    <Edit2 className="w-4 h-4 text-blue-600" />
                  </button>
                )}
                <button 
                  onClick={handleDelete} 
                  title="Delete"
                  className="p-1.5 hover:bg-red-50 rounded-md transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </button>
              </div>
            )}
          </div>
          
          {/* Message Meta */}
          <div className={`flex items-center gap-2 px-1 text-xs text-gray-500 ${isOwn ? 'justify-end' : 'justify-start'}`}>
            <span>{formatTime(message.created_at)}</span>
            {message.edited_at && (
              <span className="italic">(edited)</span>
            )}
            {isOwn && message.is_read && (
              <span className="text-blue-600 font-bold">✓✓</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
