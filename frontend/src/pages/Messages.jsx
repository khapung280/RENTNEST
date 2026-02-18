import { useState, useEffect } from 'react';
import { MessageCircle, User, Home, ChevronLeft } from 'lucide-react';
import { conversationService } from '../services/aiService';
import ChatWindow from '../components/ChatWindow';
import { getCurrentUserId } from '../utils/auth';
import { Link } from 'react-router-dom';

const Messages = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [error, setError] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [mobileShowChat, setMobileShowChat] = useState(false);

  useEffect(() => {
    const userId = getCurrentUserId();
    if (userId) {
      setCurrentUserId(String(userId));
      loadConversations();
    } else {
      setError('Please log in to view messages');
      setLoading(false);
    }
  }, []);

  const loadConversations = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await conversationService.getAll('renter_owner');
      if (response.success) {
        setConversations(response.data || []);
      }
    } catch (err) {
      console.error('Error loading conversations:', err);
      setError('Failed to load conversations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getOtherUser = (conversation) => {
    if (!conversation?.participants?.length) return null;
    const curId = String(currentUserId || '');
    const other = conversation.participants.find((p) => {
      const pid = (p?._id || p)?.toString?.() || '';
      return pid && pid !== curId;
    });
    return other || conversation.participants[0];
  };

  const handleConversationClick = (conversation) => {
    const otherUser = getOtherUser(conversation);
    if (!otherUser) return;
    setSelectedConversation({ ...conversation, otherUser });
    setMobileShowChat(true);
  };

  const handleCloseChat = () => {
    setSelectedConversation(null);
    setMobileShowChat(false);
    loadConversations();
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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

  const isSelected = (conv) =>
    selectedConversation?._id && String(selectedConversation._id) === String(conv._id);

  return (
    <div className="min-h-screen bg-neutral-950 text-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Messages</h1>
          <p className="text-gray-400 text-sm mt-1">
            Chat with renters or property owners
          </p>
        </div>

        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/80 backdrop-blur-xl overflow-hidden shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-3 min-h-[calc(100vh-220px)] md:min-h-[680px]">
            {/* Conversations List */}
            <div
              className={`flex flex-col border-r border-neutral-800 md:block ${
                mobileShowChat ? 'hidden' : 'block'
              }`}
            >
              <div className="p-4 border-b border-neutral-800">
                <h2 className="font-semibold text-white flex items-center gap-2">
                  <MessageCircle size={20} className="text-violet-400" />
                  Conversations
                </h2>
              </div>

              <div className="flex-1 overflow-y-auto">
                {loading ? (
                  <div className="p-4 space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="flex gap-3 p-3 rounded-xl animate-pulse"
                      >
                        <div className="w-12 h-12 rounded-full bg-neutral-700" />
                        <div className="flex-1">
                          <div className="h-4 bg-neutral-700 rounded w-3/4 mb-2" />
                          <div className="h-3 bg-neutral-800 rounded w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : error ? (
                  <div className="p-4">
                    <div className="rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 p-4 text-sm">
                      {error}
                    </div>
                    <Link
                      to="/login"
                      className="mt-4 block text-center text-violet-400 hover:text-violet-300 text-sm"
                    >
                      Go to Login
                    </Link>
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                    <div className="w-20 h-20 rounded-full bg-neutral-800 flex items-center justify-center mb-4">
                      <MessageCircle size={40} className="text-neutral-600" />
                    </div>
                    <p className="font-medium text-gray-300 mb-2">
                      No conversations yet
                    </p>
                    <p className="text-sm text-gray-500 max-w-xs">
                      Start a conversation from a property page by clicking
                      &quot;Contact Owner&quot;
                    </p>
                    <Link
                      to="/houses"
                      className="mt-6 text-violet-400 hover:text-violet-300 text-sm font-medium"
                    >
                      Browse properties →
                    </Link>
                  </div>
                ) : (
                  <div className="divide-y divide-neutral-800/50">
                    {conversations.map((conversation) => {
                      const otherUser = getOtherUser(conversation);
                      const selected = isSelected(conversation);

                      return (
                        <button
                          key={conversation._id}
                          onClick={() => handleConversationClick(conversation)}
                          className={`w-full p-4 text-left transition-all duration-200 hover:bg-neutral-800/50 ${
                            selected
                              ? 'bg-violet-500/10 border-l-2 border-violet-500'
                              : ''
                          }`}
                        >
                          <div className="flex gap-3">
                            <div className="flex-shrink-0">
                              {otherUser?.profilePicture ? (
                                <img
                                  src={otherUser.profilePicture}
                                  alt={otherUser.name}
                                  className="w-12 h-12 rounded-full object-cover ring-2 ring-neutral-700"
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-600 to-violet-700 flex items-center justify-center text-white font-semibold text-sm">
                                  {getInitials(otherUser)}
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <h3 className="font-semibold text-white truncate">
                                  {otherUser?.name || 'User'}
                                </h3>
                                {conversation.lastMessageAt && (
                                  <span className="text-xs text-gray-500 flex-shrink-0">
                                    {formatTime(conversation.lastMessageAt)}
                                  </span>
                                )}
                              </div>
                              {conversation.property && (
                                <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                                  <Home size={12} />
                                  <span className="truncate">
                                    {conversation.property.title}
                                  </span>
                                </div>
                              )}
                              <p className="text-sm text-gray-400 truncate">
                                {conversation.lastMessage || 'No messages yet'}
                              </p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Chat Area */}
            <div className="md:col-span-2 flex flex-col bg-neutral-900/50">
              {selectedConversation ? (
                <>
                  {/* Mobile: back button */}
                  <div className="md:hidden flex items-center gap-2 p-3 border-b border-neutral-800">
                    <button
                      onClick={() => setMobileShowChat(false)}
                      className="p-2 -ml-2 rounded-lg hover:bg-neutral-800 text-gray-400"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <span className="text-sm font-medium text-white truncate">
                      {selectedConversation.otherUser?.name || 'Chat'}
                    </span>
                  </div>
                  <ChatWindow
                    isOpen={true}
                    inline={true}
                    onClose={handleCloseChat}
                    conversationId={selectedConversation._id}
                    otherUser={selectedConversation.otherUser}
                    property={selectedConversation.property}
                    currentUserId={currentUserId}
                    onMessageSent={loadConversations}
                  />
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center p-8">
                  <div className="text-center max-w-sm">
                    <div className="w-24 h-24 rounded-full bg-neutral-800 flex items-center justify-center mx-auto mb-6">
                      <MessageCircle size={48} className="text-neutral-600" />
                    </div>
                    <p className="text-lg font-medium text-gray-300 mb-2">
                      Select a conversation
                    </p>
                    <p className="text-sm text-gray-500">
                      Choose a conversation from the list to start messaging
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;
