
import { db } from '@/lib/firebase';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, Timestamp, limit } from 'firebase/firestore';
import type { User } from '@/lib/types';

// Interface for data as stored in Firestore
interface FirestoreChatMessageDocument {
  text: string;
  senderId: string;
  senderName: string; // Denormalized for easier display
  timestamp: Timestamp; // Firestore Timestamp
}

// Interface for messages used within the application, converting Firestore Timestamp to JS Date
export interface AppChatMessage {
  id: string; // Firestore document ID
  text: string;
  senderId: string;
  senderName: string;
  timestamp: Date;
}

const MESSAGES_COLLECTION = 'chatMessages';
const MESSAGES_LIMIT = 50; // Number of recent messages to load

export async function sendMessage(currentUser: User, text: string): Promise<void> {
  if (!currentUser || !currentUser.id || !text.trim()) {
    console.error('User ID and text are required to send a message.');
    // Optionally throw an error or return a status
    return;
  }
  try {
    await addDoc(collection(db, MESSAGES_COLLECTION), {
      text: text.trim(),
      senderId: currentUser.id,
      senderName: currentUser.name || currentUser.email?.split('@')[0] || 'Anonymous', // Fallback for sender name
      timestamp: serverTimestamp(), // Firestore specific server timestamp
    } as Omit<FirestoreChatMessageDocument, 'timestamp'> & { timestamp: ReturnType<typeof serverTimestamp> });
  } catch (error) {
    console.error('Error sending message to Firestore: ', error);
    throw new Error('Failed to send message.');
  }
}

type MessagesCallback = (messages: AppChatMessage[]) => void;
type Unsubscribe = () => void;

export function subscribeToMessages(callback: MessagesCallback): Unsubscribe {
  const q = query(
    collection(db, MESSAGES_COLLECTION), 
    orderBy('timestamp', 'desc'), // Get newest messages first
    limit(MESSAGES_LIMIT) // Limit the number of messages fetched
  );

  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const messages: AppChatMessage[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data() as FirestoreChatMessageDocument;
      messages.push({
        id: doc.id,
        text: data.text,
        senderId: data.senderId,
        senderName: data.senderName || 'Unknown User',
        timestamp: data.timestamp ? data.timestamp.toDate() : new Date(), // Convert Firestore Timestamp to JS Date
      });
    });
    callback(messages.reverse()); // Reverse to show oldest first in the UI (for correct scroll order)
  }, (error) => {
    console.error("Error subscribing to messages: ", error);
    // Potentially notify the user or implement retry logic
  });

  return unsubscribe; // Return the unsubscribe function
}
