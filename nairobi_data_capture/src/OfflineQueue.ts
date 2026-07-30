import AsyncStorage from '@react-native-async-storage/async-storage';
import { db, auth } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const QUEUE_KEY = '@offline_queue';

export const queueEntry = async (entry: any) => {
  const queueJson = await AsyncStorage.getItem(QUEUE_KEY);
  const queue = queueJson ? JSON.parse(queueJson) : [];
  queue.push(entry);
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
};

export const syncQueue = async () => {
  if (!auth.currentUser) return;
  const uid = auth.currentUser.uid;
  const queueJson = await AsyncStorage.getItem(QUEUE_KEY);
  if (!queueJson) return;

  const queue = JSON.parse(queueJson);
  const remaining = [];

  for (const entry of queue) {
    try {
      // In reality, here we would also upload to R2, get objectKey, then save to Firestore.
      // For MVP sync, we assume R2 upload happens when online.
      
      // Example logic for syncing
      await addDoc(collection(db, 'entries'), {
        ...entry,
        uid,
        status: 'pending',
        timestamp: serverTimestamp()
      });
    } catch (e) {
      remaining.push(entry);
    }
  }

  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(remaining));
};
