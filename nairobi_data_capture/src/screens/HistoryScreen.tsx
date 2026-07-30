import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { auth, db } from '../firebase';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';

export default function HistoryScreen() {
  const [entries, setEntries] = useState<any[]>([]);

  useEffect(() => {
    if (!auth.currentUser) return;
    const q = query(
      collection(db, 'entries'),
      where('uid', '==', auth.currentUser.uid),
      orderBy('timestamp', 'desc')
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setEntries(data);
    });

    return () => unsub();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Submissions</Text>
      <FlatList
        data={entries}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.businessName}>{item.businessName}</Text>
            <Text>Category: {item.category}</Text>
            <Text style={styles.status(item.status)}>Status: {item.status.toUpperCase()}</Text>
            <Text style={styles.date}>{item.timestamp?.toDate().toLocaleString()}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  card: { padding: 15, marginBottom: 10, borderWidth: 1, borderColor: '#ccc', borderRadius: 8 },
  businessName: { fontSize: 18, fontWeight: 'bold' },
  status: (status: string) => ({
    color: status === 'verified' ? 'green' : status === 'rejected' ? 'red' : 'orange',
    fontWeight: 'bold',
    marginTop: 5
  }),
  date: { fontSize: 12, color: 'gray', marginTop: 5 }
});
