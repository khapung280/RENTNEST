import { useState, useEffect } from 'react';
import { MessageCircle, User, Home } from 'lucide-react';
import { conversationService } from '../services/aiService';
import ChatWindow from '../components/ChatWindow';
import { getCurrentUserId } from '../utils/auth';

const Messages = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [error, setError] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    // Get current user ID from token
    const userId = getCurrentUserId();
    if (userId) {
      setCurrentUserId(userId);
      loadConversations();
    } else {
      setError('Please log in to view messages');
      setLoading(false);
    }
  }, []);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const response = await conversationService.getAll('renter_owner');
      if (response.success) {
        setConversations(response.data.data || []);
        // Extract current user ID from first conversation if available
        if (response.data.data && response.data.data.length > 0) {
          // This is a workaround - ideally get from auth context
          const firstConv = response.data.data[0];
          if (firstConv.participants && firstConv.participants.length > 0) {
            // We'll need to get current user from auth context
            // For now, we'll handle it in ChatWindow
          }
        }
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
      setError('Failed to load conversations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleConversationClick = (conversation) => {
    // Get the other participant (not current user)
    const otherUser = conversation.participants.find(
      p => {
        const userId = p._id?.toString() || p.toString();
        return userId !== currentUserId;
      }
    ) || conversation.participants[0];
    
    setSelectedConversation({
      ...conversation,
      otherUser: otherUser || conversation.participants[0]
    });
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-3 h-[600px]">
            {/* Conversations List */}
            <div className="border-r border-gray-200 overflow-y-auto">
              <div className="bg-blue-600 text-white p-4 flex items-center gap-2">
                <MessageCircle size={20} />
                <h2 className="font-semibold">Messages</h2>
              </div>

              {loading ? (
                <div className="text-center text-gray-500 py-8">
                  <p>Loading conversations...</p>
                </div>
              ) : error ? (
                <div className="p-4 text-red-600 text-sm">{error}</div>
              ) : conversations.length === 0 ? (
                <div className="text-center text-gray-500 py-8 px-4">
                  <MessageCircle size={48} className="mx-auto mb-4 text-gray-300" />
                  <p className="font-medium mb-2">No conversations yet</p>
                  <p className="text-sm">Start a conversation from a property page</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {conversations.map((conversation) => {
                    const otherUser = conversation.participants.find(
                      p => {
                        const userId = p._id?.toString() || p.toString();
                        return userId !== currentUserId;
                      }
                    ) || conversation.participants[0];

                    return (
                      <button
                        key={conversation._id}
                        onClick={() => handleConversationClick(conversation)}
                        className="w-full p-4 hover:bg-gray-50 transition-colors text-left"
                      >
                        <div className="flex gap-3">
                          {/* Avatar */}
                          <div className="flex-shrink-0">
                            {otherUser?.profilePicture ? (
                              <img
                                src={otherUser.profilePicture}
                                alt={otherUser.name}
                                className="w-12 h-12 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                                <User size={20} className="text-gray-500" />
                              </div>
                            )}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-1">
                              <h3 className="font-semibold text-gray-900 truncate">
                                {otherUser?.name || 'User'}
                              </h3>
                              {conversation.lastMessageAt && (
                                <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                                  {formatTime(conversation.lastMessageAt)}
                                </span>
                              )}
                            </div>
                            
                            {conversation.property && (
                              <div className="flex items-center gap-1 text-xs text-gray-600 mb-1">
                                <Home size={12} />
                                <span className="truncate">{conversation.property.title}</span>
                              </div>
                            )}
                            
                            <p className="text-sm text-gray-600 truncate">
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

            {/* Chat Area */}
            <div className="md:col-span-2 flex flex-col">
              {selectedConversation ? (
                <ChatWindow
                  isOpen={true}
                  onClose={() => {
                    setSelectedConversation(null);
                    loadConversations();
                  }}
                  conversationId={selectedConversation._id}
                  otherUser={selectedConversation.otherUser}
                  property={selectedConversation.property}
                  currentUserId={currentUserId}
                />
              ) : (
                <div className="flex-1 flex items-center justify-center bg-gray-50">
                  <div className="text-center text-gray-500">
                    <MessageCircle size={64} className="mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium mb-2">Select a conversation</p>
                    <p className="text-sm">Choose a conversation from the list to start messaging</p>
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

