import { ref } from 'vue';

// Use ref to store authentication state, initialized to false (not logged in)
export const isAuthenticated = ref(false);

// Hardcoded user credentials for demonstration purposes
const HARDCODED_USERNAME = 'user';
const HARDCODED_PASSWORD = 'password';

/**
 * Simulates user login functionality.
 * @param {string} username - The username provided by the user.
 * @param {string} password - The password provided by the user.
 * @returns {boolean} - Returns true if login is successful, otherwise false.
 */
export function login(username, password) {
  if (username === HARDCODED_USERNAME && password === HARDCODED_PASSWORD) {
    isAuthenticated.value = true; // Set authentication state to true
    console.log('Login successful!');
    return true;
  } else {
    isAuthenticated.value = false; 
    console.log('Login failed: Invalid credentials.');
    return false;
  }
}

export function logout() {
  isAuthenticated.value = false; 
  console.log('Logged out successfully!');
}
