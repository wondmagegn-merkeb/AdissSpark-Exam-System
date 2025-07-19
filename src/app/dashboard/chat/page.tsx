
"use client";

import { useState, useEffect, useRef, FormEvent, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Search, LayoutDashboard, Send, User as UserIcon, ArrowLeft, Building, Mail, GraduationCap, Hand } from 'lucide-react';
import type { User } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { format, formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';


// Mock user data enhanced with chat-specific fields
interface ChatUser extends User {
  isOnline: boolean;
  lastMessage: string;
  lastMessageTimestamp: Date;
  unreadCount: number;
}

const initialMockUsers: ChatUser[] = [
  { id: 'user2', name: 'Alice Wonderland', email: 'alice@example.com', image: 'https://placehold.co/100x100.png?text=AW', isOnline: true, lastMessage: "Hey, are you free to chat?", lastMessageTimestamp: new Date(Date.now() - 5 * 60 * 1000), unreadCount: 2, studentType: 'university', department: 'Computer Science', institutionName: 'Addis Ababa University' },
  { id: 'user3', name: 'Bob The Builder', email: 'bob@example.com', image: 'https://placehold.co/100x100.png?text=BB', isOnline: false, lastMessage: "Sure, I'll check it out. Thanks!", lastMessageTimestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), unreadCount: 0, studentType: 'college', department: 'Construction', institutionName: 'Tegbare-Id Polytechnic' },
  { id: 'user4', name: 'Charlie Brown', email: 'charlie@example.com', image: 'https://placehold.co/100x100.png?text=CB', isOnline: true, lastMessage: "Haha, that's hilarious! 😂", lastMessageTimestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), unreadCount: 0, studentType: 'high_school', gradeLevel: 'Grade 11', institutionName: 'Black Lion High School' },
  { id: 'user5', name: 'Diana Prince', email: 'diana@example.com', image: 'https://placehold.co/100x100.png?text=DP', isOnline: false, lastMessage: "Okay, sounds good. Let's sync up tomorrow.", lastMessageTimestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), unreadCount: 5, studentType: 'university', department: 'Archaeology', institutionName: 'Axum University' },
  { id: 'user6', name: 'Edward Scissorhands', email: 'edward@example.com', image: 'https://placehold.co/100x100.png?text=ES', isOnline: true, lastMessage: "You sent an attachment.", lastMessageTimestamp: new Date(Date.now() - 30 * 60 * 1000), unreadCount: 0, studentType: 'preparatory_school', gradeLevel: 'Grade 12', institutionName: 'Finishing Touch Academy' },
  { id: 'user7', name: 'Frankenstein Monster', email: 'frank@example.com', image: 'https://placehold.co/100x100.png?text=FM', isOnline: false, lastMessage: "I'll be there in 10.", lastMessageTimestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), unreadCount: 0, studentType: 'university', department: 'Electrical Engineering', institutionName: 'Gondar University' },
  { id: 'user8', name: 'Grace Hopper', email: 'grace@example.com', image: 'https://placehold.co/100x100.png?text=GH', isOnline: true, lastMessage: "Can you review my code?", lastMessageTimestamp: new Date(Date.now() - 15 * 60 * 1000), unreadCount: 1, studentType: 'university', department: 'Software Engineering', institutionName: 'Adama Science and Technology University' },
  { id: 'user9', name: 'Harry Potter', email: 'harry@example.com', image: 'https://placehold.co/100x100.png?text=HP', isOnline: true, lastMessage: "Did you finish the assignment?", lastMessageTimestamp: new Date(Date.now() - 50 * 60 * 1000), unreadCount: 0, studentType: 'high_school', gradeLevel: 'Grade 10', institutionName: 'St. Joseph School' },
  { id: 'user10', name: 'Ivy Valentine', email: 'ivy@example.com', image: 'https://placehold.co/100x100.png?text=IV', isOnline: false, lastMessage: "See you later!", lastMessageTimestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), unreadCount: 0, studentType: 'college', department: 'Fashion Design', institutionName: 'Next Fashion Design College' },
  { id: 'user11', name: 'Jack Sparrow', email: 'jack@example.com', image: 'https://placehold.co/100x100.png?text=JS', isOnline: true, lastMessage: "Where's the rum?", lastMessageTimestamp: new Date(Date.now() - 2 * 60 * 1000), unreadCount: 3, studentType: 'primary_school', gradeLevel: 'Grade 6', institutionName: 'Hillside School' },
  { id: 'user12', name: 'Kratos Aurion', email: 'kratos@example.com', image: 'https://placehold.co/100x100.png?text=KA', isOnline: false, lastMessage: "Affirmative.", lastMessageTimestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), unreadCount: 0, studentType: 'university', department: 'History', institutionName: 'Bahir Dar University' },
  { id: 'user13', name: 'Lara Croft', email: 'lara@example.com', image: 'https://placehold.co/100x100.png?text=LC', isOnline: true, lastMessage: "I found the artifact!", lastMessageTimestamp: new Date(Date.now() - 12 * 60 * 60 * 1000), unreadCount: 0, studentType: 'university', department: 'Archaeology', institutionName: 'Axum University' },
  { id: 'user14', name: 'Master Chief', email: 'chief@example.com', image: 'https://placehold.co/100x100.png?text=MC', isOnline: true, lastMessage: "I need a weapon.", lastMessageTimestamp: new Date(Date.now() - 20 * 60 * 1000), unreadCount: 1, studentType: 'college', department: 'Mechanical Engineering', institutionName: 'Admas University' },
  { id: 'user15', name: 'Naruto Uzumaki', email: 'naruto@example.com', image: 'https://placehold.co/100x100.png?text=NU', isOnline: false, lastMessage: "Believe it!", lastMessageTimestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), unreadCount: 0, studentType: 'secondary_school', gradeLevel: 'Grade 9', institutionName: 'Cathedral School' },
  { id: 'user16', name: 'Optimus Prime', email: 'optimus@example.com', image: 'https://placehold.co/100x100.png?text=OP', isOnline: true, lastMessage: "Autobots, roll out!", lastMessageTimestamp: new Date(Date.now() - 1 * 60 * 1000), unreadCount: 1, studentType: 'university', department: 'Mechanical Engineering', institutionName: 'Jimma University' },
];


