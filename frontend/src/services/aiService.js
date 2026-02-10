// ============================================
// API SERVICES FILE
// ============================================
// This file contains all services that talk to backend API:
// - AI Service: Chatbot and property search
// - Conversation Service: User conversations
// - Message Service: Sending messages
// - Property Service: Property operations
// - Booking Service: Booking operations

// Import Axios to make API calls
import axios from 'axios';

// Set backend API base URL from environment (Render backend); fallback for production
const API = import.meta.env.VITE_API_URL || "https://rentnest-backend-wpqh.onrender.com";

// Helper function to get token from browser storage
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Create Axios instance for API calls
const api = axios.create({
  baseURL: `${API}/api`,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Automatically add token to every API request
// This way we don't need to add token manually in each function
api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;  // Add token to header
  }
  return config;
});

// ============================================
// AI SERVICE - Chatbot and AI Search
// ============================================
export const aiService = {
  
  // Search properties using natural language
  // Example: "Find 2 bedroom house in Kathmandu"
  // Sends user's question to backend AI, returns matching properties
  search: async (query) => {
    const response = await api.post('/ai/search', { query });
    return response.data;
  },

  // Chat with AI assistant
  // User sends message, AI responds with helpful information
  // conversationId: Optional - to continue same conversation
  chat: async (message, conversationId = null) => {
    const body = { message };
    if (conversationId) {
      body.conversationId = conversationId;  // Continue existing chat
    }
    const response = await api.post('/ai/chat', body);
    return response.data;
  }
};

// ============================================
// CONVERSATION SERVICE - Manage Conversations
// ============================================
export const conversationService = {
  
  // Create new conversation between users
  // participantId: Other user's ID (renter or owner)
  // propertyId: Property they're talking about
  // type: 'renter_owner' (user chat) or 'ai_chat' (AI chat)
  create: async (participantId = null, propertyId = null, type = 'renter_owner') => {
    const response = await api.post('/conversations', {
      participantId,
      propertyId,
      type
    });
    return response.data;
  },

  // Get all conversations for current user
  // type: Optional - filter by conversation type
  getAll: async (type = null) => {
    const params = type ? { type } : {};
    const response = await api.get('/conversations', { params });
    return response.data;
  },

  // Get one specific conversation by ID
  getById: async (id) => {
    const response = await api.get(`/conversations/${id}`);
    return response.data;
  }
};

// ============================================
// MESSAGE SERVICE - Send and Get Messages
// ============================================
export const messageService = {
  
  // Send a message in a conversation
  // conversationId: Which conversation
  // content: Message text
  send: async (conversationId, content) => {
    const response = await api.post('/messages', {
      conversationId,
      content
    });
    return response.data;
  },

  // Get all messages from a conversation
  // conversationId: Which conversation
  // page: Page number (for pagination)
  // limit: How many messages per page
  getByConversation: async (conversationId, page = 1, limit = 50) => {
    const response = await api.get('/messages', {
      params: { conversationId, page, limit }
    });
    return response.data;
  },

  // Mark message as read (user has seen it)
  markAsRead: async (messageId) => {
    const response = await api.put(`/messages/${messageId}/read`);
    return response.data;
  }
};

// ============================================
// PROPERTY SERVICE - Property Operations
// ============================================
export const propertyService = {
  
  // Get all properties with filters
  // filters: Can filter by type, location, price, bedrooms, etc.
  getAll: async (filters = {}) => {
    const response = await api.get('/properties', { params: filters });
    return response.data;
  },

  // Get one property by ID (for property detail page)
  getById: async (id) => {
    const response = await api.get(`/properties/${id}`);
    return response.data;
  },

  // Create new property (Owner only)
  // propertyData: Property details (title, location, price, etc.)
  create: async (propertyData) => {
    const response = await api.post('/properties', propertyData);
    return response.data;
  },

  // Update existing property (Owner/Admin only)
  // id: Property ID to update
  // propertyData: New property details
  update: async (id, propertyData) => {
    const response = await api.put(`/properties/${id}`, propertyData);
    return response.data;
  },

  // Delete property (Owner/Admin only)
  delete: async (id) => {
    const response = await api.delete(`/properties/${id}`);
    return response.data;
  },

  // Get all properties owned by current user
  getMyProperties: async () => {
    const response = await api.get('/properties/owner/my-properties');
    return response.data;
  }
};

// ============================================
// BOOKING SERVICE - Booking Operations
// ============================================
export const bookingService = {
  
  // Get all bookings (filtered by user role)
  // Renters see their bookings, Owners see bookings for their properties
  getAll: async (filters = {}) => {
    const response = await api.get('/bookings', { params: filters });
    return response.data;
  },

  // Get one booking by ID
  getById: async (id) => {
    const response = await api.get(`/bookings/${id}`);
    return response.data;
  },

  // Create new booking request (Renter only)
  // bookingData: Property ID, duration, move-in date, etc.
  create: async (bookingData) => {
    const response = await api.post('/bookings', bookingData);
    return response.data;
  },

  // Get all bookings for owner's properties
  getOwnerBookings: async () => {
    const response = await api.get('/bookings/owner/my-bookings');
    return response.data;
  },

  // Get all bookings made by renter
  getMyBookings: async () => {
    const response = await api.get('/bookings/my-bookings');
    return response.data;
  },

  // Approve booking (Owner/Admin only)
  // id: Booking ID to approve
  // ownerNotes: Optional message to renter
  approve: async (id, ownerNotes = '') => {
    const response = await api.put(`/bookings/${id}/approve`, { ownerNotes });
    return response.data;
  },

  // Reject booking (Owner/Admin only)
  // id: Booking ID to reject
  // ownerNotes: Optional rejection reason
  reject: async (id, ownerNotes = '') => {
    const response = await api.put(`/bookings/${id}/reject`, { ownerNotes });
    return response.data;
  },

  // Cancel booking (Renter only)
  // id: Booking ID to cancel
  cancel: async (id) => {
    const response = await api.put(`/bookings/${id}/cancel`);
    return response.data;
  }
};

