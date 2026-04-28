import axios from 'axios';

// Configuración base de axios apuntando al backend hosteado en Render
const axiosInstance = axios.create({
  baseURL: 'https://backend-sistema-contable.onrender.com', 
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosInstance;
