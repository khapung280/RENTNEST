import { useState, useEffect, useRef } from 'react';
import { X, Send, User, Clock } from 'lucide-react';
import { conversationService, messageService } from '../services/aiService';

const ChatWindow = ({ isOpen, onClose, conversationId, otherUser, property, currentUserId, inline = false }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  // Load messages when conversation opens
  useEffect(() => {
    if (isOpen && conversationId) {
      loadMessages();
      // Poll for new messages every 3 seconds
      const interval = setInterval(loadMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [isOpen, conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadMessages = async () => {
    try {
      const response = await messageService.getByConversation(conversationId);
      if (response.success) {
        setMessages(response.data.data || []);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      if (!messages.length) {
        setError('Failed to load messages. Please try again.');
      }
    }
  };

  const handleSend = async () => {
    if (!input.trim() || sending) return;

    const content = input.trim();
    setInput('');
    setSending(true);
    setError(null);

    try {
      const response = await messageService.send(conversationId, content);
      if (response.success) {
        // Reload messages to get the new one
        await loadMessages();
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message. Please try again.');
      setInput(content); // Restore input on error
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (!isOpen) return null;

  if (inline) {
    // Inline mode for Messages page
    return (
      <div className="flex flex-col h-full bg-white">
        {/* Header */}
        <div className="bg-blue-600 text-white p-4 rounded-t-lg flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {otherUser?.profilePicture ? (
              <img
                src={otherUser.profilePicture}
                alt={otherUser.name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
                <User size={20} />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate">{otherUser?.name || 'User'}</h3>
              {property && (
                <p className="text-xs text-blue-100 truncate">{property.title}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="hover:bg-blue-700 rounded p-1 transition-colors ml-2"
            aria-label="Close chat"
          >
            <X size={20} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 text-sm p-3 rounded-lg">
              {error}
            </div>
          )}
          
          {messages.length === 0 && !loading ? (
            <div className="text-center text-gray-500 py-8">
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isOwnMessage = msg.sender._id === currentUserId || msg.sender.toString() === currentUserId;
              
              return (
                <div
                  key={msg._id}
                  className={`flex gap-2 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                >
                  {!isOwnMessage && (
                    <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                      {otherUser?.profilePicture ? (
                        <img
                          src={otherUser.profilePicture}
                          alt={otherUser.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <User size={16} className="text-gray-600" />
                      )}
                    </div>
                  )}
                  <div
                    className={`max-w-[75%] rounded-lg p-3 ${
                      isOwnMessage
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border border-gray-200'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    <div className={`flex items-center gap-1 mt-1 text-xs ${
                      isOwnMessage ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      <Clock size={12} />
                      <span>{formatTime(msg.createdAt)}</span>
                    </div>
                  </div>
                  {isOwnMessage && (
                    <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                      <User size={16} className="text-gray-600" />
                    </div>
                  )}
                </div>
              );
            })
          )}
          
          {loading && (
            <div className="text-center text-gray-500 py-4">
              <p>Loading messages...</p>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-200 bg-white">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={sending}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || sending}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Modal mode for popup chat
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl h-[600px] flex flex-col">
        {/* Header */}
        <div className="bg-blue-600 text-white p-4 rounded-t-lg flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {otherUser?.profilePicture ? (
              <img
                src={otherUser.profilePicture}
                alt={otherUser.name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
                <User size={20} />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate">{otherUser?.name || 'User'}</h3>
              {property && (
                <p className="text-xs text-blue-100 truncate">{property.title}</p>
              )}
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="hover:bg-blue-700 rounded p-1 transition-colors ml-2"
              aria-label="Close chat"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 text-sm p-3 rounded-lg">
              {error}
            </div>
          )}
          
          {messages.length === 0 && !loading ? (
            <div className="text-center text-gray-500 py-8">
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isOwnMessage = msg.sender._id === currentUserId || msg.sender.toString() === currentUserId;
              
              return (
                <div
                  key={msg._id}
                  className={`flex gap-2 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                >
                  {!isOwnMessage && (
                    <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                      {otherUser?.profilePicture ? (
                        <img
                          src={otherUser.profilePicture}
                          alt={otherUser.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <User size={16} className="text-gray-600" />
                      )}
                    </div>
                  )}
                  <div
                    className={`max-w-[75%] rounded-lg p-3 ${
                      isOwnMessage
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border border-gray-200'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    <div className={`flex items-center gap-1 mt-1 text-xs ${
                      isOwnMessage ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      <Clock size={12} />
                      <span>{formatTime(msg.createdAt)}</span>
                    </div>
                  </div>
                  {isOwnMessage && (
                    <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                      <User size={16} className="text-gray-600" />
                    </div>
                  )}
                </div>
              );
            })
          )}
          
          {loading && (
            <div className="text-center text-gray-500 py-4">
              <p>Loading messages...</p>
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
              placeholder="Type your message..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={sending}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || sending}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;

