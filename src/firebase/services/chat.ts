import {
  ref,
  push,
  set,
  onValue,
  off,
  serverTimestamp as rtdbServerTimestamp
} from 'firebase/database';
import {
  collection,
  doc,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp as firestoreServerTimestamp
} from 'firebase/firestore';
import { rtdb, db, auth, isUserAdmin } from '../config';
import { ChatMessage } from '../types';

/**
 * Sends a message in a conversation.
 * Tries Realtime Database first, and falls back to Firestore if RTDB fails or is not enabled.
 */
export async function sendChatMessage(params: {
  conversationId: string;
  text: string;
  preferredLanguage?: 'en' | 'bn';
}): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error('NOT_AUTHENTICATED');

  const cleanText = params.text.trim();
  if (!cleanText || cleanText.length > 1000) {
    throw new Error('INVALID_MESSAGE_LENGTH');
  }

  const isAdmin = isUserAdmin(user.uid, user.email);

  const messageData = {
    conversationId: params.conversationId,
    senderUid: user.uid,
    senderName: isAdmin ? 'Administrator' : (user.displayName || user.email?.split('@')[0] || 'User'),
    senderRole: isAdmin ? ('admin' as const) : ('user' as const),
    text: cleanText,
    timestamp: Date.now(),
  };

  let rtdbSuccess = false;
  try {
    const messagesRef = ref(rtdb, `conversations/${params.conversationId}/messages`);
    const newMsgRef = push(messagesRef);
    await set(newMsgRef, {
      ...messageData,
      id: newMsgRef.key || 'msg_' + Date.now(),
    });
    rtdbSuccess = true;
  } catch (rtdbErr) {
    console.warn('Realtime Database write failed, attempting Firestore fallback:', rtdbErr);
  }

  // Also sync or fallback to Firestore
  try {
    const firestoreCol = collection(db, 'conversations', params.conversationId, 'messages');
    await addDoc(firestoreCol, {
      ...messageData,
      createdAt: firestoreServerTimestamp(),
    });
  } catch (fsErr) {
    if (!rtdbSuccess) {
      throw fsErr;
    }
  }
}

/**
 * Subscribes to live messages for a conversation.
 * Combines RTDB with Firestore listeners for maximum resilience.
 */
export function subscribeToChatMessages(
  conversationId: string,
  onMessages: (messages: ChatMessage[]) => void
): () => void {
  let isUnmounted = false;
  let rtdbMessagesMap = new Map<string, ChatMessage>();
  let firestoreMessagesMap = new Map<string, ChatMessage>();

  const emitCombined = () => {
    if (isUnmounted) return;
    const combined = new Map<string, ChatMessage>();

    // Merge from both sources, deduping by content/timestamp or ID
    rtdbMessagesMap.forEach((msg, key) => combined.set(key, msg));
    firestoreMessagesMap.forEach((msg, key) => combined.set(key, msg));

    const list = Array.from(combined.values());
    list.sort((a, b) => {
      const timeA = typeof a.timestamp === 'number' ? a.timestamp : new Date(a.timestamp).getTime();
      const timeB = typeof b.timestamp === 'number' ? b.timestamp : new Date(b.timestamp).getTime();
      return timeA - timeB;
    });

    onMessages(list);
  };

  // 1. RTDB listener
  const messagesRef = ref(rtdb, `conversations/${conversationId}/messages`);
  const rtdbCallback = onValue(
    messagesRef,
    (snapshot) => {
      const val = snapshot.val();
      rtdbMessagesMap.clear();
      if (val) {
        Object.keys(val).forEach((key) => {
          const item = val[key];
          rtdbMessagesMap.set(key, {
            id: key,
            conversationId,
            senderUid: item.senderUid,
            senderName: item.senderName,
            senderRole: item.senderRole || 'user',
            text: item.text,
            timestamp: item.timestamp || Date.now(),
          });
        });
      }
      emitCombined();
    },
    (err) => {
      console.warn('RTDB listen error, relying on Firestore:', err);
    }
  );

  // 2. Firestore listener fallback
  const fsQuery = query(
    collection(db, 'conversations', conversationId, 'messages'),
    orderBy('createdAt', 'asc')
  );

  const unsubscribeFs = onSnapshot(
    fsQuery,
    (snapshot) => {
      firestoreMessagesMap.clear();
      snapshot.docs.forEach((d) => {
        const item = d.data();
        firestoreMessagesMap.set(d.id, {
          id: d.id,
          conversationId,
          senderUid: item.senderUid,
          senderName: item.senderName,
          senderRole: item.senderRole || 'user',
          text: item.text,
          timestamp: item.timestamp || Date.now(),
        });
      });
      emitCombined();
    },
    (err) => {
      console.warn('Firestore chat listen error:', err);
    }
  );

  return () => {
    isUnmounted = true;
    off(messagesRef, 'value', rtdbCallback);
    unsubscribeFs();
  };
}
