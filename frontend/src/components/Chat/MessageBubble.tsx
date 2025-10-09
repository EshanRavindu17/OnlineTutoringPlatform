import React from 'react';
import { Message } from '../../api/chat.api';
import { auth } from '../../firebase';
import './MessageBubble.css';

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
          <div className="message-edit">
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
            />
            <div className="edit-actions">
              <button onClick={handleEdit} className="btn-save">Save</button>
              <button 
                onClick={() => {
                  setIsEditing(false);
                  setEditContent(message.content);
                }} 
                className="btn-cancel"
              >
                Cancel
              </button>
            </div>
          </div>
        );
      }
      return <p className="message-text">{message.content}</p>;
    } else if (message.message_type === 'file' || message.message_type === 'image') {
      return (
        <div className="message-file">
          {message.message_type === 'image' && message.file_url ? (
            <img src={message.file_url} alt={message.file_name || 'Image'} />
          ) : null}
          <a href={message.file_url} target="_blank" rel="noopener noreferrer">
            📎 {message.file_name || 'Download file'}
          </a>
        </div>
      );
    }
  };

  return (
    <div className={`message-bubble ${isOwn ? 'own' : 'other'}`}>
      {!isOwn && showAvatar && (
        <div className="message-avatar">
          <img
            src={message.User?.photo_url || '/default-avatar.png'}
            alt={message.User?.name || 'User'}
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/default-avatar.png';
            }}
          />
        </div>
      )}
      
      <div className="message-content-wrapper">
        {!isOwn && showAvatar && (
          <div className="message-sender">
            {message.User?.name}
          </div>
        )}
        
        <div 
          className="message-content"
          onMouseEnter={() => isOwn && setShowMenu(true)}
          onMouseLeave={() => setShowMenu(false)}
        >
          {renderContent()}
          
          {isOwn && showMenu && !isEditing && (
            <div className="message-menu">
              {message.message_type === 'text' && (
                <button onClick={() => setIsEditing(true)} title="Edit">
                  ✏️
                </button>
              )}
              <button onClick={handleDelete} title="Delete">
                🗑️
              </button>
            </div>
          )}
        </div>
        
        <div className="message-meta">
          <span className="message-time">{formatTime(message.created_at)}</span>
          {message.edited_at && <span className="message-edited">(edited)</span>}
          {isOwn && message.is_read && <span className="message-read">✓✓</span>}
        </div>
      </div>
    </div>
  );
};
