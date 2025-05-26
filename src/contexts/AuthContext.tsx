
"use client";

import type { User } from '@/lib/types';
import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { useRouter } from 'next/navigation';

// Define the shape of the registration data, mirroring the form schema
interface RegisterData {
  name: string;
  username: string;
  email: string;
  // Password is used for form validation but not typically stored directly in User object in this mock
  gender: string;
  institutionName: string;
  studyDetails: string;
}

interface AuthContextType {
  user: User | null;
  isSubscribed: boolean;
  loading: boolean;
  login: (email: string) => void;
  logout: () => void;
  register: (data: RegisterData) => void;
  toggleSubscription: () => void; // For simulating payment
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('examPrepUser');
      const storedSubscription = localStorage.getItem('examPrepSubscription');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      if (storedSubscription) {
        setIsSubscribed(JSON.parse(storedSubscription));
      }
    } catch (error) {
      console.error("Failed to parse auth data from localStorage", error);
      localStorage.removeItem('examPrepUser');
      localStorage.removeItem('examPrepSubscription');
    }
    setLoading(false);
  }, []);

  const login = (email: string) => {
    // Try to get more details from localStorage if this email has registered before
    const storedUser = localStorage.getItem('examPrepUser');
    let existingUserDetails: Partial<User> = {};
    if (storedUser) {
      const parsedUser: User = JSON.parse(storedUser);
      if (parsedUser.email === email) {
        existingUserDetails = parsedUser;
      }
    }
    const mockUser: User = { 
        id: '1', 
        email, 
        name: existingUserDetails.name || email.split('@')[0],
        username: existingUserDetails.username,
        gender: existingUserDetails.gender,
        institutionName: existingUserDetails.institutionName,
        studyDetails: existingUserDetails.studyDetails,
        image: existingUserDetails.image,
    };
    setUser(mockUser);
    localStorage.setItem('examPrepUser', JSON.stringify(mockUser));
    // Forcing redirect to dashboard after state is set
    router.push('/dashboard');
  };

  const register = (data: RegisterData) => {
    const mockUser: User = {
      id: '1', // Replace with actual ID generation in a real app
      email: data.email,
      name: data.name,
      username: data.username,
      gender: data.gender,
      institutionName: data.institutionName,
      studyDetails: data.studyDetails,
    };
    setUser(mockUser);
    localStorage.setItem('examPrepUser', JSON.stringify(mockUser));
     // Forcing redirect to dashboard after state is set
    router.push('/dashboard');
  };

  const logout = () => {
    setUser(null);
    setIsSubscribed(false); // Reset subscription on logout
    localStorage.removeItem('examPrepUser');
    localStorage.removeItem('examPrepSubscription');
    router.push('/login');
  };

  const toggleSubscription = () => {
    setIsSubscribed(prev => {
      const newSubState = !prev;
      localStorage.setItem('examPrepSubscription', JSON.stringify(newSubState));
      return newSubState;
    });
  };

  return (
    <AuthContext.Provider value={{ user, isSubscribed, loading, login, logout, register, toggleSubscription }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
