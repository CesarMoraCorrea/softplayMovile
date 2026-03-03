import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

// apuntamos a la URL de Vercel proporcionada (sin el prefijo /api que causa error 404 en esta config de Vercel)
const API_URL = "https://softplay-backend-almc0r68t-cesarmoracorreas-projects.vercel.app";

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.error("Error reading token from AsyncStorage:", e);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Si el backend envía datos de error dentro de la respuesta
    return Promise.reject(error);
  }
);

export default api;
