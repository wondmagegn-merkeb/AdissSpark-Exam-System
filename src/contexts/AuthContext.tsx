
"use client";

import type { User, Institution, InstitutionType as AdminInstitutionType } from '@/lib/types';
import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { INSTITUTIONS_STORAGE_KEY, STUDENT_TYPE_TO_ADMIN_INSTITUTION_TYPE_MAP, type StudentTypeFromRegistrationForm } from '@/lib/constants';


export interface RegisterData {
  name: string;
  username: string;
  email: string;
  password: string;
  gender: "male" | "female" | "other" | "prefer_not_to_say";
  studentType: StudentTypeFromRegistrationForm; // "Primary School", "University", etc.

  // University/College specific
  institutionNameSelection?: string;
  otherInstitutionName?: string;
  departmentSelection?: string;
  otherDepartment?: string;

  // Primary, Secondary, High School, Preparatory specific
  schoolNameSelection?: string; 
  otherSchoolName?: string; 
  gradeLevel?: string;
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
        image: existingUserDetails.image,
    };
    setUser(mockUser);
    localStorage.setItem('examPrepUser', JSON.stringify(mockUser));
    router.push('/dashboard');
  };

  const register = (data: RegisterData) => {
    // Map form student type (e.g., "Primary School") to storage student type (e.g., "primary_school")
    const userStudentTypeForStorage = data.studentType.toLowerCase().replace(/ /g, '_') as User['studentType'];

    const newUser: User = {
      id: Date.now().toString(),
      email: data.email,
      name: data.name,
      username: data.username,
      gender: data.gender,
      studentType: userStudentTypeForStorage,
    };

    let customInstitutionNameEntered = '';
    let mappedInstitutionType: AdminInstitutionType | null = null;

    switch (data.studentType) {
      case 'University':
      case 'College':
        newUser.institutionName = data.institutionNameSelection === 'Other' ? data.otherInstitutionName : data.institutionNameSelection;
        newUser.department = data.departmentSelection === 'Other' ? data.otherDepartment : data.departmentSelection;
        if (data.institutionNameSelection === 'Other' && data.otherInstitutionName) {
          customInstitutionNameEntered = data.otherInstitutionName;
          mappedInstitutionType = STUDENT_TYPE_TO_ADMIN_INSTITUTION_TYPE_MAP[data.studentType];
        }
        break;
      case 'Primary School':
      case 'Secondary School':
      case 'High School':
      case 'Preparatory School':
        newUser.institutionName = data.schoolNameSelection === 'Other' ? data.otherSchoolName : data.schoolNameSelection;
        newUser.gradeLevel = data.gradeLevel;
         if (data.schoolNameSelection === 'Other' && data.otherSchoolName) {
          customInstitutionNameEntered = data.otherSchoolName;
          mappedInstitutionType = STUDENT_TYPE_TO_ADMIN_INSTITUTION_TYPE_MAP[data.studentType];
        }
        break;
    }

    // Add 'Other' institution to admin list as inactive
    if (customInstitutionNameEntered && mappedInstitutionType) {
      try {
        const storedInstitutions = localStorage.getItem(INSTITUTIONS_STORAGE_KEY);
        let institutions: Institution[] = storedInstitutions ? JSON.parse(storedInstitutions) : [];
        
        const existingInstitution = institutions.find(
          inst => inst.name.toLowerCase() === customInstitutionNameEntered!.toLowerCase() && inst.type === mappedInstitutionType
        );

        if (!existingInstitution) {
          const newInstitutionEntry: Institution = {
            id: `inst-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            name: customInstitutionNameEntered,
            type: mappedInstitutionType,
            context: 'Added via registration', // Default context
            status: 'inactive', // Default status
          };
          institutions.push(newInstitutionEntry);
          localStorage.setItem(INSTITUTIONS_STORAGE_KEY, JSON.stringify(institutions));
          console.log("Added new institution from registration (inactive):", newInstitutionEntry);
        }
      } catch (error) {
        console.error("Error saving new institution from registration to localStorage:", error);
      }
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
