import React, { createContext, useState, useContext, useEffect } from 'react';
import { User, UserRole, AuthContextType } from '../types';
import api from '../services/api';
import toast from 'react-hot-toast';

// Create Auth Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Local storage keys
const USER_STORAGE_KEY = 'business_nexus_user';
const TOKEN_KEY = 'business_nexus_token';

// Map backend user to frontend user format
const mapUser = (backendUser: any): User => ({
  id: backendUser.id || backendUser._id,
  name: backendUser.fullName || backendUser.name,
  email: backendUser.email,
  role: backendUser.role,
  avatarUrl: backendUser.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(backendUser.fullName || backendUser.name)}&background=random`,
  bio: backendUser.bio || '',
  isOnline: true,
  createdAt: backendUser.createdAt || new Date().toISOString()
});

// Auth Provider Component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for stored user on initial load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem(TOKEN_KEY);
        if (token) {
          const res = await api.get('/auth/me');
          if (res.data.success) {
            setUser(mapUser(res.data.data.user));
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_STORAGE_KEY);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  const login = async (email: string, password: string, role?: UserRole): Promise<void> => {
    setIsLoading(true);
    
    try {
      const res = await api.post('/auth/login', { email, password });
      
      if (res.data.success) {
        const mappedUser = mapUser(res.data.data.user);
        
        if (role && mappedUser.role !== role) {
           throw new Error(`Please login via the ${mappedUser.role} portal.`);
        }
        
        setUser(mappedUser);
        localStorage.setItem(TOKEN_KEY, res.data.data.token);
        // Also save user for backward compatibility
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify({ ...mappedUser, token: res.data.data.token }));
        toast.success('Successfully logged in!');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Login failed';
      toast.error(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, role: UserRole): Promise<void> => {
    setIsLoading(true);
    
    try {
      const res = await api.post('/auth/register', { 
        fullName: name, 
        email, 
        password, 
        role 
      });
      
      if (res.data.success) {
        const mappedUser = mapUser(res.data.data.user);
        setUser(mappedUser);
        localStorage.setItem(TOKEN_KEY, res.data.data.token);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify({ ...mappedUser, token: res.data.data.token }));
        toast.success('Account created successfully!');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Registration failed';
      toast.error(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const forgotPassword = async (email: string): Promise<void> => {
    // Note: not implemented in backend yet, keeping mock
    toast.success('Password reset instructions sent to your email');
  };

  const resetPassword = async (token: string, newPassword: string): Promise<void> => {
    // Note: not implemented in backend yet, keeping mock
    toast.success('Password reset successfully');
  };

  const logout = (): void => {
    setUser(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    toast.success('Logged out successfully');
  };

  const updateProfile = async (userId: string, updates: Partial<User>): Promise<void> => {
    try {
      // Assuming updates could include bio, etc.
      // We map the frontend fields to the backend expected fields
      const res = await api.put('/profile/me', updates);
      
      if (res.data.success) {
        // Refetch user to get fully updated info
        const meRes = await api.get('/auth/me');
        if (meRes.data.success) {
            const mappedUser = mapUser(meRes.data.data.user);
            setUser(mappedUser);
            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify({ ...mappedUser, token: localStorage.getItem(TOKEN_KEY) }));
        }
        toast.success('Profile updated successfully');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Profile update failed';
      toast.error(message);
      throw new Error(message);
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    updateProfile,
    isAuthenticated: !!user,
    isLoading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};