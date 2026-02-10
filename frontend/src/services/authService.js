// ============================================
// AUTHENTICATION SERVICE
// ============================================
// This file handles login, register, and user authentication
// It talks to backend API to check if user is valid

// Import Axios - library to make API calls
import axios from 'axios';

// Set API base URL from environment (Render backend); fallback for production
const API = import.meta.env.VITE_API_URL || "https://rentnest-backend-wpqh.onrender.com";

// Create Axios instance - configured to talk to our backend
const api = axios.create({
  baseURL: `${API}/api`,  // Base URL for all requests
  headers: {
    'Content-Type': 'application/json'  // Tell backend we're sending JSON
  }
});

// Export authentication functions
export const authService = {
  
  // Register new user account
  // Takes user data (name, email, password, etc.) and sends to backend
  // Backend creates new user and returns token
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;  // Return user data and token
  },

  // Login existing user
  // Takes email and password, sends to backend
  // Backend checks if credentials are correct and returns token
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;  // Return user data and token
  },

  // Get current logged-in user information
  // Uses token from localStorage to verify who is logged in
  // Backend checks token and returns user info
  getCurrentUser: async () => {
    // Get token from browser storage
    const token = localStorage.getItem('token');
    
    // If no token, user is not logged in
    if (!token) {
      throw new Error('No token found');
    }
    
    // Send token to backend to get user info
    const response = await api.get('/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`  // Send token to prove identity
      }
    });
    return response.data;
  },

  // Logout user
  // Simply removes token and user data from browser storage
  // No API call needed - just clear storage
  logout: () => {
    localStorage.removeItem('token');  // Remove token
    localStorage.removeItem('user');   // Remove user data
  },

  // Save login information to browser storage
  // Called after successful login/register
  // token: JWT token from backend
  // user: user information (name, email, role)
  setAuth: (token, user) => {
    localStorage.setItem('token', token);  // Save token
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));  // Save user data
    }
  }
};

