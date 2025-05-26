
"use client";

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import type { ChatMessage, User } from '@/lib/types';
import { Send, User as UserIcon, Bot } from 'lucide-react';
import { format } from 'date-fns';

export default function ChatPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const studentTypeToFriendlyName = (studentType?: User['studentType']) => {
    if (!studentType) return 'learner';
    switch (studentType) {
      case 'primary_school': return 'primary school student';
      case 'secondary_school': return 'secondary school student';
      case 'high_school': return 'high school student';
      case 'preparatory_school': return 'preparatory school student';
      case 'university': return 'university student';
      case 'college': return 'college student';
      default: return 'learner';
    }
  };
  
  useEffect(() => {
    // Initial bot message
    const initialBotMessage: ChatMessage = {
      id: 'bot-init',
      text: `Hello ${user?.name || 'there'}! As a ${studentTypeToFriendlyName(user?.studentType)}, how can I help you today?`,
      sender: 'bot',
      timestamp: new Date(),
      studentType: user?.studentType,
    };
    setMessages([initialBotMessage]);
  }, [user]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (input.trim() === '') return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInput('');

    // Simulate bot response
    setTimeout(() => {
      let botText = "Thanks for your message! I'm still learning.";
      const userStudentType = user?.studentType;

      if (userStudentType === 'university') {
        botText = `Interesting question for a ${studentTypeToFriendlyName(userStudentType)}. I'll do my best to find relevant information on that.`;
      } else if (userStudentType === 'primary_school') {
        botText = `That's a great question for a ${studentTypeToFriendlyName(userStudentType)}! Let's see...`;
      } else if (userStudentType) {
         botText = `Got it. As a ${studentTypeToFriendlyName(userStudentType)}, you might find this interesting... (I'm still under development).`;
      }
      
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: botText,
        sender: 'bot',
        timestamp: new Date(),
        studentType: user?.studentType,
      };
      setMessages(prevMessages => [...prevMessages, botMessage]);
    }, 1000);
  };
  
  const getInitials = (name?: string | null) => {
    if (!name) return "U";
    const names = name.split(' ');
    if (names.length > 1) {
      return names[0][0] + names[names.length - 1][0];
    }
    return name[0];
  };


  return (
    <div className="flex flex-col h-[calc(100vh-theme(spacing.24))]"> {/* Adjust height as needed */}
      <Card className="flex-grow flex flex-col shadow-lg">
        <CardHeader className="border-b">
          <CardTitle className="text-xl text-foreground">AI Chat Assistant</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow p-0">
          <ScrollArea className="h-full p-4" ref={scrollAreaRef}>
            <div className="space-y-6">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-end gap-2 ${
                    msg.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {msg.sender === 'bot' && (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback><Bot className="h-5 w-5" /></AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={`max-w-[70%] p-3 rounded-xl shadow ${
                      msg.sender === 'user'
                        ? 'bg-primary text-primary-foreground rounded-br-none'
                        : 'bg-muted text-muted-foreground rounded-bl-none'
                    }`}
                  >
                    <p className="text-sm">{msg.text}</p>
                    <p className={`text-xs mt-1 ${msg.sender === 'user' ? 'text-primary-foreground/70 text-right' : 'text-muted-foreground/70 text-left'}`}>
                      {format(msg.timestamp, 'p')}
                    </p>
                  </div>
                  {msg.sender === 'user' && (
                     <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.image || `https://avatar.vercel.sh/${user?.email}.png`} alt={user?.name || "User"} />
                      <AvatarFallback>{getInitials(user?.name)}</AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
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
            />
            <Button onClick={handleSendMessage} disabled={!input.trim()}>
              <Send className="mr-2 h-4 w-4" /> Send
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