interface ChatMessage {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  timestamp: Date;
  isCurrentUser: boolean;
}

type ChatPermissionStatus = 'unknown' | 'accepted';

const getInitials = (name?: string | null) => {
  if (!name) return "U";
  const names = name.split(' ');
  if (names.length > 1) {
    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
  }
  return name[0].toUpperCase();
};

const formatStudentType = (studentType?: string | null) => {
  if (!studentType) return 'N/A';
  return studentType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};


export default function ChatPage() {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null);
  const [users, setUsers] = useState<ChatUser[]>(initialMockUsers);
  const [isProfileViewActive, setIsProfileViewActive] = useState(false);
  const [chatPermissionStatus, setChatPermissionStatus] = useState<ChatPermissionStatus>('unknown');


  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewportRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Effect to handle textarea auto-resizing
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'; // Reset height to recalculate
      const scrollHeight = textareaRef.current.scrollHeight;
      // Estimate line height (can be refined)
      const lineHeight = parseFloat(getComputedStyle(textareaRef.current).lineHeight);
      const maxHeight = lineHeight * 3; // Max 3 lines
      
      if (scrollHeight > maxHeight) {
        textareaRef.current.style.height = `${maxHeight}px`;
        textareaRef.current.style.overflowY = 'auto';
      } else {
        textareaRef.current.style.height = `${scrollHeight}px`;
        textareaRef.current.style.overflowY = 'hidden';
      }
    }
  }, [input]);

  // Effect to simulate receiving a new message
  useEffect(() => {
    const timer = setTimeout(() => {
      const potentialSenders = users.filter(u => u.id !== selectedUser?.id);
      if (potentialSenders.length > 0) {
        const randomSender = potentialSenders[Math.floor(Math.random() * potentialSenders.length)];
        const newMessage = "Just checking in, let me know when you're free!";
        
        setUsers(currentUsers => 
          currentUsers.map(u => 
            u.id === randomSender.id ? { 
              ...u, 
              lastMessage: newMessage,
              lastMessageTimestamp: new Date(),
              unreadCount: u.unreadCount + 1,
            } : u
          )
        );

        toast({
          title: `New Message from ${randomSender.name}`,
          description: newMessage,
        });
      }
    }, 15000); // Increased delay to 15 seconds

    return () => clearTimeout(timer);
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUser]);


  const filteredUsers = useMemo(() => {
    return users.filter(user => {
        const search = searchTerm.toLowerCase();
        return (
            user.name?.toLowerCase().includes(search) ||
            user.email?.toLowerCase().includes(search) ||
            user.studentType?.toLowerCase().replace(/_/g, ' ').includes(search) ||
            user.department?.toLowerCase().includes(search) ||
            user.institutionName?.toLowerCase().includes(search) ||
            user.gradeLevel?.toLowerCase().includes(search)
        );
      }).sort((a, b) => b.lastMessageTimestamp.getTime() - a.lastMessageTimestamp.getTime());
  }, [searchTerm, users]);
  
  // Effect to scroll to the bottom of the chat
  useEffect(() => {
    if (scrollViewportRef.current) {
      scrollViewportRef.current.scrollTop = scrollViewportRef.current.scrollHeight;
    }
  }, [messages, selectedUser]);

  const getAcceptedChats = (): string[] => {
    if (!currentUser) return [];
    const key = `chat_permissions_${currentUser.id}`;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  };

  const setChatAsAccepted = (otherUserId: string) => {
    if (!currentUser) return;
    const key = `chat_permissions_${currentUser.id}`;
    const accepted = getAcceptedChats();
    if (!accepted.includes(otherUserId)) {
      accepted.push(otherUserId);
      localStorage.setItem(key, JSON.stringify(accepted));
    }
  };

  const handleSelectUser = (user: ChatUser) => {
    setSelectedUser(user);
    setIsProfileViewActive(false); 
    setUsers(currentUsers => currentUsers.map(u => u.id === user.id ? { ...u, unreadCount: 0 } : u));
    setMessages([]); 

    const acceptedChats = getAcceptedChats();
    if (acceptedChats.includes(user.id)) {
      setChatPermissionStatus('accepted');
    } else {
      setChatPermissionStatus('unknown');
    }
  };

  const handleStartConversation = () => {
    if (!selectedUser) return;
    setChatAsAccepted(selectedUser.id);
    setChatPermissionStatus('accepted');
    toast({
      title: `Conversation with ${selectedUser.name} started!`,
      description: "You can now send messages.",
    });
  };

  const handleSendMessage = (e: FormEvent) => {
    e.preventDefault();
    if (input.trim() === '' || !currentUser || !selectedUser || chatPermissionStatus !== 'accepted') return;

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

    setUsers(currentUsers => currentUsers.map(u => u.id === selectedUser.id ? { ...u, lastMessage: `You: ${input.trim()}`, lastMessageTimestamp: new Date() } : u));


    setTimeout(() => {
      if(selectedUser) {
        const replyMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          text: `Thanks for your message! (This is a simulated reply from ${selectedUser.name})`,
          senderId: selectedUser.id,
          senderName: selectedUser.name || 'Other User',
          timestamp: new Date(),
          isCurrentUser: false,
        };
        setMessages(prevMessages => [...prevMessages, replyMessage]);
        setUsers(currentUsers => currentUsers.map(u => u.id === selectedUser.id ? { ...u, lastMessage: replyMessage.text, lastMessageTimestamp: new Date() } : u));
      }
      setIsLoading(false);
    }, 1000);
  };


  return (
    <div className="flex h-screen p-4 gap-4">
      {/* Left Panel: User List */}
      <Card className={cn(
        "w-full flex-shrink-0 flex-col shadow-lg md:w-96 md:flex-grow-0",
        selectedUser ? "hidden md:flex" : "flex"
      )}>
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
      <Card className={cn(
        "flex-grow flex-col shadow-lg",
        selectedUser ? "flex" : "hidden md:flex"
      )}>
        {selectedUser ? (
          <>
            <CardHeader className="border-b">
              <button
                className="flex flex-row items-center w-full text-left rounded-md p-2 -m-2 hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                onClick={() => setIsProfileViewActive(prev => !prev)}
                aria-label={`View ${selectedUser.name}'s profile`}
              >
                  <div className="flex items-center flex-grow">
                      <Button variant="ghost" size="icon" className="mr-2 md:hidden" onClick={(e) => { e.stopPropagation(); setSelectedUser(null); }}>
                          <ArrowLeft className="h-5 w-5" />
                      </Button>
                      <Avatar className="h-9 w-9 mr-3">
                          <AvatarImage src={selectedUser.image || `https://avatar.vercel.sh/${selectedUser.email}.png`} alt={selectedUser.name || "Chat partner"} data-ai-hint="user avatar"/>
                          <AvatarFallback>{getInitials(selectedUser.name)}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <CardTitle className="text-xl text-foreground">
                            {selectedUser.name || 'Chat'}
                        </CardTitle>
                        <span className="text-xs text-muted-foreground flex items-center">
                           {isProfileViewActive ? 'Click to return to chat' : 'Click to view profile'}
                        </span>
                      </div>
                  </div>
              </button>
            </CardHeader>
            <CardContent className="flex-grow p-0 overflow-hidden">
                 {isProfileViewActive ? (
                  <div className="p-6 flex flex-col items-center justify-center h-full text-center">
                      <Avatar className="h-24 w-24 mb-4 ring-2 ring-offset-2 ring-offset-background ring-primary">
                          <AvatarImage src={selectedUser.image || `https://avatar.vercel.sh/${selectedUser.email}.png`} alt={selectedUser.name || "Chat partner"} data-ai-hint="user avatar"/>
                          <AvatarFallback className="text-3xl">{getInitials(selectedUser.name)}</AvatarFallback>
                      </Avatar>
                      <h2 className="text-2xl font-bold text-foreground">{selectedUser.name}</h2>
                      <div className="flex items-center gap-2 mt-1">
                          <span className={cn("h-2.5 w-2.5 rounded-full", selectedUser.isOnline ? "bg-green-500" : "bg-muted-foreground")} />
                          <p className="text-sm text-muted-foreground">{selectedUser.isOnline ? 'Online' : 'Offline'}</p>
                      </div>
                      <div className="mt-6 text-left space-y-3 w-full max-w-sm">
                          <div className="flex items-center text-sm">
                              <Mail className="h-4 w-4 mr-3 text-muted-foreground" />
                              <span className="text-foreground">{selectedUser.email}</span>
                          </div>
                          <div className="flex items-center text-sm">
                              <UserIcon className="h-4 w-4 mr-3 text-muted-foreground" />
                              <span className="text-foreground">{formatStudentType(selectedUser.studentType)}</span>
                          </div>
                          <div className="flex items-center text-sm">
                              <Building className="h-4 w-4 mr-3 text-muted-foreground" />
                              <span className="text-foreground">{selectedUser.institutionName || 'N/A'}</span>
                          </div>
                          <div className="flex items-center text-sm">
                              <GraduationCap className="h-4 w-4 mr-3 text-muted-foreground" />
                              <span className="text-foreground">{selectedUser.department || selectedUser.gradeLevel || 'N/A'}</span>
                          </div>
                      </div>
                      <Button variant="outline" className="mt-8" onClick={() => setIsProfileViewActive(false)}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Chat
                      </Button>
                  </div>
                 ) : chatPermissionStatus === 'accepted' ? (
                    <ScrollArea className="h-full" viewportRef={scrollViewportRef}>
                      <div className="p-4 space-y-6">
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
                 ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center p-8">
                      <Hand className="h-16 w-16 text-primary mb-4" />
                      <h3 className="text-xl font-semibold text-foreground">Start the Conversation</h3>
                      <p className="text-muted-foreground mt-2 max-w-xs">
                          You haven't chatted with {selectedUser.name} before. Click the button below to start the conversation.
                      </p>
                      <Button className="mt-6" onClick={handleStartConversation}>
                          Start Conversation
                      </Button>
                  </div>
                 )}
            </CardContent>
            {!isProfileViewActive && (
                <form onSubmit={handleSendMessage} className="p-4 border-t bg-background">
                    <div className="flex items-center gap-2">
                        <Textarea
                          ref={textareaRef}
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          placeholder={chatPermissionStatus === 'accepted' ? `Message ${selectedUser.name || ''}...` : 'Start the conversation to send a message.'}
                          className="flex-grow resize-none overflow-hidden"
                          rows={1}
                          onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSendMessage(e as any);
                              }
                          }}
                          disabled={isLoading || chatPermissionStatus !== 'accepted'}
                        />
                        <Button type="submit" disabled={!input.trim() || isLoading || chatPermissionStatus !== 'accepted'}>
                            {isLoading ? <div className="h-4 w-4 border-2 border-background border-t-transparent rounded-full animate-spin mr-2"></div> : <Send className="mr-2 h-4 w-4" />}
                            Send
                        </Button>
                    </div>
                </form>
            )}
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
