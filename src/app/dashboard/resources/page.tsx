
"use client";

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { Resource, User } from '@/lib/types';
import { useAuth } from '@/hooks/useAuth';
import { BookOpen, Video, FileText, Lock, Search, FilterX, Sparkles, ExternalLink } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const RESOURCE_TYPES = ["note", "video", "book"] as const;

// General school subjects for automatic filtering for school students
const SCHOOL_SUBJECTS = [
  "Mathematics", "English", "Physics", "Chemistry", "Biology",
  "Amharic", "Social Studies", "Civics", "General Science", "History", "Geography",
  "Grade 5 Mathematics" // Example of a more specific school subject
];

// Specific courses for university/college students to select from
const UNIVERSITY_COURSES = [
  "Calculus I", "Linear Algebra", "Data Structures", "Algorithms", "Organic Chemistry", "Software Engineering",
  "Classical Mechanics", "Electromagnetism", "Thermodynamics", "Microeconomics", "Macroeconomics",
  "Ethiopian Law", "World History", "Database Systems", "Operating Systems", "Introduction to AI",
  "Human Anatomy", "Physiology", "Biochemistry", "Pharmacology"
];
const COLLEGE_COURSES = [
  "Basic Accounting", "Business Communication", "Marketing Fundamentals", "Office Management",
  "Computer Applications", "Networking Essentials", "Web Design Basics", "Customer Service", "Entrepreneurship"
];

const ALL_UNIVERSITY_COURSES_OPTION = "All University Courses";
const ALL_COLLEGE_COURSES_OPTION = "All College Courses";


