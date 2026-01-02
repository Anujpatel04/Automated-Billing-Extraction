/**
 * Authentication hook
 * Manages user authentication state and operations
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi, LoginRequest, RegisterRequest } from '@/api/auth.api';

export interface User {
  user_id: string;
  email: string;
  role: 'USER' | 'HR';
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Load user from localStorage on mount
    const storedUser = localStorage.getItem('expense_user');
    const token = localStorage.getItem('expense_token');
    
    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('expense_user');
        localStorage.removeItem('expense_token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (credentials: LoginRequest) => {
    try {
      const response = await authApi.login(credentials);
      if (response.success && response.data) {
        if (!response.data.token || !response.data.user) {
          return { success: false, message: 'Invalid response from server' };
        }
        
        const userData = response.data.user;
        setUser(userData as User);
        localStorage.setItem('expense_token', response.data.token);
        localStorage.setItem('expense_user', JSON.stringify(userData));
        
        if (userData.role === 'HR') {
          navigate('/hr/dashboard');
        } else {
          navigate('/dashboard');
        }
        return { success: true };
      }
      return { success: false, message: response.message || 'Login failed' };
    } catch (error: any) {
      let errorMessage = 'Login failed. Please check your credentials.';
      
      if (error.code === 'ERR_NETWORK' || !error.response) {
        errorMessage = 'Cannot connect to server. Make sure the backend is running on port 8001.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return {
        success: false,
        message: errorMessage,
      };
    }
  };

  const register = async (data: RegisterRequest) => {
    try {
      const response = await authApi.register(data);
      if (response.success && response.data) {
        if (response.data.token && response.data.user) {
          const userData = response.data.user;
          setUser(userData as User);
          localStorage.setItem('expense_token', response.data.token);
          localStorage.setItem('expense_user', JSON.stringify(userData));
          
          if (userData.role === 'HR') {
            navigate('/hr/dashboard');
          } else {
            navigate('/dashboard');
          }
          return { success: true };
        } else {
          return { success: true, message: 'Registration successful. Please log in.' };
        }
      }
      return { success: false, message: response.message || 'Registration failed' };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
      return {
        success: false,
        message: errorMessage,
      };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('expense_token');
    localStorage.removeItem('expense_user');
    navigate('/login');
  };

  const isAuthenticated = () => {
    return user !== null && localStorage.getItem('expense_token') !== null;
  };

  return {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated,
  };
};

