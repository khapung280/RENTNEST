import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';
import { aiService } from '../services/aiService';
import { Link, useNavigate } from 'react-router-dom';

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
      // Add welcome message
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
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = {
      id: Date.now(),
      isAI: false,
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setLoading(true);

    try {
      // Check if user is logged in
      const token = localStorage.getItem('token');
      if (!token) {
        setMessages(prev => [...prev, {
          id: Date.now(),
          isAI: true,
          content: '🔐 **Authentication Required**\n\nTo use the AI assistant, you need to be logged in.\n\n**Important:** The frontend needs to be connected to the backend for authentication to work. Currently, the Login page is a mock and doesn\'t actually authenticate with the backend.\n\n**To fix this:**\n1. Connect the frontend to the backend (update Login.jsx to call the backend API)\n2. Store the authentication token in localStorage after successful login\n3. The AI assistant will then work automatically\n\nWould you like me to help you connect the frontend authentication?',
          timestamp: new Date(),
          showLoginButton: true
        }]);
        setLoading(false);
        return;
      }

      const response = await aiService.chat(currentInput, conversationId);
      
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
        // Validation error
        const data = error.response.data;
        if (data.errors && Array.isArray(data.errors)) {
          const errorList = data.errors.map(err => `• ${err.msg || err.message}`).join('\n');
          errorMessage = `${data.message || 'Validation failed'}\n\n${errorList}`;
        } else {
          errorMessage = data.message || 'Invalid request. Please check your input.';
        }
      } else if (error.response?.status === 401 || error.response?.status === 403) {
        errorMessage = '🔐 **Authentication Required**\n\nPlease log in to use the AI assistant. If you\'re already logged in, your session may have expired. Please log in again from the navigation bar.';
      } else if (error.response?.status === 500) {
        errorMessage = '⚠️ **Server Error**\n\nThe backend server may not be running. Please ensure:\n\n1. Backend server is started\n2. MongoDB is running\n3. The API URL (VITE_API_URL) is configured correctly';
      } else if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
        errorMessage = '🌐 **Connection Error**\n\nUnable to connect to the backend server. Please ensure:\n\n1. Backend server is running\n2. Check your network connection\n3. Verify the API URL (VITE_API_URL) in your environment variables';
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

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg z-50 transition-all duration-300 hover:scale-110"
          aria-label="Open AI Assistant"
        >
          <MessageCircle size={24} />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-lg shadow-2xl z-50 flex flex-col border border-gray-200">
          {/* Header */}
          <div className="bg-blue-600 text-white p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot size={20} />
              <h3 className="font-semibold">RentNest AI Assistant</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-blue-700 rounded p-1 transition-colors"
              aria-label="Close chat"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2 ${msg.isAI ? 'justify-start' : 'justify-end'}`}
              >
                {msg.isAI && (
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                    <Bot size={16} className="text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    msg.isAI
                      ? 'bg-white border border-gray-200'
                      : 'bg-blue-600 text-white'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  
                  {/* Login Button (if shown) */}
                  {msg.showLoginButton && (
                    <div className="mt-3">
                      <button
                        onClick={() => {
                          setIsOpen(false);
                          navigate('/login');
                        }}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors"
                      >
                        Go to Login Page
                      </button>
                    </div>
                  )}
                  
                  {/* Property Suggestions */}
                  {msg.properties && msg.properties.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {msg.properties.slice(0, 3).map((property) => (
                        <Link
                          key={property._id}
                          to={`/property/${property._id}`}
                          className="block p-2 bg-gray-50 rounded border border-gray-200 hover:bg-gray-100 transition-colors"
                          onClick={() => setIsOpen(false)}
                        >
                          <div className="flex gap-2">
                            {property.image && (
                              <img
                                src={property.image}
                                alt={property.title}
                                className="w-12 h-12 object-cover rounded"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-gray-900 truncate">
                                {property.title}
                              </p>
                              <p className="text-xs text-gray-600">
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
                  <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                    <User size={16} className="text-gray-600" />
                  </div>
                )}
              </div>
            ))}
            
            {loading && (
              <div className="flex gap-2 justify-start">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                  <Bot size={16} className="text-white" />
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200 bg-white rounded-b-lg">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about properties..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AIChatbot;

