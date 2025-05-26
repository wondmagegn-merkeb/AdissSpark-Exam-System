
import { db } from '@/lib/firebase';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, Timestamp, limit, where, getDocs, doc, setDoc } from 'firebase/firestore';
import type { User } from '@/lib/types';

// Interface for data as stored in Firestore for a PUBLIC CHAT (retained for potential future use or different feature)
interface FirestorePublicChatMessageDocument {
  text: string;
  senderId: string;
  senderName: string; 
  timestamp: Timestamp;
}

// Interface for messages used within the application for PUBLIC CHAT
export interface AppPublicChatMessage {
  id: string; 
  text: string;
  senderId: string;
  senderName: string;
  timestamp: Date;
}

// --- Definitions for 1-on-1 Chat (New) ---
export interface FirestoreOneOnOneMessageDocument {
  chatRoomId: string; // Identifier for the 1-on-1 chat room
  text: string;
  senderId: string;
  receiverId: string; // Added to identify the recipient
  senderName: string; // Denormalized for easier display
  timestamp: Timestamp;
}

export interface AppOneOnOneChatMessage {
  id: string; // Firestore document ID
  chatRoomId: string;
  text: string;
  senderId: string;
  receiverId: string;
  senderName: string;
  timestamp: Date;
}


const PUBLIC_MESSAGES_COLLECTION = 'publicChatMessages';
const ONE_ON_ONE_MESSAGES_COLLECTION = 'oneOnOneChatMessages';
const CHAT_ROOMS_COLLECTION = 'chatRooms'; // To store metadata about 1-on-1 chat rooms
const MESSAGES_LIMIT = 50;

// --- Public Chat Room Functions (Retained, but not currently used by main UI) ---

export async function sendPublicMessage(currentUser: User, text: string): Promise<void> {
  if (!currentUser || !currentUser.id || !text.trim()) {
    console.error('User ID and text are required to send a public message.');
    return;
  }
  try {
    await addDoc(collection(db, PUBLIC_MESSAGES_COLLECTION), {
      text: text.trim(),
      senderId: currentUser.id,
      senderName: currentUser.name || currentUser.email?.split('@')[0] || 'Anonymous',
      timestamp: serverTimestamp(),
    } as Omit<FirestorePublicChatMessageDocument, 'timestamp'> & { timestamp: ReturnType<typeof serverTimestamp> });
  } catch (error) {
    console.error('Error sending public message to Firestore: ', error);
    throw new Error('Failed to send public message.');
  }
}

type PublicMessagesCallback = (messages: AppPublicChatMessage[]) => void;
type UnsubscribeFn = () => void;

export function subscribeToPublicMessages(callback: PublicMessagesCallback): UnsubscribeFn {
  const q = query(
    collection(db, PUBLIC_MESSAGES_COLLECTION), 
    orderBy('timestamp', 'desc'),
    limit(MESSAGES_LIMIT)
  );

  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const messages: AppPublicChatMessage[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data() as FirestorePublicChatMessageDocument;
      messages.push({
        id: doc.id,
        text: data.text,
        senderId: data.senderId,
        senderName: data.senderName || 'Unknown User',
        timestamp: data.timestamp ? data.timestamp.toDate() : new Date(),
      });
    });
    callback(messages.reverse());
  }, (error) => {
    console.error("Error subscribing to public messages: ", error);
  });

  return unsubscribe;
}


// --- 1-on-1 Chat Functions (New - Placeholder, to be fully implemented) ---

// Helper to generate a consistent chat room ID for two users
export function getChatRoomId(userId1: string, userId2: string): string {
  return userId1 < userId2 ? `${userId1}_${userId2}` : `${userId2}_${userId1}`;
}

export async function sendOneOnOneMessage(
  currentUser: User,
  receiverId: string,
  text: string,
  chatRoomId: string
): Promise<void> {
  if (!currentUser || !currentUser.id || !receiverId || !text.trim() || !chatRoomId) {
    console.error('User IDs, text, and chatRoomId are required.');
    return;
  }
  try {
    // TODO: Create chat room document if it doesn't exist
    // This might involve storing participants, last message, etc.
    // For now, we directly add to messages collection.
    // const chatRoomRef = doc(db, CHAT_ROOMS_COLLECTION, chatRoomId);
    // await setDoc(chatRoomRef, { 
    //   participants: [currentUser.id, receiverId],
    //   lastMessageTimestamp: serverTimestamp() 
    // }, { merge: true });


    await addDoc(collection(db, ONE_ON_ONE_MESSAGES_COLLECTION), {
      chatRoomId,
      text: text.trim(),
      senderId: currentUser.id,
      receiverId,
      senderName: currentUser.name || currentUser.email?.split('@')[0] || 'Anonymous',
      timestamp: serverTimestamp(),
    } as Omit<FirestoreOneOnOneMessageDocument, 'timestamp'> & { timestamp: ReturnType<typeof serverTimestamp> });
  } catch (error) {
    console.error('Error sending 1-on-1 message to Firestore: ', error);
    throw new Error('Failed to send 1-on-1 message.');
  }
}

type OneOnOneMessagesCallback = (messages: AppOneOnOneChatMessage[]) => void;

export function subscribeToOneOnOneMessages(
  chatRoomId: string,
  callback: OneOnOneMessagesCallback
): UnsubscribeFn {
  if (!chatRoomId) {
    console.warn("ChatRoomID is required to subscribe to 1-on-1 messages.");
    return () => {}; // Return an empty unsubscribe function
  }
  
  const q = query(
    collection(db, ONE_ON_ONE_MESSAGES_COLLECTION),
    where('chatRoomId', '==', chatRoomId),
    orderBy('timestamp', 'asc'), // Usually ascending for chat history
    limit(MESSAGES_LIMIT) // Or implement pagination
  );

  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const messages: AppOneOnOneChatMessage[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data() as FirestoreOneOnOneMessageDocument;
      messages.push({
        id: doc.id,
        chatRoomId: data.chatRoomId,
        text: data.text,
        senderId: data.senderId,
        receiverId: data.receiverId,
        senderName: data.senderName || 'Unknown User',
        timestamp: data.timestamp ? data.timestamp.toDate() : new Date(),
      });
    });
    callback(messages); // No reverse needed if ordered by asc
  }, (error) => {
    console.error(`Error subscribing to 1-on-1 messages for room ${chatRoomId}: `, error);
  });

  return unsubscribe;
}


// --- User Service (Placeholder - for fetching list of users to chat with) ---
export async function getAllUsers(): Promise<User[]> {
  // In a real app, this would fetch from your 'users' collection in Firestore
  // For now, returning mock data. Ensure your User type matches.
  console.warn("getAllUsers is returning mock data. Implement actual user fetching.");
  return [
    // These IDs should match the ones used in chat/[chatId]/page.tsx mock data
    { id: 'user2', name: 'Alice Wonderland', email: 'alice@example.com', image: 'https://placehold.co/100x100.png?text=AW' },
    { id: 'user3', name: 'Bob The Builder', email: 'bob@example.com', image: 'https://placehold.co/100x100.png?text=BB' },
    { id: 'user4', name: 'Charlie Brown', email: 'charlie@example.com', image: 'https://placehold.co/100x100.png?text=CB' },
    // Add more mock users if needed, or connect to your actual user data source
  ];
}
