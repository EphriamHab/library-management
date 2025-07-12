/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLoginMutation, useRefreshTokenMutation } from '../store/api';

interface User {
  name: string;
  email: string;
  full_name: string;
  user_type: 'admin' | 'librarian' | 'member';
  roles: string[];
}

interface Member {
  name: string;
  name1: string;
  membership_id: string;
}

interface AuthContextType {
  user: User | null;
  member: Member | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshAccessToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [member, setMember] = useState<Member | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [loginMutation] = useLoginMutation();
  const [refreshTokenMutation] = useRefreshTokenMutation();

  // Load stored tokens on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('access_token');
    const storedRefreshToken = localStorage.getItem('refresh_token');
    const storedUser = localStorage.getItem('user');
    const storedMember = localStorage.getItem('member');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setRefreshToken(storedRefreshToken);
      setUser(JSON.parse(storedUser));
      if (storedMember) {
        setMember(JSON.parse(storedMember));
      }
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await loginMutation({ email, password }).unwrap();

      console.log('Login response:', response);

      // Extract data from the response structure
      const { message: responseData } = response;

      if (responseData.success) {
        const { user: rawUser, member: memberData, tokens } = responseData.data;

        const userData: User = {
          ...rawUser,
          user_type: rawUser.user_type as 'admin' | 'librarian' | 'member',
        };
        setUser(userData);
        setMember(memberData);
        setToken(tokens.access_token);
        setRefreshToken(tokens.refresh_token);
        setIsAuthenticated(true);

        // Store in localStorage
        localStorage.setItem('access_token', tokens.access_token);
        localStorage.setItem('refresh_token', tokens.refresh_token);
        localStorage.setItem('user', JSON.stringify(userData));
        if (memberData) {
          localStorage.setItem('member', JSON.stringify(memberData));
        }
      } else {
        throw new Error(responseData.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshAccessToken = async () => {
    try {
      const storedRefreshToken = localStorage.getItem('refresh_token');
      if (!storedRefreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await refreshTokenMutation({
        refresh_token: storedRefreshToken,
      }).unwrap();

      if (response.success) {
        const { tokens } = response.data;
        setToken(tokens.access_token);
        setRefreshToken(tokens.refresh_token);

        // Update localStorage
        localStorage.setItem('access_token', tokens.access_token);
        localStorage.setItem('refresh_token', tokens.refresh_token);
      } else {
        throw new Error('Token refresh failed');
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout(); // Force logout if refresh fails
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setMember(null);
    setToken(null);
    setRefreshToken(null);
    setIsAuthenticated(false);

    // Clear localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    localStorage.removeItem('member');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        member,
        token,
        refreshToken,
        isAuthenticated,
        isLoading,
        login,
        logout,
        refreshAccessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};