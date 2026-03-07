import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';
import { aiService } from '../services/aiService';
import { Link, useNavigate } from 'react-router-dom';

const SUGGESTION_CHIPS = [
  'Show properties in Kathmandu',
  'Budget under 20000',
  '2 bedroom house',
];

const AIChatbot = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        id: 'welcome',
        isAI: true,
        content: "Hi! I'm your RentNest AI assistant. I can help you:\n\n• Search for properties using natural language\n• Understand FairFlex pricing\n• Get booking guidance\n• Find properties that match your needs\n\nTry asking: \"family friendly house in Kathmandu under 30k\" or \"how does FairFlex work?\"",
        timestamp: new Date()
      }]);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (text = input) => {
    const messageText = (text || input).trim();
    if (!messageText || loading) return;

    const userMessage = {
      id: Date.now(),
      isAI: false,
      content: messageText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setMessages(prev => [...prev, {
          id: Date.now(),
          isAI: true,
          content: '🔐 **Authentication Required**\n\nTo use the AI assistant, you need to be logged in.\n\nPlease sign in from the navigation bar and try again.',
          timestamp: new Date(),
          showLoginButton: true
        }]);
        setLoading(false);
        return;
      }

      const response = await aiService.chat(messageText, conversationId);

      if (response.success) {
        const { aiMessage, response: aiResponse } = response.data;

        if (!conversationId && response.data.conversation) {
          setConversationId(response.data.conversation._id);
        }

        const aiMsg = {
          id: aiMessage._id || Date.now(),
          isAI: true,
          content: aiResponse.message,
          timestamp: new Date(aiMessage.createdAt),
          properties: aiResponse.properties || [],
          responseType: aiResponse.type
        };

        setMessages(prev => [...prev, aiMsg]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      let errorMessage = 'Sorry, I encountered an error. Please try again.';

      if (error.response?.status === 400) {
        const data = error.response.data;
        if (data.errors && Array.isArray(data.errors)) {
          const errorList = data.errors.map(err => `• ${err.msg || err.message}`).join('\n');
          errorMessage = `${data.message || 'Validation failed'}\n\n${errorList}`;
        } else {
          errorMessage = data.message || 'Invalid request. Please check your input.';
        }
      } else if (error.response?.status === 401 || error.response?.status === 403) {
        errorMessage = '🔐 **Authentication Required**\n\nPlease log in to use the AI assistant. If you\'re already logged in, your session may have expired.';
      } else if (error.response?.status === 500) {
        errorMessage = '⚠️ **Server Error**\n\nPlease ensure the backend server is running and MongoDB is connected.';
      } else if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
        errorMessage = '🌐 **Connection Error**\n\nUnable to connect to the server. Please check your connection.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      setMessages(prev => [...prev, {
        id: Date.now(),
        isAI: true,
        content: errorMessage,
        timestamp: new Date()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestionClick = (chip) => {
    handleSend(chip);
  };

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-full p-4 shadow-lg shadow-violet-500/30 z-[9999] transition-all duration-300 hover:scale-110"
          aria-label="Open AI Assistant"
        >
          <MessageCircle size={24} />
        </button>
      )}

      {/* Chat Window - Slide-in animation */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-[400px] h-[600px] z-[9999] flex flex-col animate-slide-in-chat">
          <div className="flex-1 flex flex-col bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-sm min-h-0">
            {/* Header */}
            <div className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-4 py-3 flex items-center justify-between shadow-lg">
              <div className="flex items-center gap-2">
                <Bot size={22} className="flex-shrink-0" />
                <h3 className="font-bold text-base">RentNest AI Assistant</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-lg hover:bg-white/20 transition-colors duration-200"
                aria-label="Close chat"
              >
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-neutral-950/50 min-h-0">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-2 ${msg.isAI ? 'justify-start' : 'justify-end'} animate-fade-in`}
                >
                  {msg.isAI && (
                    <div className="w-8 h-8 rounded-full bg-neutral-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Bot size={16} className="text-violet-300" />
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] rounded-xl p-3 ${
                      msg.isAI
                        ? 'bg-neutral-800 border border-neutral-700 shadow-md'
                        : 'bg-gradient-to-r from-violet-600 to-indigo-600'
                    }`}
                  >
                    <p className={`text-sm whitespace-pre-wrap leading-relaxed ${msg.isAI ? 'text-neutral-200' : 'text-white'}`}>
                      {msg.content}
                    </p>

                    {msg.showLoginButton && (
                      <div className="mt-3">
                        <button
                          onClick={() => {
                            setIsOpen(false);
                            navigate('/login');
                          }}
                          className="w-full bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium py-2 px-4 rounded-xl transition-all duration-200 hover:scale-[1.02]"
                        >
                          Go to Login Page
                        </button>
                      </div>
                    )}

                    {msg.properties && msg.properties.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {msg.properties.slice(0, 3).map((property) => (
                          <Link
                            key={property._id}
                            to={`/property/${property._id}`}
                            className="block p-2 bg-neutral-700/80 rounded-xl border border-neutral-600 hover:bg-neutral-700 hover:border-violet-500/50 transition-all duration-200"
                            onClick={() => setIsOpen(false)}
                          >
                            <div className="flex gap-2">
                              {property.image && (
                                <img
                                  src={property.image}
                                  alt={property.title}
                                  className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
                                />
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-white truncate">
                                  {property.title}
                                </p>
                                <p className="text-xs text-neutral-400">
                                  {property.location} • NPR {property.price?.toLocaleString()}/mo
                                </p>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                  {!msg.isAI && (
                    <div className="w-8 h-8 rounded-full bg-neutral-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <User size={16} className="text-violet-300" />
                    </div>
                  )}
                </div>
              ))}

              {/* Typing indicator */}
              {loading && (
                <div className="flex gap-2 justify-start animate-fade-in">
                  <div className="w-8 h-8 rounded-full bg-neutral-700 flex items-center justify-center flex-shrink-0">
                    <Bot size={16} className="text-violet-300" />
                  </div>
                  <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-4 shadow-md">
                    <div className="flex gap-1.5" aria-label="Typing">
                      <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Suggestion chips - show when few messages and not loading */}
            {messages.length <= 1 && !loading && (
              <div className="px-4 pb-2 flex flex-wrap gap-2">
                {SUGGESTION_CHIPS.map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => handleSuggestionClick(chip)}
                    className="px-3 py-1.5 text-xs font-medium rounded-xl bg-neutral-800 border border-neutral-700 text-neutral-200 hover:bg-neutral-700 hover:border-violet-500/50 transition-all duration-200"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="p-4 border-t border-neutral-800 bg-neutral-900/95">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about properties..."
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-xl text-neutral-200 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200 disabled:opacity-60"
                />
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || loading}
                  className="p-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 disabled:hover:scale-100 shadow-lg"
                  aria-label="Send message"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AIChatbot;
