import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5004/api', // Puerto de tu API
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;