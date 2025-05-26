
"use client";

import type { User } from '@/lib/types';
import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { useRouter } from 'next/navigation';

export interface RegisterData {
  name: string;
  username: string;
  email: string;
  password: string;
  gender: "male" | "female" | "other" | "prefer_not_to_say";
  studentType: "primary_school" | "secondary_school" | "high_school" | "preparatory_school" | "university" | "college";

  // University/College specific
  institutionNameSelection?: string;
  otherInstitutionName?: string;
  departmentSelection?: string;
  otherDepartment?: string;

  // Primary, Secondary, High School, Preparatory specific
  schoolName?: string;
  gradeLevel?: string;

  // genericInstitutionName and genericStudyDetails removed as 'other_level' is removed
}


interface AuthContextType {
  user: User | null;
  isSubscribed: boolean;
  loading: boolean;
  login: (email: string) => void;
  logout: () => void;
  register: (data: RegisterData) => void;
  toggleSubscription: () => void;
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
    const storedUser = localStorage.getItem('examPrepUser');
    let existingUserDetails: Partial<User> = {};
    if (storedUser) {
      try {
        const parsedUser: User = JSON.parse(storedUser);
        if (parsedUser.email === email) {
          existingUserDetails = parsedUser;
        }
      } catch (e) { console.error("Error parsing stored user for login:", e)}
    }
    const mockUser: User = {
        id: '1',
        email,
        name: existingUserDetails.name || email.split('@')[0],
        username: existingUserDetails.username,
        gender: existingUserDetails.gender,
        studentType: existingUserDetails.studentType,
        institutionName: existingUserDetails.institutionName,
        department: existingUserDetails.department,
        gradeLevel: existingUserDetails.gradeLevel,
        // studyDetails: existingUserDetails.studyDetails, // Removed
        image: existingUserDetails.image,
    };
    setUser(mockUser);
    localStorage.setItem('examPrepUser', JSON.stringify(mockUser));
    router.push('/dashboard');
  };

  const register = (data: RegisterData) => {
    const newUser: User = {
      id: Date.now().toString(),
      email: data.email,
      name: data.name,
      username: data.username,
      gender: data.gender,
      studentType: data.studentType,
    };

    switch (data.studentType) {
      case 'university':
      case 'college':
        newUser.institutionName = data.institutionNameSelection === 'Other' ? data.otherInstitutionName : data.institutionNameSelection;
        newUser.department = data.departmentSelection === 'Other' ? data.otherDepartment : data.departmentSelection;
        break;
      case 'primary_school':
      case 'secondary_school':
      case 'high_school':
      case 'preparatory_school':
        newUser.institutionName = data.schoolName;
        newUser.gradeLevel = data.gradeLevel;
        break;
      // 'other_level' case removed
    }

    setUser(newUser);
    localStorage.setItem('examPrepUser', JSON.stringify(newUser));
    router.push('/dashboard');
  };

  const logout = () => {
    setUser(null);
    setIsSubscribed(false);
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
