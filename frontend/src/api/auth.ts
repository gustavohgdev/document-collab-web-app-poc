import api from './axios';
import { AuthResponse, LoginCredentials, RegisterCredentials } from '../types/auth';

export const authApi = {
  login: (credentials: LoginCredentials) =>
    api.post<AuthResponse>('/auth/login/', credentials),

  register: (credentials: RegisterCredentials) =>
    api.post<AuthResponse>('/auth/register/', credentials),

  logout: () => api.post('/auth/logout/')
};
