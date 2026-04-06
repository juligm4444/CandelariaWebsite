import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_URL } from '../lib/config';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tokens, setTokens] = useState({
    access: localStorage.getItem('access_token'),
    refresh: localStorage.getItem('refresh_token'),
  });
  const [skipLoadUser, setSkipLoadUser] = useState(false);

  const logout = useCallback(async () => {
    try {
      if (tokens.refresh) {
        await axios.post(`${API_URL}/auth/logout/`, {
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
  }, [tokens.refresh]);

  const loadUser = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/auth/me/`);
      setUser(response.data.member);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load user:', error);
      // Only logout if token is invalid (401), not on network errors or other issues
      if (error.response?.status === 401) {
        console.log('Token is invalid, logging out...');
        logout();
      } else {
        // For other errors (network issues, server errors), just set loading to false
        // but keep the user logged in
        console.log('Network or server error, keeping user logged in');
        setLoading(false);
      }
    }
  }, [logout]);

  const refreshAccessToken = useCallback(async () => {
    try {
      const response = await axios.post(`${API_URL}/token/refresh/`, {
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
      // Only logout if refresh token is actually invalid (401)
      // Not on network errors
      if (error.response?.status === 401) {
        console.log('Refresh token is invalid, logging out...');
        logout();
      } else {
        console.log('Failed to refresh token due to network/server error, will retry later');
      }
    }
  }, [logout, tokens.refresh]);

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
    if (skipLoadUser) {
      setSkipLoadUser(false);
      setLoading(false);
      return;
    }

    if (tokens.access) {
      loadUser();
    } else {
      setLoading(false);
    }
  }, [loadUser, tokens.access, skipLoadUser]);

  // Auto-refresh token before expiry
  useEffect(() => {
    if (!tokens.access || !tokens.refresh) return undefined;

    // Refresh token every 50 minutes (tokens expire in 1 hour)
    const refreshInterval = setInterval(
      () => {
        refreshAccessToken();
      },
      50 * 60 * 1000
    );

    return () => clearInterval(refreshInterval);
  }, [refreshAccessToken, tokens.access, tokens.refresh]);

  const register = async (userData) => {
    try {
      const response = await axios.post(`${API_URL}/auth/register/`, userData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const { member, tokens: newTokens } = response.data;

      // Save tokens
      localStorage.setItem('access_token', newTokens.access);
      localStorage.setItem('refresh_token', newTokens.refresh);

      // Set user first
      setUser(member);

      // Mark to skip loadUser on next token change
      setSkipLoadUser(true);

      // Then update tokens
      setTokens({
        access: newTokens.access,
        refresh: newTokens.refresh,
      });

      // Set loading to false
      setLoading(false);

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
      const response = await axios.post(`${API_URL}/auth/login/`, {
        email,
        password,
      });

      const { member, tokens: newTokens } = response.data;

      // Save tokens
      localStorage.setItem('access_token', newTokens.access);
      localStorage.setItem('refresh_token', newTokens.refresh);

      // Set user first
      setUser(member);

      // Mark to skip loadUser on next token change
      setSkipLoadUser(true);

      // Then update tokens
      setTokens({
        access: newTokens.access,
        refresh: newTokens.refresh,
      });

      // Set loading to false
      setLoading(false);

      return { success: true, member };
    } catch (error) {
      console.error('Login failed:', error);
      return {
        success: false,
        errorCode: error.response?.data?.code || null,
        error: error.response?.data?.error || 'Login failed',
      };
    }
  };

  const checkEmailAvailability = async (email) => {
    try {
      const response = await axios.get(
        `${API_URL}/auth/check-email/?email=${encodeURIComponent(email)}`
      );
      return response.data;
    } catch (error) {
      console.error('Email check failed:', error);
      return { can_register: false, error: 'Failed to check email' };
    }
  };

  const changePassword = async (oldPassword, newPassword) => {
    try {
      const response = await axios.put(`${API_URL}/auth/change-password/`, {
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

  const forgotPassword = async (email) => {
    try {
      const response = await axios.post(`${API_URL}/auth/forgot-password/`, {
        email,
      });
      return { success: true, message: response.data.message };
    } catch (error) {
      console.error('Forgot password request failed:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Could not send reset email',
      };
    }
  };

  const resetPassword = async (uid, token, newPassword) => {
    try {
      const response = await axios.post(`${API_URL}/auth/reset-password/`, {
        uid,
        token,
        new_password: newPassword,
      });
      return { success: true, message: response.data.message };
    } catch (error) {
      console.error('Password reset failed:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Could not reset password',
      };
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    isInternal: !!user?.is_internal,
    isExternal: !!user && !user?.is_internal,
    internalRole: user?.internal_role || null,
    isTeamLeader: user?.is_team_leader || false,
    canManageTeam: !!(user?.is_internal && (user?.is_team_leader || user?.is_coleader)),
    canCreatePosts: !!user?.is_internal,
    canMakePayments: !!user,
    register,
    login,
    logout,
    checkEmailAvailability,
    changePassword,
    forgotPassword,
    resetPassword,
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
