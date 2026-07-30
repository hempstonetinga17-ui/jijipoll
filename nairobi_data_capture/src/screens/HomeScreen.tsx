import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { auth, db } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';

export default function HomeScreen({ navigation }: any) {
  const [stats, setStats] = useState({ todayCount: 0, lifetime: 0, airtimeEarned: 0 });

  useEffect(() => {
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;
    const dateStr = new Date().toISOString().split('T')[0];
    
    // Listen to user doc for lifetime stats
    const unsubUser = onSnapshot(doc(db, 'users', uid), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setStats(s => ({ ...s, lifetime: data.totalEntries || 0, airtimeEarned: data.totalAirtimeEarnedKES || 0 }));
      }
    });

    // Listen to daily stats
    const unsubDaily = onSnapshot(doc(db, 'daily_stats', `${uid}_${dateStr}`), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setStats(s => ({ ...s, todayCount: data.validCount || 0 }));
      }
    });

    return () => { unsubUser(); unsubDaily(); };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dashboard</Text>
      <Text>Today's Entries: {stats.todayCount} / 100</Text>
      <Text>{stats.todayCount >= 10 ? '✅ Reward qualified today' : '❌ Needs 10 entries for daily reward'}</Text>
      <Text>Lifetime Entries: {stats.lifetime}</Text>
      <Text>Total Airtime Earned: KES {stats.airtimeEarned}</Text>

      <View style={styles.actions}>
        <Button title="Add Entry" onPress={() => navigation.navigate('AddEntry')} disabled={stats.todayCount >= 100} />
        <Button title="History" onPress={() => navigation.navigate('History')} />
        <Button title="Sign Out" onPress={() => auth.signOut()} color="red" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  actions: { marginTop: 40, gap: 10 }
});
