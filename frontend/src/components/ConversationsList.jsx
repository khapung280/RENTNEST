import { useState, useEffect } from 'react';
import { MessageCircle, User, Home, Clock } from 'lucide-react';
import { conversationService } from '../services/aiService';
import ChatWindow from './ChatWindow';

const ConversationsList = ({ currentUserId, onClose }) => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const response = await conversationService.getAll('renter_owner');
      if (response.success) {
        setConversations(response.data.data || []);
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
      p => p._id.toString() !== currentUserId && p.toString() !== currentUserId
    );
    
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
    <>
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md h-[600px] flex flex-col">
        {/* Header */}
        <div className="bg-blue-600 text-white p-4 rounded-t-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle size={20} />
            <h2 className="font-semibold">Messages</h2>
          </div>
          <button
            onClick={onClose}
            className="hover:bg-blue-700 rounded p-1 transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
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
                  p => p._id.toString() !== currentUserId && p.toString() !== currentUserId
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
      </div>

      {/* Chat Window */}
      {selectedConversation && (
        <ChatWindow
          isOpen={!!selectedConversation}
          onClose={() => {
            setSelectedConversation(null);
            loadConversations(); // Refresh list when closing
          }}
          conversationId={selectedConversation._id}
          otherUser={selectedConversation.otherUser}
          property={selectedConversation.property}
          currentUserId={currentUserId}
        />
      )}
    </>
  );
};

// Add missing import
import { X } from 'lucide-react';

export default ConversationsList;

