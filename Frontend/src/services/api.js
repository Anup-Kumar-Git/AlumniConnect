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

export default API;