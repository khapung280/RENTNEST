import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { conversationService } from '../services/aiService';
import ChatWindow from './ChatWindow';

const ContactOwnerButton = ({ property, owner, currentUserId }) => {
  const navigate = useNavigate();
  const [showChat, setShowChat] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleContactOwner = async () => {
    if (!currentUserId) {
      setError('Please log in to contact the owner');
      // Redirect to login after a short delay
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      return;
    }

    if (!owner || !owner._id) {
      setError('Owner information not available');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Check if conversation already exists or create new one
      const response = await conversationService.create(
        owner._id,
        property?._id || property?.id,
        'renter_owner'
      );

      if (response.success) {
        setConversationId(response.data._id);
        setShowChat(true);
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
      setError('Failed to start conversation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={handleContactOwner}
        disabled={loading}
        className="w-full bg-zinc-800 text-white border border-zinc-700 font-medium py-3 px-6 rounded-xl hover:bg-zinc-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        <MessageCircle size={20} />
        {loading ? 'Starting conversation...' : 'Contact Owner'}
      </button>

      {error && (
        <div className="mt-2 text-sm text-red-400">{error}</div>
      )}

      {showChat && conversationId && (
        <ChatWindow
          isOpen={showChat}
          onClose={() => {
            setShowChat(false);
          }}
          conversationId={conversationId}
          otherUser={owner}
          property={property}
          currentUserId={currentUserId}
        />
      )}
    </>
  );
};

export default ContactOwnerButton;

