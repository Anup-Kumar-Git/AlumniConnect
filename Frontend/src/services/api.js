import axios from 'axios';

// Create an instance pointing to your backend URL
const API = axios.create({
  baseURL: 'http://localhost:5000/api', // Adjust this to your server port
});

// Automatically add the JWT token to headers if it exists
API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) {
    req.headers['x-auth-token'] = token;
  }
  return req;
});

// Auto-logout user if token expires (401 Unauthorized)
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('userName');
      localStorage.removeItem('profilePicture');
      window.location.href = '/auth'; // Force to login screen
    }
    return Promise.reject(error);
  }
);

export default API;