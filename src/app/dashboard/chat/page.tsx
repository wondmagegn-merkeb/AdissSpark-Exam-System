
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageSquare, Search } from 'lucide-react';
import type { User } from '@/lib/types'; // Assuming User type is defined

// Mock user data - in a real app, this would come from a database
const mockUsers: User[] = [
  { id: 'user2', name: 'Alice Wonderland', email: 'alice@example.com', image: 'https://placehold.co/100x100.png?text=AW' },
  { id: 'user3', name: 'Bob The Builder', email: 'bob@example.com', image: 'https://placehold.co/100x100.png?text=BB' },
  { id: 'user4', name: 'Charlie Brown', email: 'charlie@example.com', image: 'https://placehold.co/100x100.png?text=CB' },
  { id: 'user5', name: 'Diana Prince', email: 'diana@example.com', image: 'https://placehold.co/100x100.png?text=DP' },
  { id: 'user6', name: 'Edward Scissorhands', email: 'edward@example.com', image: 'https://placehold.co/100x100.png?text=ES' },
];

const getInitials = (name?: string | null) => {
  if (!name) return "U";
  const names = name.split(' ');
  if (names.length > 1) {
    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
  }
  return name[0].toUpperCase();
};

export default function ChatListPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState<User[]>(mockUsers);

  useEffect(() => {
    setFilteredUsers(
      mockUsers.filter(user =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm]);

  return (
    <div className="flex flex-col h-[calc(100vh-theme(spacing.24))]">
      <Card className="flex-grow flex flex-col shadow-lg">
        <CardHeader className="border-b">
          <CardTitle className="text-xl text-foreground flex items-center">
            <MessageSquare className="mr-2 h-6 w-6 text-primary" />
            Chats
          </CardTitle>
          <div className="relative mt-2">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search users..."
              className="pl-8 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="flex-grow p-0">
          <ScrollArea className="h-full">
            {filteredUsers.length === 0 ? (
              <div className="flex justify-center items-center h-full p-4">
                <p className="text-muted-foreground">No users found.</p>
              </div>
            ) : (
              <div className="divide-y">
                {filteredUsers.map((user) => (
                  <Link href={`/dashboard/chat/${user.id}`} key={user.id} legacyBehavior>
                    <a className="flex items-center p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                      <Avatar className="h-10 w-10 mr-4">
                        <AvatarImage src={user.image || `https://avatar.vercel.sh/${user.email}.png`} alt={user.name || "User"} data-ai-hint="user avatar" />
                        <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-grow">
                        <p className="font-medium text-foreground">{user.name || 'Unnamed User'}</p>
                        <p className="text-sm text-muted-foreground">{user.email || 'No email'}</p>
                      </div>
                      {/* Placeholder for last message/time if we implement that
                      <div className="text-xs text-muted-foreground">
                        <p>10:30 AM</p>
                        <Badge variant="default" className="mt-1">3</Badge> 
                      </div>
                      */}
                    </a>
                  </Link>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
        {/* Optional: Footer for new chat button or actions 
        <div className="p-4 border-t bg-background">
          <Button className="w-full">
            <Users className="mr-2 h-4 w-4" /> Start New Group Chat (Example)
          </Button>
        </div>
        */}
      </Card>
    </div>
  );
}
