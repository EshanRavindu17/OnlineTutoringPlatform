import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Send, X } from 'lucide-react';
import { useAuth } from '../context/authContext';
import {
  tutorlyAssistantApi,
  TutorlyAssistantChatResponse,
  TutorlyAssistantTutor,
  TutorlyAssistantClass,
} from '../api/tutorlyAssistant.api';

type AssistantMessage =
  | {
      id: string;
      role: 'user';
      content: string;
    }
  | {
      id: string;
      role: 'assistant';
      content: string;
      data?: TutorlyAssistantChatResponse;
    };

export default function TutorlyAssistantWidget() {
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();

  const assistantUserId = currentUser?.uid || userProfile?.firebase_uid;

  const [assistantOpen, setAssistantOpen] = useState(false);
  const [assistantInput, setAssistantInput] = useState('');
  const [assistantMessages, setAssistantMessages] = useState<AssistantMessage[]>([]);
  const [assistantSending, setAssistantSending] = useState(false);
  const [assistantSendError, setAssistantSendError] = useState<string | null>(null);
  const assistantMessagesEndRef = useRef<HTMLDivElement | null>(null);

  const newAssistantMessageId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  const getClassTitle = (c: TutorlyAssistantClass) => (c.Title || c.title || 'Class');

  const renderTutorSuggestion = (t: TutorlyAssistantTutor) => {
    const tutorId = t.tutorid;
    const imageUrl = t.image;

    return (
      <button
        key={`${tutorId || t.name}-${t.subject || ''}-${t.topic || ''}`}
        type="button"
        onClick={() => tutorId && navigate(`/tutor-profile/${tutorId}`)}
        disabled={!tutorId}
        className={`w-full text-left rounded-lg border p-3 transition-colors ${
          tutorId ? 'bg-white border-gray-200 hover:bg-gray-50' : 'bg-gray-50 border-gray-200 cursor-not-allowed'
        }`}
      >
        <div className="flex items-center gap-3">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={t.name}
              className="w-10 h-10 rounded-full object-cover border border-gray-200"
            />
          ) : (
            <div className="w-10 h-10 rounded-full border border-gray-200 bg-gray-100 flex items-center justify-center text-sm font-semibold text-gray-700">
              {(t.name || 'T').slice(0, 1).toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <div className="font-semibold text-gray-900 truncate">{t.name}</div>
            <div className="text-xs text-gray-600 truncate">
              {t.subject ? t.subject : 'Subject'}
              {t.topic ? ` • ${t.topic}` : ''}
              {t.rating ? ` • ${t.rating}` : ''}
              {t.rate ? ` • ${t.rate}` : ''}
            </div>
          </div>
        </div>
      </button>
    );
  };

  const renderClassSuggestion = (c: TutorlyAssistantClass) => {
    const classId = c.classid;
    const title = getClassTitle(c);
    const imageUrl = c.image;

    return (
      <button
        key={`${classId || title}-${c.name || ''}`}
        type="button"
        onClick={() => classId && navigate(`/mass-tutor-profile/${classId}`)}
        disabled={!classId}
        className={`w-full text-left rounded-lg border p-3 transition-colors ${
          classId ? 'bg-white border-gray-200 hover:bg-gray-50' : 'bg-gray-50 border-gray-200 cursor-not-allowed'
        }`}
      >
        <div className="flex items-center gap-3">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={title}
              className="w-10 h-10 rounded-full object-cover border border-gray-200"
            />
          ) : (
            <div className="w-10 h-10 rounded-full border border-gray-200 bg-gray-100 flex items-center justify-center text-sm font-semibold text-gray-700">
              {(title || 'C').slice(0, 1).toUpperCase()}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="font-semibold text-gray-900 truncate">{title}</div>
            <div className="text-xs text-gray-600 truncate">
              {c.name ? `By ${c.name}` : 'Group class'}
              {c.rating ? ` • ${c.rating}` : ''}
              {c.price ? ` • ${c.price}` : ''}
            </div>
          </div>
        </div>
      </button>
    );
  };

  const sendAssistantMessage = async () => {
    const message = assistantInput.trim();
    if (!message || assistantSending) return;
    if (!assistantUserId) return;

    setAssistantSendError(null);
    setAssistantInput('');

    setAssistantMessages(prev => [
      ...prev,
      {
        id: newAssistantMessageId(),
        role: 'user',
        content: message,
      },
    ]);

    setAssistantSending(true);
    try {
      const data = await tutorlyAssistantApi.chat({
        user_id: assistantUserId,
        message,
      });

      setAssistantMessages(prev => [
        ...prev,
        {
          id: newAssistantMessageId(),
          role: 'assistant',
          content: data.reply || 'Here are some results I found.',
          data,
        },
      ]);
    } catch (e) {
      console.error('Tutorly assistant chat failed:', e);
      setAssistantSendError('Failed to connect to the assistant. Please try again.');
      setAssistantMessages(prev => [
        ...prev,
        {
          id: newAssistantMessageId(),
          role: 'assistant',
          content: 'Sorry — I could not connect right now. Please try again.',
        },
      ]);
    } finally {
      setAssistantSending(false);
    }
  };

  useEffect(() => {
    if (!assistantOpen) return;
    assistantMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [assistantMessages, assistantOpen, assistantSending]);

  // Only show when logged in
  if (!assistantUserId) return null;

  return (
    <>
      {assistantOpen && (
        <div className="fixed bottom-24 right-6 z-[9999] w-96 max-w-[calc(100vw-3rem)] bg-white rounded-xl shadow-lg border border-gray-200 flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white rounded-t-xl">
            <div className="min-w-0">
              <div className="font-bold text-gray-900 truncate">Tutorly Assistant</div>
              <div className="text-xs text-gray-600 truncate">Ask for tutor/class ideas</div>
            </div>
            <button
              type="button"
              onClick={() => setAssistantOpen(false)}
              className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-white/60"
              aria-label="Close assistant"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 space-y-3 overflow-y-auto h-96">
            {assistantMessages.length === 0 ? (
              <div className="text-sm text-gray-600">
                Try: “I want Calculus classes” or “Find me a Mathematics tutor”.
              </div>
            ) : (
              assistantMessages.map(msg => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
                      msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.content}</div>

                    {msg.role === 'assistant' && msg.data && (
                      <div className="mt-3 space-y-3">
                        {Array.isArray(msg.data.tutors) && msg.data.tutors.length > 0 && (
                          <div>
                            <div className="text-xs font-semibold text-gray-700 mb-2">Tutors</div>
                            <div className="space-y-2">{msg.data.tutors.map(renderTutorSuggestion)}</div>
                          </div>
                        )}

                        {Array.isArray(msg.data.classes) && msg.data.classes.length > 0 && (
                          <div>
                            <div className="text-xs font-semibold text-gray-700 mb-2">Classes</div>
                            <div className="space-y-2">{msg.data.classes.map(renderClassSuggestion)}</div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}

            {assistantSending && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-900 rounded-xl px-3 py-2 text-sm">Thinking...</div>
              </div>
            )}

            {assistantSendError && <div className="text-xs text-red-600">{assistantSendError}</div>}

            <div ref={assistantMessagesEndRef} />
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendAssistantMessage();
            }}
            className="p-3 border-t border-gray-200 flex items-center gap-2"
          >
            <input
              value={assistantInput}
              onChange={(e) => setAssistantInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
            <button
              type="submit"
              disabled={!assistantInput.trim() || assistantSending}
              className={`px-3 py-2 rounded-lg font-semibold transition-colors ${
                !assistantInput.trim() || assistantSending
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
              aria-label="Send"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      <button
        type="button"
        onClick={() => setAssistantOpen(prev => !prev)}
        className="fixed bottom-6 right-6 z-[9999] bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
        aria-label="Open assistant"
      >
        <MessageCircle className="w-6 h-6" />
      </button>
    </>
  );
}
