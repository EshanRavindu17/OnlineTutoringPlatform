import React, { useState } from 'react';
import { ChatList } from '../components/Chat/ChatList';
import { ChatWindow } from '../components/Chat/ChatWindow';
import { Chat } from '../api/chat.api';
import './ChatPage.css';

export const ChatPage: React.FC = () => {
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);

  return (
    <div className="chat-page">
      <div className="chat-page-container">
        <div className="chat-list-section">
          <ChatList
            onChatSelect={setSelectedChat}
            selectedChatId={selectedChat?.chat_id}
          />
        </div>
        
        <div className="chat-window-section">
          {selectedChat ? (
            <ChatWindow chat={selectedChat} />
          ) : (
            <div className="no-chat-selected">
              <div className="no-chat-content">
                <div className="no-chat-icon">💬</div>
                <h2>Welcome to Messages</h2>
                <p>Select a conversation to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
