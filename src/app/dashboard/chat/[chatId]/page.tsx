
"use client";

import { useState, useRef, useEffect, FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { Send, ArrowLeft, User as UserIcon, LayoutDashboard } from 'lucide-react';
import { format } from 'date-fns';
import type { User } from '@/lib/types'; // Assuming User type is defined

// Mock user data - in a real app, this would come from a database
const mockUsers: User[] = [
  { id: 'user2', name: 'Alice Wonderland', email: 'alice@example.com', image: 'https://placehold.co/100x100.png?text=AW' },
  { id: 'user3', name: 'Bob The Builder', email: 'bob@example.com', image: 'https://placehold.co/100x100.png?text=BB' },
  { id: 'user4', name: 'Charlie Brown', email: 'charlie@example.com', image: 'https://placehold.co/100x100.png?text=CB' },
  { id: 'user5', name: 'Diana Prince', email: 'diana@example.com', image: 'https://placehold.co/100x100.png?text=DP' },
  { id: 'user6', name: 'Edward Scissorhands', email: 'edward@example.com', image: 'https://placehold.co/100x100.png?text=ES' },
];

interface ChatMessage {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  timestamp: Date;
  isCurrentUser: boolean;
}

export default function IndividualChatPage() {
  const { user: currentUser } = useAuth();
  const params = useParams();
  const router = useRouter();
  const chatId = params.chatId as string; // This is the ID of the other user

  const [otherUser, setOtherUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false); // For future async operations
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Find the user being chatted with from mock data
    const foundUser = mockUsers.find(u => u.id === chatId);
    if (foundUser) {
      setOtherUser(foundUser);
    } else {
      // Handle case where user is not found, e.g., redirect or show error
      console.warn(`User with ID ${chatId} not found.`);
      // router.push('/dashboard/chat'); // Optionally redirect
    }
  }, [chatId, router]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  const getInitials = (name?: string | null) => {
    if (!name) return "U";
    const names = name.split(' ');
    if (names.length > 1) {
      return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  };

  const handleSendMessage = (e: FormEvent) => {
    e.preventDefault();
    if (input.trim() === '' || !currentUser || !otherUser) return;

    setIsLoading(true);
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      text: input.trim(),
      senderId: currentUser.id,
      senderName: currentUser.name || 'You',
      timestamp: new Date(),
      isCurrentUser: true,
    };
    setMessages(prevMessages => [...prevMessages, newMessage]);
    setInput('');

    // Simulate a reply from the other user for demonstration
    setTimeout(() => {
      const replyMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: `Thanks for your message! (This is a simulated reply from ${otherUser.name})`,
        senderId: otherUser.id,
        senderName: otherUser.name || 'Other User',
        timestamp: new Date(),
        isCurrentUser: false,
      };
      setMessages(prevMessages => [...prevMessages, replyMessage]);
      setIsLoading(false); // Assuming message sending is instant for now
    }, 1000);
  };
  
  if (!currentUser) {
      return (
        <div className="flex flex-col h-[calc(100vh-theme(spacing.24))] items-center justify-center">
            <Card className="p-6 text-center">
                <CardTitle>Loading Chat...</CardTitle>
                <CardContent>Please wait or log in to join the chat.</CardContent>
            </Card>
        </div>
      );
  }

  if (!otherUser && !isLoading) { // Show loading or not found
     return (
        <div className="flex flex-col h-[calc(100vh-theme(spacing.24))] items-center justify-center">
            <Card className="p-6 text-center">
                <CardTitle>Loading User...</CardTitle>
                <CardContent>
                  <p>Trying to load chat details for user ID: {chatId}.</p>
                  <Button onClick={() => router.push('/dashboard/chat')} variant="outline" className="mt-4">
                      <ArrowLeft className="mr-2 h-4 w-4" /> Back to Chats
                  </Button>
                </CardContent>
            </Card>
        </div>
      );
  }


  return (
    <div className="flex flex-col h-screen">
      <Card className="flex-grow flex flex-col shadow-lg">
        <CardHeader className="border-b flex flex-row items-center justify-between">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" className="mr-2" onClick={() => router.push('/dashboard/chat')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Avatar className="h-9 w-9 mr-3">
              <AvatarImage src={otherUser?.image || `https://avatar.vercel.sh/${otherUser?.email}.png`} alt={otherUser?.name || "Chat partner"} data-ai-hint="user avatar"/>
              <AvatarFallback>{getInitials(otherUser?.name)}</AvatarFallback>
            </Avatar>
            <CardTitle className="text-xl text-foreground">
              {otherUser?.name || 'Chat'}
            </CardTitle>
          </div>
           <Button variant="outline" size="sm" onClick={() => router.push('/dashboard')}>
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Back to Dashboard
            </Button>
        </CardHeader>
        <CardContent className="flex-grow p-0">
          <ScrollArea className="h-full p-4" ref={scrollAreaRef}>
            {messages.length === 0 && (
              <div className="flex justify-center items-center h-full">
                <p className="text-muted-foreground">No messages yet. Start the conversation with {otherUser?.name || 'this user'}!</p>
              </div>
            )}
            <div className="space-y-6">
              {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex items-end gap-2 ${
                      msg.isCurrentUser ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {!msg.isCurrentUser && (
                      <Avatar className="h-8 w-8">
                         <AvatarImage src={otherUser?.image || `https://avatar.vercel.sh/${otherUser?.email}.png`} alt={msg.senderName} data-ai-hint="user avatar"/>
                        <AvatarFallback>{getInitials(msg.senderName)}</AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={`max-w-[70%] p-3 rounded-xl shadow ${
                        msg.isCurrentUser
                          ? 'bg-primary text-primary-foreground rounded-br-none'
                          : 'bg-muted text-muted-foreground rounded-bl-none'
                      }`}
                    >
                      {!msg.isCurrentUser && (
                        <p className="text-xs font-medium mb-1 text-foreground/80">{msg.senderName}</p>
                      )}
                      <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                      <p className={`text-xs mt-1 ${msg.isCurrentUser ? 'text-primary-foreground/70 text-right' : 'text-muted-foreground/70 text-left'}`}>
                        {format(new Date(msg.timestamp), 'p')}
                      </p>
                    </div>
                    {msg.isCurrentUser && currentUser && (
                       <Avatar className="h-8 w-8">
                        <AvatarImage src={currentUser.image || `https://avatar.vercel.sh/${currentUser.email}.png`} alt={currentUser.name || "User"} data-ai-hint="user avatar"/>
                        <AvatarFallback>{getInitials(currentUser.name)}</AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
            </div>
          </ScrollArea>
        </CardContent>
        <form onSubmit={handleSendMessage} className="p-4 border-t bg-background">
          <div className="flex items-center gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Message ${otherUser?.name || ''}...`}
              className="flex-grow resize-none"
              rows={1}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e as any); // Cast needed because onKeyDown event is not FormEvent
                }
              }}
              disabled={isLoading || !otherUser}
            />
            <Button type="submit" disabled={!input.trim() || isLoading || !otherUser}>
              {isLoading ? <div className="h-4 w-4 border-2 border-background border-t-transparent rounded-full animate-spin mr-2"></div> : <Send className="mr-2 h-4 w-4" />}
               Send
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
