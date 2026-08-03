import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  Animated, Dimensions, StatusBar, Platform,
} from 'react-native';
import { auth, db } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';

const { width } = Dimensions.get('window');

const TASKS = [
  {
    id: 'audio',
    route: 'AudioCapture',
    emoji: '🎙️',
    label: 'Voice Recording',
    desc: 'Record speech in your language',
    color: '#8b5cf6',
    bg: 'rgba(139,92,246,0.15)',
    border: '#8b5cf6',
  },
  {
    id: 'text',
    route: 'TextEntry',
    emoji: '📝',
    label: 'Text & Translation',
    desc: 'Corpus, translations, RLHF prompts',
    color: '#06b6d4',
    bg: 'rgba(6,182,212,0.15)',
    border: '#06b6d4',
  },
  {
    id: 'eval',
    route: 'EvalTask',
    emoji: '🤖',
    label: 'AI Evaluation',
    desc: 'Rate AI responses for quality',
    color: '#f06135',
    bg: 'rgba(240,97,53,0.15)',
    border: '#f06135',
  },
  {
    id: 'photo',
    route: 'AddEntry',
    emoji: '📷',
    label: 'Geo Photo',
    desc: 'Document businesses & landmarks',
    color: '#10b981',
    bg: 'rgba(16,185,129,0.15)',
    border: '#10b981',
  },
];

interface AgentStats {
  todayCount: number;
  lifetime: number;
  airtimeEarned: number;
  points: number;
}

export default function HomeScreen({ navigation }: any) {
  const [stats, setStats] = useState<AgentStats>({ todayCount: 0, lifetime: 0, airtimeEarned: 0, points: 0 });
  const [agentName, setAgentName] = useState('Agent');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  useEffect(() => {
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;
    const dateStr = new Date().toISOString().split('T')[0];

    const unsubUser = onSnapshot(doc(db, 'users', uid), (snap) => {
      if (snap.exists()) {
        const d = snap.data();
        setAgentName(d.displayName || d.name || 'Agent');
        setStats(s => ({
          ...s,
          lifetime: d.totalEntries || 0,
          airtimeEarned: d.totalAirtimeEarnedKES || 0,
          points: d.points || 0,
        }));
      }
    });

    const unsubDaily = onSnapshot(doc(db, 'daily_stats', `${uid}_${dateStr}`), (snap) => {
      if (snap.exists()) {
        setStats(s => ({ ...s, todayCount: snap.data().validCount || 0 }));
      }
    });

    return () => { unsubUser(); unsubDaily(); };
  }, []);

  const dailyGoal = 10;
  const progress = Math.min(stats.todayCount / dailyGoal, 1);
  const firstName = agentName.split(' ')[0];

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* ── Header ── */}
        <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.agentName}>{firstName} 👋</Text>
          </View>
          <TouchableOpacity style={styles.historyBtn} onPress={() => navigation.navigate('History')}>
            <Text style={styles.historyBtnText}>History</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* ── Stats Row ── */}
        <Animated.View style={[styles.statsRow, { opacity: fadeAnim }]}>
          <View style={[styles.statCard, { borderColor: 'rgba(139,92,246,0.4)' }]}>
            <Text style={[styles.statValue, { color: '#8b5cf6' }]}>{stats.todayCount}</Text>
            <Text style={styles.statLabel}>Today</Text>
          </View>
          <View style={[styles.statCard, { borderColor: 'rgba(6,182,212,0.4)' }]}>
            <Text style={[styles.statValue, { color: '#06b6d4' }]}>{stats.lifetime}</Text>
            <Text style={styles.statLabel}>Lifetime</Text>
          </View>
          <View style={[styles.statCard, { borderColor: 'rgba(16,185,129,0.4)' }]}>
            <Text style={[styles.statValue, { color: '#10b981' }]}>KES {stats.airtimeEarned}</Text>
            <Text style={styles.statLabel}>Earned</Text>
          </View>
        </Animated.View>

        {/* ── Daily Progress ── */}
        <Animated.View style={[styles.progressCard, { opacity: fadeAnim }]}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Daily Goal</Text>
            <Text style={styles.progressCount}>
              {stats.todayCount}/{dailyGoal}
              {stats.todayCount >= dailyGoal ? ' ✅' : ''}
            </Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>
          <Text style={styles.progressHint}>
            {stats.todayCount >= dailyGoal
              ? 'Daily reward qualified! Keep going.'
              : `${dailyGoal - stats.todayCount} more submissions for today's reward`}
          </Text>
        </Animated.View>

        {/* ── Task Cards ── */}
        <Text style={styles.sectionTitle}>Collect Data</Text>

        {TASKS.map((task, i) => (
          <Animated.View
            key={task.id}
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: Animated.add(slideAnim, new Animated.Value(i * 8)) }],
            }}
          >
            <TouchableOpacity
              style={[styles.taskCard, { borderColor: task.border, backgroundColor: task.bg }]}
              onPress={() => navigation.navigate(task.route)}
              activeOpacity={0.85}
            >
              <Text style={styles.taskEmoji}>{task.emoji}</Text>
              <View style={styles.taskText}>
                <Text style={[styles.taskLabel, { color: task.color }]}>{task.label}</Text>
                <Text style={styles.taskDesc}>{task.desc}</Text>
              </View>
              <View style={[styles.taskArrow, { backgroundColor: task.color + '25' }]}>
                <Text style={[styles.taskArrowText, { color: task.color }]}>›</Text>
              </View>
            </TouchableOpacity>
          </Animated.View>
        ))}

        {/* ── Sign Out ── */}
        <TouchableOpacity style={styles.signOutBtn} onPress={() => auth.signOut()}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  scroll: {
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 56 : 36,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  greeting: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '400',
  },
  agentName: {
    color: '#f1f5f9',
    fontSize: 26,
    fontWeight: '700',
    marginTop: 2,
  },
  historyBtn: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  historyBtnText: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  statLabel: {
    color: '#64748b',
    fontSize: 11,
    marginTop: 4,
    fontWeight: '500',
  },
  progressCard: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 16,
    marginBottom: 28,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  progressTitle: {
    color: '#cbd5e1',
    fontSize: 14,
    fontWeight: '600',
  },
  progressCount: {
    color: '#f1f5f9',
    fontSize: 14,
    fontWeight: '700',
  },
  progressTrack: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 99,
    overflow: 'hidden',
  },
  progressFill: {
    height: 6,
    backgroundColor: '#8b5cf6',
    borderRadius: 99,
  },
  progressHint: {
    color: '#64748b',
    fontSize: 12,
    marginTop: 8,
  },
  sectionTitle: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
    gap: 14,
  },
  taskEmoji: {
    fontSize: 28,
    width: 38,
    textAlign: 'center',
  },
  taskText: {
    flex: 1,
  },
  taskLabel: {
    fontSize: 15,
    fontWeight: '700',
  },
  taskDesc: {
    color: '#64748b',
    fontSize: 12,
    marginTop: 3,
  },
  taskArrow: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskArrowText: {
    fontSize: 22,
    fontWeight: '700',
    marginTop: -2,
  },
  signOutBtn: {
    marginTop: 12,
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
    backgroundColor: 'rgba(239,68,68,0.06)',
  },
  signOutText: {
    color: '#ef4444',
    fontWeight: '600',
    fontSize: 14,
  },
});
