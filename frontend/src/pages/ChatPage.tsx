import React, { useState } from 'react';
import { ChatList } from '../components/Chat/ChatList';
import { ChatWindow } from '../components/Chat/ChatWindow';
import { Chat } from '../api/chat.api';
import { MessageCircle, Sparkles } from 'lucide-react';
import NavBar from '../components/Navbar';
import Footer from '../components/Footer';

export const ChatPage: React.FC = () => {
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <NavBar />
      
      {/* Hero Header - Matching Welcome Page Style */}
      <div className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='m36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute top-10 left-10 w-16 h-16 bg-white/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-20 right-20 w-24 h-24 bg-purple-400/20 rounded-full blur-2xl animate-bounce"></div>
        <div className="absolute bottom-10 left-1/4 w-12 h-12 bg-indigo-400/20 rounded-full blur-lg animate-pulse"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-3">
              <Sparkles className="w-3 h-3 mr-2" />
              <span className="text-xs font-medium">Real-time Messaging</span>
            </div>
            
            {/* Main Heading */}
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2">
                <MessageCircle className="w-8 h-8 md:w-10 md:h-10" />
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                  Messages
                </h1>
              </div>
              <p className="text-sm md:text-base text-blue-100 leading-relaxed max-w-2xl mx-auto">
                Connect and collaborate with tutors and students in real-time
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/40 overflow-hidden" style={{ height: 'calc(100vh - 280px)', minHeight: '650px' }}>
          <div className="flex h-full">
            {/* Chat List Section */}
            <div className="w-full md:w-96 border-r border-gray-200 flex-shrink-0">
              <ChatList
                onChatSelect={setSelectedChat}
                selectedChatId={selectedChat?.chat_id}
              />
            </div>
            
            {/* Chat Window Section */}
            <div className="flex-1 hidden md:flex">
              {selectedChat ? (
                <ChatWindow chat={selectedChat} />
              ) : (
                <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
                  <div className="text-center p-8">
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <MessageCircle className="w-12 h-12 text-blue-600" />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                      <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                        Welcome to Messages
                      </span>
                    </h2>
                    <p className="text-gray-600 text-lg">
                      Select a conversation to start messaging or create a new chat
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};
