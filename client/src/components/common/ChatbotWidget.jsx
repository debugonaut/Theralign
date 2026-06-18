import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, X, Send, Sparkles } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { queryChatbotAPI } from '../../api/ai.api';

const QUICK_REPLIES = {
  guest: [
    { label: 'What is Theralign?', query: 'What is Theralign?' },
    { label: 'Doctor Verification', query: 'How does doctor verification work?' },
    { label: 'Register Patient', query: 'How do I sign up as a patient?' },
    { label: 'Register Doctor', query: 'How do I sign up as a doctor?' },
    { label: 'Specialisations', query: 'What specialisations are available?' },
    { label: 'Cancellation Policy', query: 'What is your refund policy for cancellations?' },
  ],
  patient: [
    { label: 'Book Appointment', query: 'How do I book a session with a physiotherapist?' },
    { label: 'Symptom Triage', query: 'How do I know which specialist to book?' },
    { label: 'My Exercises', query: 'How do I access my assigned home exercises?' },
    { label: 'Cancel Booking', query: 'How do I cancel my booked appointment?' },
    { label: 'Receipts', query: 'Where can I download my payment receipts?' },
    { label: 'Upload Reports', query: 'How do I upload my MRI or X-ray reports before my appointment?' },
  ],
  doctor: [
    { label: 'Set Slots', query: 'How do I create new availability slots?' },
    { label: 'Write Notes', query: 'How do I write session notes for a completed appointment?' },
    { label: 'AI Prescribing', query: 'What is the AI Exercise Creator?' },
    { label: 'Invite Junior', query: 'How do I invite a junior doctor to my clinic?' },
    { label: 'My Earnings', query: 'How do I view my platform earnings?' },
    { label: 'Ratings & Feedback', query: 'How do I improve my profile ratings?' },
  ],
  admin: [
    { label: 'Verify Doctors', query: 'Where do I verify pending doctor applications?' },
    { label: 'Refund Requests', query: 'Where do I manage patient refund requests?' },
    { label: 'AI Summaries', query: 'How do I run batch doctor summaries?' },
    { label: 'Revenue Stats', query: 'Where can I see total platform revenue?' },
    { label: 'Moderate Reviews', query: 'How do I manage review visibility?' },
    { label: 'Suspend User', query: 'Can I suspend a patient account?' },
  ],
};

