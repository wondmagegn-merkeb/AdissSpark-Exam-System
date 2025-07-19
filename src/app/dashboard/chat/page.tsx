
"use client";

import { useState, useEffect, useRef, FormEvent, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Search, LayoutDashboard, Send, User as UserIcon } from 'lucide-react';
import type { User } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { format, formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';


// Mock user data enhanced with chat-specific fields
interface ChatUser extends User {
  isOnline: boolean;
  lastMessage: string;
  lastMessageTimestamp: Date;
  unreadCount: number;
}

const mockUsers: ChatUser[] = [
  { id: 'user2', name: 'Alice Wonderland', email: 'alice@example.com', image: 'https://placehold.co/100x100.png?text=AW', isOnline: true, lastMessage: "Hey, are you free to chat?", lastMessageTimestamp: new Date(Date.now() - 5 * 60 * 1000), unreadCount: 2 },
  { id: 'user3', name: 'Bob The Builder', email: 'bob@example.com', image: 'https://placehold.co/100x100.png?text=BB', isOnline: false, lastMessage: "Sure, I'll check it out. Thanks!", lastMessageTimestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), unreadCount: 0 },
  { id: 'user4', name: 'Charlie Brown', email: 'charlie@example.com', image: 'https://placehold.co/100x100.png?text=CB', isOnline: true, lastMessage: "Haha, that's hilarious! 😂", lastMessageTimestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), unreadCount: 0 },
  { id: 'user5', name: 'Diana Prince', email: 'diana@example.com', image: 'https://placehold.co/100x100.png?text=DP', isOnline: false, lastMessage: "Okay, sounds good. Let's sync up tomorrow.", lastMessageTimestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), unreadCount: 5 },
  { id: 'user6', name: 'Edward Scissorhands', email: 'edward@example.com', image: 'https://placehold.co/100x100.png?text=ES', isOnline: true, lastMessage: "You sent an attachment.", lastMessageTimestamp: new Date(Date.now() - 30 * 60 * 1000), unreadCount: 0 },
];

interface ChatMessage {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  timestamp: Date;
  isCurrentUser: boolean;
}

const getInitials = (name?: string | null) => {
  if (!name) return "U";
  const names = name.split(' ');
  if (names.length > 1) {
    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
  }
  return name[0].toUpperCase();
};

export default function ChatPage() {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const filteredUsers = useMemo(() => {
    return mockUsers.filter(user =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      ).sort((a, b) => b.lastMessageTimestamp.getTime() - a.lastMessageTimestamp.getTime());
  }, [searchTerm]);
  
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  const handleSelectUser = (user: ChatUser) => {
    setSelectedUser(user);
    setMessages([]); // Clear previous messages
    // In a real app, you would fetch the message history for this user here.
    // For now, we'll just show an empty chat.
  };

  const handleSendMessage = (e: FormEvent) => {
    e.preventDefault();
    if (input.trim() === '' || !currentUser || !selectedUser) return;

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
      if(selectedUser) { // Check if user is still selected
        const replyMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          text: `Thanks for your message! (This is a simulated reply from ${selectedUser.name})`,
          senderId: selectedUser.id,
          senderName: selectedUser.name || 'Other User',
          timestamp: new Date(),
          isCurrentUser: false,
        };
        setMessages(prevMessages => [...prevMessages, replyMessage]);
      }
      setIsLoading(false);
    }, 1000);
  };


  return (
    <div className="flex h-screen p-4 gap-4">
      {/* Left Panel: User List */}
      <Card className="w-full max-w-sm flex-shrink-0 flex flex-col shadow-lg">
        <CardHeader className="border-b flex flex-row items-center justify-between">
            <div className="flex items-center">
                <MessageSquare className="mr-2 h-6 w-6 text-primary" />
                <CardTitle className="text-xl text-foreground">Chats</CardTitle>
            </div>
            <Button variant="outline" size="sm" onClick={() => router.push('/dashboard')}>
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Dashboard
            </Button>
        </CardHeader>
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search users..."
              className="pl-8 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <CardContent className="flex-grow p-0 overflow-hidden">
          <ScrollArea className="h-full">
            {filteredUsers.length === 0 ? (
              <div className="flex justify-center items-center h-full p-4">
                <p className="text-muted-foreground">No users found.</p>
              </div>
            ) : (
              <div className="divide-y">
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    onClick={() => handleSelectUser(user)}
                    className={cn(
                        "flex items-center p-4 hover:bg-muted/50 transition-colors cursor-pointer",
                        selectedUser?.id === user.id && "bg-muted"
                    )}
                  >
                    <div className="relative mr-4">
                      <Avatar className="h-11 w-11">
                        <AvatarImage src={user.image || `https://avatar.vercel.sh/${user.email}.png`} alt={user.name || "User"} data-ai-hint="user avatar" />
                        <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                      </Avatar>
                      <span className={cn(
                        "absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-background",
                        user.isOnline ? "bg-green-500" : "bg-muted-foreground"
                      )} />
                    </div>

                    <div className="flex-grow">
                      <div className="flex justify-between items-center">
                        <p className="font-medium text-foreground">{user.name || 'Unnamed User'}</p>
                        <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(user.lastMessageTimestamp, { addSuffix: true })}
                        </p>
                      </div>
                       <div className="flex justify-between items-start">
                        <p className="text-sm text-muted-foreground truncate max-w-[150px]">
                            {user.lastMessage}
                        </p>
                        {user.unreadCount > 0 && (
                            <Badge className="h-5 w-5 flex items-center justify-center p-0 text-xs shrink-0">
                                {user.unreadCount}
                            </Badge>
                        )}
                       </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Right Panel: Chat Window */}
      <Card className="flex-grow flex flex-col shadow-lg">
        {selectedUser ? (
          <>
            <CardHeader className="border-b flex flex-row items-center">
                <Avatar className="h-9 w-9 mr-3">
                <AvatarImage src={selectedUser.image || `https://avatar.vercel.sh/${selectedUser.email}.png`} alt={selectedUser.name || "Chat partner"} data-ai-hint="user avatar"/>
                <AvatarFallback>{getInitials(selectedUser.name)}</AvatarFallback>
                </Avatar>
                <CardTitle className="text-xl text-foreground">
                {selectedUser.name || 'Chat'}
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-grow p-0 overflow-hidden">
                 <ScrollArea className="h-full p-4" ref={scrollAreaRef}>
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
                                <AvatarImage src={selectedUser.image || `https://avatar.vercel.sh/${selectedUser.email}.png`} alt={msg.senderName} data-ai-hint="user avatar"/>
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
                    placeholder={`Message ${selectedUser.name || ''}...`}
                    className="flex-grow resize-none"
                    rows={1}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e as any);
                        }
                    }}
                    disabled={isLoading}
                    />
                    <Button type="submit" disabled={!input.trim() || isLoading}>
                        {isLoading ? <div className="h-4 w-4 border-2 border-background border-t-transparent rounded-full animate-spin mr-2"></div> : <Send className="mr-2 h-4 w-4" />}
                        Send
                    </Button>
                </div>
            </form>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8">
            <MessageSquare className="h-16 w-16 mb-4" />
            <h2 className="text-xl font-semibold text-foreground">Welcome to your Chat</h2>
            <p>Select a user from the list on the left to start a conversation.</p>
          </div>
        )}
      </Card>
    </div>
  );
}
