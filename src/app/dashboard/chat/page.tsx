
"use client";

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import type { ChatMessage as AppChatMessageFromTypes } from '@/lib/types'; // Renaming to avoid conflict
import { sendMessage, subscribeToMessages, type AppChatMessage as ServiceChatMessage } from '@/services/chatService';
import { Send, User as UserIcon, Users } from 'lucide-react'; // Using Users icon for public chat
import { format } from 'date-fns';

// Ensure ChatMessage used in state matches the one from the service after potential transformations
type UIMessage = ServiceChatMessage;

export default function ChatPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return; // Don't subscribe if user is not loaded

    const unsubscribe = subscribeToMessages((newMessages) => {
      setMessages(newMessages);
    });

    // Cleanup subscription on component unmount
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (input.trim() === '' || !user) return;

    setIsLoading(true);
    try {
      await sendMessage(user, input);
      setInput(''); // Clear input only on successful send
    } catch (error) {
      console.error("Failed to send message:", error);
      // Optionally show a toast notification to the user
    } finally {
      setIsLoading(false);
    }
  };
  
  const getInitials = (name?: string | null) => {
    if (!name) return "U";
    const names = name.split(' ');
    if (names.length > 1) {
      return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  };

  if (!user) {
      return (
        <div className="flex flex-col h-[calc(100vh-theme(spacing.24))] items-center justify-center">
            <Card className="p-6 text-center">
                <CardTitle>Loading Chat...</CardTitle>
                <CardContent>Please wait or log in to join the chat.</CardContent>
            </Card>
        </div>
      );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-theme(spacing.24))]"> {/* Adjust height as needed */}
      <Card className="flex-grow flex flex-col shadow-lg">
        <CardHeader className="border-b">
          <CardTitle className="text-xl text-foreground flex items-center">
            <Users className="mr-2 h-6 w-6 text-primary" /> Public Chat Room
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-grow p-0">
          <ScrollArea className="h-full p-4" ref={scrollAreaRef}>
            {messages.length === 0 && (
              <div className="flex justify-center items-center h-full">
                <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
              </div>
            )}
            <div className="space-y-6">
              {messages.map((msg) => {
                const isCurrentUser = msg.senderId === user.id;
                return (
                  <div
                    key={msg.id}
                    className={`flex items-end gap-2 ${
                      isCurrentUser ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {!isCurrentUser && (
                      <Avatar className="h-8 w-8">
                        {/* Placeholder for other users' avatars, could use a service or initials */}
                        <AvatarFallback>{getInitials(msg.senderName)}</AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={`max-w-[70%] p-3 rounded-xl shadow ${
                        isCurrentUser
                          ? 'bg-primary text-primary-foreground rounded-br-none'
                          : 'bg-muted text-muted-foreground rounded-bl-none'
                      }`}
                    >
                      {!isCurrentUser && (
                        <p className="text-xs font-medium mb-1 text-foreground/80">{msg.senderName}</p>
                      )}
                      <p className="text-sm">{msg.text}</p>
                      <p className={`text-xs mt-1 ${isCurrentUser ? 'text-primary-foreground/70 text-right' : 'text-muted-foreground/70 text-left'}`}>
                        {format(new Date(msg.timestamp), 'p')}
                      </p>
                    </div>
                    {isCurrentUser && (
                       <Avatar className="h-8 w-8">
                        <AvatarImage src={user.image || `https://avatar.vercel.sh/${user.email}.png`} alt={user.name || "User"} />
                        <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
        <div className="p-4 border-t bg-background">
          <div className="flex items-center gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-grow resize-none"
              rows={1}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              disabled={isLoading}
            />
            <Button onClick={handleSendMessage} disabled={!input.trim() || isLoading}>
              {isLoading ? <div className="h-4 w-4 border-2 border-background border-t-transparent rounded-full animate-spin mr-2"></div> : <Send className="mr-2 h-4 w-4" />}
               Send
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