const mockResources: Resource[] = [
  { id: 'res1', title: 'Algebra Fundamentals', type: 'note', description: 'Key concepts in basic algebra for high school students.', subjectOrCourse: 'Mathematics', isPremium: false, imageUrl: 'https://placehold.co/600x400.png', contentUrl: '#', dataAiHint: 'algebra notes' },
  { id: 'res2', title: 'Introduction to Ethiopian History', type: 'video', description: 'A video series covering major periods in Ethiopian history.', subjectOrCourse: 'History', isPremium: false, imageUrl: 'https://placehold.co/600x400.png', contentUrl: '#', dataAiHint: 'ethiopian history' },
  { id: 'res3', title: 'Calculus I Workbook (Premium)', type: 'book', description: 'Comprehensive workbook with exercises for Calculus I.', subjectOrCourse: 'Calculus I', isPremium: true, imageUrl: 'https://placehold.co/600x400.png', contentUrl: '#', dataAiHint: 'calculus workbook' },
  { id: 'res4', title: 'Organic Chemistry Notes', type: 'note', description: 'Detailed notes on organic chemistry reactions and mechanisms.', subjectOrCourse: 'Organic Chemistry', isPremium: true, imageUrl: 'https://placehold.co/600x400.png', contentUrl: '#', dataAiHint: 'chemistry notes' },
  { id: 'res5', title: 'Amharic Grammar Basics', type: 'video', description: 'Learn the fundamentals of Amharic grammar.', subjectOrCourse: 'Amharic', isPremium: false, imageUrl: 'https://placehold.co/600x400.png', contentUrl: '#', dataAiHint: 'amharic language' },
  { id: 'res6', title: 'Introduction to Programming with Python', type: 'book', description: 'A beginner-friendly guide to Python programming.', subjectOrCourse: 'Data Structures', isPremium: false, imageUrl: 'https://placehold.co/600x400.png', contentUrl: '#', dataAiHint: 'python programming' }, // Changed to Data Structures for demo
  { id: 'res7', title: 'Cell Biology Explained (Premium)', type: 'video', description: 'Advanced video lectures on cell biology.', subjectOrCourse: 'Physiology', isPremium: true, imageUrl: 'https://placehold.co/600x400.png', contentUrl: '#', dataAiHint: 'cell biology' }, // Changed to Physiology
  { id: 'res8', title: 'Ethiopian Civics and Ethical Education', type: 'note', description: 'Notes for Civics education based on the Ethiopian curriculum.', subjectOrCourse: 'Civics', isPremium: false, imageUrl: 'https://placehold.co/600x400.png', contentUrl: '#', dataAiHint: 'civics education' },
  { id: 'res9', title: 'Microeconomics Principles', type: 'book', description: 'Core principles of microeconomics for university students.', subjectOrCourse: 'Microeconomics', isPremium: false, imageUrl: 'https://placehold.co/600x400.png', contentUrl: '#', dataAiHint: 'economics textbook' },
  { id: 'res10', title: 'General Physics I Lectures', type: 'video', description: 'University-level physics lectures covering mechanics.', subjectOrCourse: 'Classical Mechanics', isPremium: false, imageUrl: 'https://placehold.co/600x400.png', contentUrl: '#', dataAiHint: 'physics lecture' }, // Changed to Classical Mechanics
  { id: 'res11', title: 'Advanced Software Engineering', type: 'book', description: 'Covers advanced topics in software engineering for CS students.', subjectOrCourse: 'Software Engineering', isPremium: true, imageUrl: 'https://placehold.co/600x400.png', contentUrl: '#', dataAiHint: 'software engineering' },
  { id: 'res12', title: 'Ethiopian Grade 5 Mathematics', type: 'note', description: 'Notes based on Ethiopian Grade 5 curriculum.', subjectOrCourse: 'Grade 5 Mathematics', isPremium: false, imageUrl: 'https://placehold.co/600x400.png', contentUrl: '#', dataAiHint: 'primary math' },
  { id: 'res13', title: 'Networking Essentials Guide', type: 'book', description: 'A guide for college students on networking.', subjectOrCourse: 'Networking Essentials', isPremium: false, imageUrl: 'https://placehold.co/600x400.png', contentUrl: '#', dataAiHint: 'computer networking' },
  { id: 'res14', title: 'Constitutional Law Video Series', type: 'video', description: 'An introductory video series on Ethiopian Constitutional Law.', subjectOrCourse: 'Ethiopian Law', isPremium: false, imageUrl: 'https://placehold.co/600x400.png', contentUrl: '#', dataAiHint: 'law justice' },
  { id: 'res15', title: 'Human Anatomy Atlas (Premium)', type: 'book', description: 'A detailed atlas of human anatomy for medical students.', subjectOrCourse: 'Human Anatomy', isPremium: true, imageUrl: 'https://placehold.co/600x400.png', contentUrl: '#', dataAiHint: 'anatomy model' },
  { id: 'res16', title: 'Effective Business Communication', type: 'note', description: 'Notes on improving communication skills in a business environment for college students.', subjectOrCourse: 'Business Communication', isPremium: false, imageUrl: 'https://placehold.co/600x400.png', contentUrl: '#', dataAiHint: 'business meeting' },
];

const getResourceTypeIcon = (type: Resource['type']) => {
  switch (type) {
    case 'note': return <FileText className="h-5 w-5 text-primary" />;
    case 'video': return <Video className="h-5 w-5 text-primary" />;
    case 'book': return <BookOpen className="h-5 w-5 text-primary" />;
    default: return <FileText className="h-5 w-5 text-primary" />;
  }
};

