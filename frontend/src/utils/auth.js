// ============================================
// AUTHENTICATION UTILITY FUNCTIONS
// ============================================
// These functions read user information from the token stored in browser
// They don't make API calls - just read from token

// Get user ID from token
// Token is stored in browser when user logs in
// This function extracts the user ID from that token
export const getCurrentUserId = () => {
  try {
    // Get token from browser storage
    const token = localStorage.getItem('token');
    
    // If no token, user is not logged in
    if (!token) return null;

    // Token format: header.payload.signature (separated by dots)
    // We need the middle part (payload) which has user data
    // split('.') splits into 3 parts, [1] gets the middle part
    const payload = token.split('.')[1];
    
    // If no payload, token is invalid
    if (!payload) return null;

    // Decode the payload
    // atob() decodes base64 string
    // JSON.parse() converts string to object
    const decoded = JSON.parse(atob(payload));
    
    // Return user ID from decoded data
    return decoded.id || decoded.userId || null;
  } catch (error) {
    // If error, return null (token might be invalid)
    console.error('Error decoding token:', error);
    return null;
  }
};

// Get all user information from token
// Returns complete user data (id, email, role, etc.)
export const getCurrentUser = () => {
  try {
    // Get token from browser storage
    const token = localStorage.getItem('token');
    
    // If no token, user not logged in
    if (!token) return null;

    // Get payload (middle part of token)
    const payload = token.split('.')[1];
    
    // If no payload, token invalid
    if (!payload) return null;

    // Decode payload to get user data
    const decoded = JSON.parse(atob(payload));
    
    // Return all user data
    return decoded;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

// Check if user is logged in
// Simply checks if token exists in browser storage
// Returns true if token exists, false if not
export const isAuthenticated = () => {
  // Get token and convert to boolean
  // !! converts to true/false (true if token exists)
  return !!localStorage.getItem('token');
};

