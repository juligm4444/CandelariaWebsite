import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tokens, setTokens] = useState({
    access: localStorage.getItem('access_token'),
    refresh: localStorage.getItem('refresh_token'),
  });

  // Configure axios defaults
  useEffect(() => {
    if (tokens.access) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${tokens.access}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [tokens.access]);

  // Load user on mount if tokens exist
  useEffect(() => {
    if (tokens.access) {
      loadUser();
    } else {
      setLoading(false);
    }
  }, []);

  // Auto-refresh token before expiry
  useEffect(() => {
    if (!tokens.access || !tokens.refresh) return;

    // Refresh token every 50 minutes (tokens expire in 1 hour)
    const refreshInterval = setInterval(() => {
      refreshAccessToken();
    }, 50 * 60 * 1000);

    return () => clearInterval(refreshInterval);
  }, [tokens.refresh]);

  const loadUser = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/auth/me/');
      setUser(response.data.member);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load user:', error);
      // If token is invalid, clear it
      if (error.response?.status === 401) {
        logout();
      }
      setLoading(false);
    }
  };

  const refreshAccessToken = async () => {
    try {
      const response = await axios.post('http://localhost:8000/api/token/refresh/', {
        refresh: tokens.refresh,
      });

      const newAccessToken = response.data.access;
      const newRefreshToken = response.data.refresh || tokens.refresh;

      localStorage.setItem('access_token', newAccessToken);
      localStorage.setItem('refresh_token', newRefreshToken);

      setTokens({
        access: newAccessToken,
        refresh: newRefreshToken,
      });

      axios.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
    } catch (error) {
      console.error('Failed to refresh token:', error);
      logout();
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post('http://localhost:8000/api/auth/register/', userData);

      const { member, tokens: newTokens } = response.data;

      // Save tokens
      localStorage.setItem('access_token', newTokens.access);
      localStorage.setItem('refresh_token', newTokens.refresh);

      setTokens({
        access: newTokens.access,
        refresh: newTokens.refresh,
      });

      setUser(member);

      return { success: true, member };
    } catch (error) {
      console.error('Registration failed:', error);
      return {
        success: false,
        error: error.response?.data || 'Registration failed',
      };
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post('http://localhost:8000/api/auth/login/', {
        email,
        password,
      });

      const { member, tokens: newTokens } = response.data;

      // Save tokens
      localStorage.setItem('access_token', newTokens.access);
      localStorage.setItem('refresh_token', newTokens.refresh);

      setTokens({
        access: newTokens.access,
        refresh: newTokens.refresh,
      });

      setUser(member);

      return { success: true, member };
    } catch (error) {
      console.error('Login failed:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Login failed',
      };
    }
  };

  const logout = async () => {
    try {
      if (tokens.refresh) {
        await axios.post('http://localhost:8000/api/auth/logout/', {
          refresh: tokens.refresh,
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear tokens and user regardless of API call success
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      delete axios.defaults.headers.common['Authorization'];
      setTokens({ access: null, refresh: null });
      setUser(null);
    }
  };

  const checkEmailAvailability = async (email) => {
    try {
      const response = await axios.get(
        `http://localhost:8000/api/auth/check-email/?email=${email}`
      );
      return response.data;
    } catch (error) {
      console.error('Email check failed:', error);
      return { can_register: false, error: 'Failed to check email' };
    }
  };

  const changePassword = async (oldPassword, newPassword) => {
    try {
      const response = await axios.put('http://localhost:8000/api/auth/change-password/', {
        old_password: oldPassword,
        new_password: newPassword,
      });
      return { success: true, message: response.data.message };
    } catch (error) {
      console.error('Password change failed:', error);
      return {
        success: false,
        error: error.response?.data || 'Password change failed',
      };
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    isTeamLeader: user?.is_team_leader || false,
    register,
    login,
    logout,
    checkEmailAvailability,
    changePassword,
    refreshAccessToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