export default function ResourcesPage() {
  const { user, isSubscribed } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<Resource['type'] | 'all'>('all');
  const [selectedSubjectOrCourse, setSelectedSubjectOrCourse] = useState<string>('all'); // 'all' means show all relevant for the user's level

  const relevantCoursesForUser = useMemo(() => {
    if (user?.studentType === 'university') return [ALL_UNIVERSITY_COURSES_OPTION, ...UNIVERSITY_COURSES];
    if (user?.studentType === 'college') return [ALL_COLLEGE_COURSES_OPTION, ...COLLEGE_COURSES];
    return [];
  }, [user?.studentType]);

  useEffect(() => {
    // Reset subject/course selection if student type changes and makes current selection irrelevant
    if (user?.studentType === 'university' && !UNIVERSITY_COURSES.includes(selectedSubjectOrCourse) && selectedSubjectOrCourse !== ALL_UNIVERSITY_COURSES_OPTION) {
      setSelectedSubjectOrCourse(ALL_UNIVERSITY_COURSES_OPTION);
    } else if (user?.studentType === 'college' && !COLLEGE_COURSES.includes(selectedSubjectOrCourse) && selectedSubjectOrCourse !== ALL_COLLEGE_COURSES_OPTION) {
      setSelectedSubjectOrCourse(ALL_COLLEGE_COURSES_OPTION);
    } else if (!['university', 'college'].includes(user?.studentType || '')) {
        // For school students, there's no specific course dropdown, so 'all' is effectively active
        setSelectedSubjectOrCourse('all');
    }
  }, [user?.studentType, selectedSubjectOrCourse]);


  const filteredResources = useMemo(() => {
    return mockResources.filter(resource => {
      const typeMatch = selectedType === 'all' || resource.type === selectedType;
      
      let subjectOrCourseMatch = false;
      if (user?.studentType === 'university') {
        const isGenerallyRelevant = UNIVERSITY_COURSES.includes(resource.subjectOrCourse) || resource.subjectOrCourse === user.department; // Include user's department resources
        if (selectedSubjectOrCourse === ALL_UNIVERSITY_COURSES_OPTION) {
          subjectOrCourseMatch = isGenerallyRelevant;
        } else {
          subjectOrCourseMatch = resource.subjectOrCourse === selectedSubjectOrCourse;
        }
      } else if (user?.studentType === 'college') {
        const isGenerallyRelevant = COLLEGE_COURSES.includes(resource.subjectOrCourse) || resource.subjectOrCourse === user.department; // Include user's department resources
        if (selectedSubjectOrCourse === ALL_COLLEGE_COURSES_OPTION) {
          subjectOrCourseMatch = isGenerallyRelevant;
        } else {
          subjectOrCourseMatch = resource.subjectOrCourse === selectedSubjectOrCourse;
        }
      } else if (user?.studentType && ['primary_school', 'secondary_school', 'high_school', 'preparatory_school'].includes(user.studentType)) {
        subjectOrCourseMatch = SCHOOL_SUBJECTS.includes(resource.subjectOrCourse);
      } else { 
        // If user type is not set or doesn't match, show all non-premium generic resources
        subjectOrCourseMatch = !resource.isPremium;
      }

      const searchTermMatch = searchTerm === '' ||
        resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.subjectOrCourse.toLowerCase().includes(searchTerm.toLowerCase());
        
      return typeMatch && subjectOrCourseMatch && searchTermMatch;
    });
  }, [selectedType, searchTerm, user, selectedSubjectOrCourse]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedType('all');
    if (user?.studentType === 'university') setSelectedSubjectOrCourse(ALL_UNIVERSITY_COURSES_OPTION);
    else if (user?.studentType === 'college') setSelectedSubjectOrCourse(ALL_COLLEGE_COURSES_OPTION);
    else setSelectedSubjectOrCourse('all');
  };
  
  const getRelevantSubjectContext = () => {
    if (!user || !user.studentType) return "all resources";
    if ((user.studentType === 'university' || user.studentType === 'college') && selectedSubjectOrCourse !== 'all' && selectedSubjectOrCourse !== ALL_UNIVERSITY_COURSES_OPTION && selectedSubjectOrCourse !== ALL_COLLEGE_COURSES_OPTION) {
      return `for ${selectedSubjectOrCourse}`;
    }
    if (user.studentType === 'university') {
      return "for university courses";
    }
    if (user.studentType === 'college') {
      return "for college courses";
    }
    if (['primary_school', 'secondary_school', 'high_school', 'preparatory_school'].includes(user.studentType)) {
        return "for general school subjects";
    }
    return "all resources";
  };


  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Study Resources
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Find notes, videos, and books {getRelevantSubjectContext()}.
        </p>
      </div>

      {!isSubscribed && (
        <Alert className="mb-8 border-primary/50 bg-primary/5 text-primary-foreground">
          <Sparkles className="h-5 w-5 text-primary" />
          <AlertTitle className="text-primary">Unlock Premium Resources!</AlertTitle>
          <AlertDescription>
            Upgrade to a premium subscription to access all exclusive content.
            <Button variant="link" className="p-0 h-auto ml-1 text-primary hover:underline" asChild>
                <Link href="/dashboard/payment">Upgrade Now</Link>
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <Card className="mb-8 shadow-md">
        <CardHeader>
          <CardTitle className="text-xl">Filter Resources</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search resources..."
              className="pl-8 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={selectedType} onValueChange={(value) => setSelectedType(value as Resource['type'] | 'all')}>
            <SelectTrigger>
              <SelectValue placeholder="Select Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {RESOURCE_TYPES.map(type => (
                <SelectItem key={type} value={type} className="capitalize">
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {(user?.studentType === 'university' || user?.studentType === 'college') && (
            <Select 
                value={selectedSubjectOrCourse} 
                onValueChange={(value) => setSelectedSubjectOrCourse(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder={`Select ${user.studentType === 'university' ? 'University Course' : 'College Course'}`} />
              </SelectTrigger>
              <SelectContent>
                {relevantCoursesForUser.map(course => (
                  <SelectItem key={course} value={course}>
                    {course}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Button variant="outline" onClick={handleClearFilters} className="w-full lg:w-auto xl:col-start-4">
            <FilterX className="mr-2 h-4 w-4" /> Clear Filters
          </Button>
        </CardContent>
      </Card>

      {filteredResources.length === 0 ? (
        <div className="text-center py-10">
            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-xl font-semibold text-foreground">No Resources Found</p>
            <p className="text-muted-foreground">
                No resources currently match your criteria ({getRelevantSubjectContext()}).
                <br />
                Try adjusting your filters or check back later for new content.
            </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredResources.map((resource) => {
            const canAccess = !resource.isPremium || (resource.isPremium && isSubscribed);
            return (
              <Card key={resource.id} className={`flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-300 ${!canAccess ? 'opacity-70 bg-muted/30' : ''}`}>
                <CardHeader>
                  <div className="relative aspect-[16/9] mb-3">
                    <Image
                      src={resource.imageUrl || `https://placehold.co/600x400.png`}
                      alt={resource.title}
                      fill
                      className="rounded-md object-cover"
                      data-ai-hint={resource.dataAiHint || resource.type}
                    />
                    {resource.isPremium && (
                      <div className="absolute top-2 right-2 bg-primary text-primary-foreground px-2 py-1 text-xs font-semibold rounded-md shadow-md flex items-center">
                        <Lock className="h-3 w-3 mr-1" /> Premium
                      </div>
                    )}
                  </div>
                  <CardTitle className="text-lg leading-tight">{resource.title}</CardTitle>
                   <div className="flex items-center text-xs text-muted-foreground pt-1">
                    {getResourceTypeIcon(resource.type)}
                    <span className="ml-1.5 capitalize">{resource.type}</span>
                    <span className="mx-1.5">·</span>
                    <span>{resource.subjectOrCourse}</span>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-sm text-muted-foreground line-clamp-3">{resource.description}</p>
                </CardContent>
                <CardFooter>
                  {canAccess ? (
                    <Button asChild className="w-full">
                      <Link href={resource.contentUrl || '#'} target={resource.contentUrl && resource.contentUrl !== '#' ? "_blank" : "_self"} rel="noopener noreferrer">
                        {resource.type === 'video' ? 'Watch Video' : resource.type === 'book' ? 'Read Book' : 'View Note'}
                        {resource.contentUrl && resource.contentUrl !== '#' && <ExternalLink className="ml-2 h-4 w-4" />}
                      </Link>
                    </Button>
                  ) : (
                    <Button className="w-full" asChild>
                      <Link href="/dashboard/payment">
                        <Lock className="mr-2 h-4 w-4" />
                        Upgrade to Access
                      </Link>
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
