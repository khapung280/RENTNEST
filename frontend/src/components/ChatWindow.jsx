import { useState, useEffect, useRef, useMemo } from 'react';
import { X, Send, User, Clock, MessageCircle } from 'lucide-react';
import { messageService } from '../services/aiService';

const ChatWindow = ({
  isOpen,
  onClose,
  conversationId,
  otherUser,
  property,
  currentUserId,
  inline = false,
  onMessageSent,
}) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const shouldScrollToBottomRef = useRef(true);

  useEffect(() => {
    if (isOpen && conversationId) {
      shouldScrollToBottomRef.current = true;
      loadMessages();
      const interval = setInterval(loadMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [isOpen, conversationId]);

  useEffect(() => {
    if (shouldScrollToBottomRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      shouldScrollToBottomRef.current = false;
    }
  }, [messages]);

  const loadMessages = async () => {
    try {
      const response = await messageService.getByConversation(conversationId);
      if (response.success) {
        setMessages(response.data || []);
        setError(null);
      }
    } catch (err) {
      console.error('Error loading messages:', err);
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
        shouldScrollToBottomRef.current = true;
        await loadMessages();
        onMessageSent?.();
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message. Please try again.');
      setInput(content);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
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

  const formatDateSeparator = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    });
  };

  const getInitials = (user) => {
    const name = user?.name || 'U';
    return name
      .split(/\s+/)
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const messagesWithDateGroups = useMemo(() => {
    const groups = [];
    let lastDate = null;

    messages.forEach((msg) => {
      const msgDate = msg.createdAt
        ? new Date(msg.createdAt).toDateString()
        : null;
      if (msgDate && msgDate !== lastDate) {
        groups.push({ type: 'date', value: msg.createdAt });
        lastDate = msgDate;
      }
      groups.push({ type: 'message', value: msg });
    });

    return groups;
  }, [messages]);

  if (!isOpen) return null;

  const renderHeader = () => (
    <div className="flex items-center justify-between p-4 border-b border-neutral-800 bg-neutral-900/80">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {otherUser?.profilePicture ? (
          <img
            src={otherUser.profilePicture}
            alt={otherUser.name}
            className="w-10 h-10 rounded-full object-cover ring-2 ring-neutral-700"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-600 to-violet-700 flex items-center justify-center text-white font-semibold text-sm">
            {getInitials(otherUser)}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white truncate">
            {otherUser?.name || 'User'}
          </h3>
          {property && (
            <p className="text-xs text-gray-500 truncate">{property.title}</p>
          )}
        </div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-neutral-800 text-gray-400 hover:text-white transition-colors"
          aria-label="Close chat"
        >
          <X size={20} />
        </button>
      )}
    </div>
  );

  const renderMessageBubble = (msg) => {
    const senderId = (msg.sender?._id || msg.sender)?.toString?.();
    const isOwnMessage =
      senderId &&
      currentUserId &&
      String(senderId) === String(currentUserId);

    return (
      <div
        key={msg._id}
        className={`flex gap-2.5 items-end ${
          isOwnMessage ? 'flex-row-reverse' : ''
        }`}
      >
        {!isOwnMessage && (
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-violet-700 flex items-center justify-center text-white text-xs font-semibold">
            {otherUser?.profilePicture ? (
              <img
                src={otherUser.profilePicture}
                alt=""
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              getInitials(otherUser)
            )}
          </div>
        )}
        <div
          className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
            isOwnMessage
              ? 'bg-gradient-to-r from-violet-600 to-violet-500 text-white rounded-br-md'
              : 'bg-neutral-800 text-gray-100 border border-neutral-700 rounded-bl-md'
          }`}
        >
          <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
          <div
            className={`flex items-center gap-1 mt-1 text-xs ${
              isOwnMessage ? 'text-violet-200' : 'text-gray-500'
            }`}
          >
            <Clock size={10} />
            <span>{formatTime(msg.createdAt)}</span>
          </div>
        </div>
        {isOwnMessage && (
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-neutral-700 flex items-center justify-center">
            <User size={14} className="text-gray-400" />
          </div>
        )}
      </div>
    );
  };

  if (inline) {
    return (
      <div className="flex flex-col h-full">
        {renderHeader()}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-neutral-950/50">
          {error && (
            <div className="rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm p-3 mb-4">
              {error}
            </div>
          )}
          {messages.length === 0 && !loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-neutral-800 flex items-center justify-center mb-4">
                <MessageCircle size={32} className="text-neutral-600" />
              </div>
              <p className="text-gray-400 mb-1">No messages yet</p>
              <p className="text-sm text-gray-500">Start the conversation!</p>
            </div>
          ) : (
            <>
              {messagesWithDateGroups.map((item, idx) =>
                item.type === 'date' ? (
                  <div
                    key={`date-${idx}`}
                    className="flex items-center justify-center py-2"
                  >
                    <span className="text-xs text-gray-500 bg-neutral-800/80 px-3 py-1 rounded-full">
                      {formatDateSeparator(item.value)}
                    </span>
                  </div>
                ) : (
                  renderMessageBubble(item.value)
                )
              )}
              {loading && messages.length === 0 && (
                <div className="flex justify-center py-8">
                  <div className="loader-dots">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
        <div className="p-4 border-t border-neutral-800 bg-neutral-900/80">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              className="flex-1 px-4 py-3 rounded-xl border border-neutral-700 bg-neutral-800 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all"
              disabled={sending}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || sending}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
            >
              <Send size={18} />
              <span className="hidden sm:inline">Send</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl h-[85vh] max-h-[700px] rounded-2xl border border-neutral-800 bg-neutral-900 flex flex-col shadow-2xl overflow-hidden">
        {renderHeader()}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-neutral-950/50">
          {error && (
            <div className="rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm p-3 mb-4">
              {error}
            </div>
          )}
          {messages.length === 0 && !loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-neutral-800 flex items-center justify-center mb-4">
                <MessageCircle size={32} className="text-neutral-600" />
              </div>
              <p className="text-gray-400 mb-1">No messages yet</p>
              <p className="text-sm text-gray-500">Start the conversation!</p>
            </div>
          ) : (
            <>
              {messagesWithDateGroups.map((item, idx) =>
                item.type === 'date' ? (
                  <div
                    key={`date-${idx}`}
                    className="flex items-center justify-center py-2"
                  >
                    <span className="text-xs text-gray-500 bg-neutral-800/80 px-3 py-1 rounded-full">
                      {formatDateSeparator(item.value)}
                    </span>
                  </div>
                ) : (
                  renderMessageBubble(item.value)
                )
              )}
              {loading && messages.length === 0 && (
                <div className="flex justify-center py-8">
                  <div className="loader-dots">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
        <div className="p-4 border-t border-neutral-800 bg-neutral-900/80">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              className="flex-1 px-4 py-3 rounded-xl border border-neutral-700 bg-neutral-800 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all"
              disabled={sending}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || sending}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
            >
              <Send size={18} />
              <span className="hidden sm:inline">Send</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