const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const scrollRef = useRef(null);

  const userRole = user?.role || 'guest';
  const displayRoleName = userRole.toUpperCase();

  // Initialize greeting on mount or role change
  useEffect(() => {
    const greeting = isAuthenticated && user
      ? `Hello ${user.name || 'User'}! As a verified Theralign ${userRole}, how can I assist you with your dashboard features today?`
      : "Welcome to Theralign! I'm your virtual clinical assistant. Select a topic below or type any question to get started.";

    setMessages([
      {
        id: 'greet',
        role: 'assistant',
        content: greeting,
        isScripted: true,
      },
    ]);
  }, [userRole, isAuthenticated, user]);

  // Auto-scroll to the bottom of the feed
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSubmit = async (text) => {
    const userMessage = text.trim();
    if (!userMessage) return;

    // Add user message
    const userMsgObj = {
      id: Date.now().toString(),
      role: 'user',
      content: userMessage,
    };
    setMessages((prev) => [...prev, userMsgObj]);
    setQuery('');
    setIsLoading(true);

    try {
      // Create request payload history
      const apiHistory = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await queryChatbotAPI(userMessage, apiHistory);
      const { answer, route, isScripted } = response.data;

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: answer,
          route: route || null,
          isScripted: !!isScripted,
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: 'Error: Unable to connect to the assistant right now. Please try again.',
          route: null,
          isScripted: false,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavigation = (route) => {
    if (!route || typeof route !== 'string') return;
    // Safety check: ensure route starts with a single '/' and does not contain protocol headers (e.g. 'http:') or domains
    if (route.startsWith('/') && !route.startsWith('//') && !route.includes(':')) {
      navigate(route);
      setIsOpen(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(query);
    }
  };

  const currentReplies = QUICK_REPLIES[userRole] || QUICK_REPLIES.guest;

  return (
    <div className="fixed bottom-6 right-6 z-9999 font-swiss">
      {/* Closed Launcher Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="font-swiss flex items-center gap-2 bg-primary text-white border-2 border-primary hover:bg-primary-dark px-4 py-3 rounded-full shadow-level-2 transition-all duration-fast ease-swiss hover:-translate-y-1 active:scale-98"
          title="Ask Theralign AI Assistant"
        >
          <MessageSquare className="w-5 h-5 text-white" />
          <span className="text-ui-xs font-bold uppercase tracking-wider">Ask Theralign AI</span>
        </button>
      )}

      {/* Chat Window Panel */}
      {isOpen && (
        <div className="w-[360px] h-[500px] bg-white border-2 border-neutral-200 rounded-xl shadow-level-3 flex flex-col overflow-hidden animate-swiss-slide-in">
          {/* Header */}
          <div className="bg-primary px-4 py-3 flex items-center justify-between border-b border-primary-dark">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-accent" />
              <div>
                <h4 className="text-white text-ui-md font-bold leading-none">Theralign AI Guide</h4>
                <span className="text-[10px] text-primary-light font-medium tracking-wider uppercase leading-none block mt-1">
                  ROLE: {displayRoleName}
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="font-swiss text-white hover:text-accent transition-colors duration-fast p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Feed */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 bg-neutral-50"
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`p-3 rounded-xl text-ui-sm max-w-[85%] shadow-level-1 border ${
                    msg.role === 'user'
                      ? 'bg-primary-light text-primary border-primary-light'
                      : 'bg-white text-neutral-900 border-neutral-200'
                  }`}
                >
                  <p className="whitespace-pre-line leading-relaxed">{msg.content}</p>
                  
                  {msg.route && (
                    <button
                      onClick={() => handleNavigation(msg.route)}
                      className="font-swiss mt-3 w-full text-center bg-primary text-white hover:bg-primary-dark font-semibold text-ui-xs py-2 px-3 rounded-md transition-all duration-fast ease-swiss"
                    >
                      Go to Dashboard page →
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* AI Loading Skeleton */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white text-neutral-900 border border-neutral-200 p-3 rounded-xl shadow-level-1 max-w-[85%]">
                  <div className="flex space-x-1 items-center h-4">
                    <div className="w-2 h-2 bg-primary animate-swiss-pulse rounded-full" />
                    <div className="w-2 h-2 bg-primary animate-swiss-pulse rounded-full delay-75" />
                    <div className="w-2 h-2 bg-primary animate-swiss-pulse rounded-full delay-150" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick-Reply Suggestion Chips */}
          <div className="p-3 bg-white border-t border-neutral-200">
            <span className="text-[10px] text-neutral-500 font-semibold uppercase tracking-wider block mb-2">
              Suggested Topics:
            </span>
            <div className="flex flex-wrap gap-2 max-h-[72px] overflow-y-auto">
              {currentReplies.map((reply, index) => (
                <button
                  key={index}
                  onClick={() => handleSubmit(reply.query)}
                  disabled={isLoading}
                  className="font-swiss bg-neutral-100 hover:bg-primary hover:text-white text-neutral-900 border border-neutral-200 font-semibold text-[11px] px-2 py-1 rounded-lg uppercase tracking-wider transition-all duration-fast ease-swiss disabled:opacity-50"
                >
                  {reply.label}
                </button>
              ))}
            </div>
          </div>

          {/* User Input Section */}
          <div className="p-3 border-t border-neutral-200 bg-white flex items-center gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyPress}
              disabled={isLoading}
              placeholder="Type your question..."
              className="font-swiss flex-1 border border-neutral-200 rounded-md px-3 py-2 text-ui-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white text-neutral-900 placeholder-neutral-300"
            />
            <button
              onClick={() => handleSubmit(query)}
              disabled={isLoading || !query.trim()}
              className="font-swiss p-2 bg-primary text-white rounded-md hover:bg-primary-dark flex items-center justify-center disabled:opacity-50 transition-colors duration-fast ease-swiss"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatbotWidget;
