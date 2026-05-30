import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Dynamically get the Metro bundler IP address for physical device testing
const debuggerHost = Constants.expoConfig?.hostUri;
const localIp = debuggerHost 
? debuggerHost.split(':')[0] 
: (Platform.OS === 'android' ? '10.0.2.2' : 'localhost');

const API_BASE_URL = `http://${localIp}:8001/api`;

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('userToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const configApi = {
  getConfig: () => api.get('/config'),
};

export const authApi = {
  register: (data: any) => api.post('/register', data),
  login: (data: any) => api.post('/login', data),
  googleLogin: (idToken: string) => api.post('/google-login', { id_token: idToken }),
  verifyOtp: (data: any) => api.post('/verify-otp', data),
  resendOtp: (data: any) => api.post('/resend-otp', data),
  forgotPassword: (data: any) => api.post('/forgot-password', data),
  resetPassword: (data: any) => api.post('/reset-password', data),
  logout: () => api.post('/logout'),
};

export const spaceApi = {
  getSpaces: () => api.get('/spaces'),
  searchSpaces: (params: any) => api.get('/spaces', { params }),
  getSpace: (id: string | number) => api.get(`/spaces/${id}`),
  getTrendingAsokoro: () => api.get('/spaces/trending/asokoro'),
  getTrendingWuse: () => api.get('/spaces/trending/wuse'),
  getAiRecommended: () => api.get('/spaces/ai/recommended'),
  aiSearch: (query: string) => api.get('/spaces/ai/search', { params: { query } }),
  getBestValue: () => api.get('/spaces/best/value'),
};

export const bookingApi = {
  getBookings: () => api.get('/bookings'),
  createBooking: (data: any) => api.post('/bookings', data),
};

export const notificationApi = {
  getNotifications: (filter?: 'unread' | 'all') => api.get('/notifications', { params: { filter } }),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (id: string) => api.post(`/notifications/${id}/read`),
  markAllAsRead: () => api.post('/notifications/read-all'),
};
