
"use client";

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { Resource } from '@/lib/types';
import { useAuth } from '@/hooks/useAuth';
import { BookOpen, Video, FileText, Lock, Search, FilterX, Sparkles, ExternalLink } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const RESOURCE_TYPES = ["note", "video", "book"] as const;

const SCHOOL_SUBJECTS = [
  "Mathematics", "English", "Physics", "Chemistry", "Biology",
  "Amharic", "Social Studies", "Civics", "General Science", "History", "Geography"
];
const HIGHER_ED_SUBJECTS = [
  "Engineering", "Medicine", "Business & Economics", "Computer Science",
  "Social Sciences", "Natural Sciences", "Law", "Humanities", "Agriculture"
];

const mockResources: Resource[] = [
  { id: 'res1', title: 'Algebra Fundamentals', type: 'note', description: 'Key concepts in basic algebra for high school students.', subjectOrCourse: 'Mathematics', isPremium: false, imageUrl: 'https://placehold.co/600x400.png', contentUrl: '#', dataAiHint: 'algebra notes' },
  { id: 'res2', title: 'Introduction to Ethiopian History', type: 'video', description: 'A video series covering major periods in Ethiopian history.', subjectOrCourse: 'History', isPremium: false, imageUrl: 'https://placehold.co/600x400.png', contentUrl: '#', dataAiHint: 'ethiopian history' },
  { id: 'res3', title: 'Calculus I Workbook (Premium)', type: 'book', description: 'Comprehensive workbook with exercises for Calculus I.', subjectOrCourse: 'Engineering', isPremium: true, imageUrl: 'https://placehold.co/600x400.png', contentUrl: '#', dataAiHint: 'calculus workbook' },
  { id: 'res4', title: 'Organic Chemistry Notes', type: 'note', description: 'Detailed notes on organic chemistry reactions and mechanisms.', subjectOrCourse: 'Natural Sciences', isPremium: true, imageUrl: 'https://placehold.co/600x400.png', contentUrl: '#', dataAiHint: 'chemistry notes' },
  { id: 'res5', title: 'Amharic Grammar Basics', type: 'video', description: 'Learn the fundamentals of Amharic grammar.', subjectOrCourse: 'Amharic', isPremium: false, imageUrl: 'https://placehold.co/600x400.png', contentUrl: '#', dataAiHint: 'amharic language' },
  { id: 'res6', title: 'Introduction to Programming with Python', type: 'book', description: 'A beginner-friendly guide to Python programming.', subjectOrCourse: 'Computer Science', isPremium: false, imageUrl: 'https://placehold.co/600x400.png', contentUrl: '#', dataAiHint: 'python programming' },
  { id: 'res7', title: 'Cell Biology Explained (Premium)', type: 'video', description: 'Advanced video lectures on cell biology.', subjectOrCourse: 'Medicine', isPremium: true, imageUrl: 'https://placehold.co/600x400.png', contentUrl: '#', dataAiHint: 'cell biology' },
  { id: 'res8', title: 'Ethiopian Civics and Ethical Education', type: 'note', description: 'Notes for Civics education based on the Ethiopian curriculum.', subjectOrCourse: 'Civics', isPremium: false, imageUrl: 'https://placehold.co/600x400.png', contentUrl: '#', dataAiHint: 'civics education' },
  { id: 'res9', title: 'Microeconomics Principles', type: 'book', description: 'Core principles of microeconomics for university students.', subjectOrCourse: 'Business & Economics', isPremium: false, imageUrl: 'https://placehold.co/600x400.png', contentUrl: '#', dataAiHint: 'economics textbook' },
  { id: 'res10', title: 'General Physics I Lectures', type: 'video', description: 'University-level physics lectures covering mechanics.', subjectOrCourse: 'Engineering', isPremium: false, imageUrl: 'https://placehold.co/600x400.png', contentUrl: '#', dataAiHint: 'physics lecture' },
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
  const [selectedSubject, setSelectedSubject] = useState<string>('all');

  const availableSubjectsOrCourses = useMemo(() => {
    if (!user || !user.studentType) return [];
    if (['university', 'college'].includes(user.studentType)) {
      return HIGHER_ED_SUBJECTS;
    }
    return SCHOOL_SUBJECTS;
  }, [user]);

  const filteredResources = useMemo(() => {
    return mockResources.filter(resource => {
      const typeMatch = selectedType === 'all' || resource.type === selectedType;
      const subjectMatch = selectedSubject === 'all' || resource.subjectOrCourse === selectedSubject;
      const searchTermMatch = searchTerm === '' ||
        resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.description.toLowerCase().includes(searchTerm.toLowerCase());
      return typeMatch && subjectMatch && searchTermMatch;
    });
  }, [selectedType, selectedSubject, searchTerm]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedType('all');
    setSelectedSubject('all');
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Study Resources
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Find notes, videos, and books to aid your learning.
        </p>
      </div>

      {!isSubscribed && (
        <Alert className="mb-8 border-primary/50 bg-primary/5 text-primary-foreground">
          <Sparkles className="h-5 w-5 text-primary" />
          <AlertTitle className="text-primary">Unlock Premium Resources!</AlertTitle>
          <AlertDescription>
            Upgrade to a premium subscription to access all exclusive content.
            <Button variant="link" className="p-0 h-auto ml-1 text-primary hover:underline" asChild>
                <Link href="/dashboard/settings">Upgrade Now</Link>
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <Card className="mb-8 shadow-md">
        <CardHeader>
          <CardTitle className="text-xl">Filter Resources</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger>
              <SelectValue placeholder="Select Subject/Course" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subjects/Courses</SelectItem>
              {availableSubjectsOrCourses.map(subject => (
                <SelectItem key={subject} value={subject}>{subject}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleClearFilters} className="w-full lg:w-auto">
            <FilterX className="mr-2 h-4 w-4" /> Clear Filters
          </Button>
        </CardContent>
      </Card>

      {filteredResources.length === 0 ? (
        <div className="text-center py-10">
            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-xl font-semibold text-foreground">No Resources Found</p>
            <p className="text-muted-foreground">
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
                    <Button className="w-full" disabled>
                      <Lock className="mr-2 h-4 w-4" />
                      Upgrade to Access
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

