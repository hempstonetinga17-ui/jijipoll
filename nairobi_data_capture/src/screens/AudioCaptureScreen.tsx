import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  Alert, Animated, Pressable
} from 'react-native';
import { Audio } from 'expo-av';
import * as Location from 'expo-location';
import { auth, db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { apiPost } from '../api';

const LANGUAGES = [
  { code: 'sw', name: 'Swahili', native: 'Kiswahili' },
  { code: 'ki', name: 'Kikuyu', native: 'Gĩkũyũ' },
  { code: 'luo', name: 'Luo', native: 'Dholuo' },
  { code: 'luh', name: 'Luhya', native: 'Luluhya' },
  { code: 'kam', name: 'Kamba', native: 'Kĩkamba' },
  { code: 'mer', name: 'Meru', native: 'Kimeru' },
  { code: 'som', name: 'Somali', native: 'Soomaali' },
  { code: 'mas', name: 'Maasai', native: 'Maa' },
  { code: 'en', name: 'English', native: 'English' },
];

const ENVIRONMENTS = ['INDOOR', 'OUTDOOR', 'NOISY', 'QUIET'];

const SAMPLE_PROMPTS = [
  'Sema jina lako na mahali unapoishi.',
  'Eleza shughuli yako ya kila siku.',
  'Je, mkulima anapanda nini wakati wa mvua?',
  'Hospitali iko karibu na soko.',
  'Ninataka kujua bei ya unga na sukari.',
];

export default function AudioCaptureScreen({ navigation, route }: any) {
  const task = route?.params?.task;
  const prompts: string[] = task?.prompts?.length ? task.prompts : SAMPLE_PROMPTS;

  const [promptIdx, setPromptIdx] = useState(0);
  const [language, setLanguage] = useState(LANGUAGES[0]);
  const [dialect, setDialect] = useState('');
  const [environment, setEnvironment] = useState('INDOOR');
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [location, setLocation] = useState<any>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    (async () => {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({});
        setLocation(loc.coords);
      }
    })();
    return () => { sound?.unloadAsync(); };
  }, []);

  useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.3, duration: 600, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isRecording]);

  const startRecording = async () => {
    try {
      setAudioUri(null);
      setDuration(0);
      const rec = new Audio.Recording();
      await rec.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await rec.startAsync();
      setRecording(rec);
      setIsRecording(true);
    } catch (e) {
      Alert.alert('Error', 'Could not start recording.');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;
    setIsRecording(false);
    await recording.stopAndUnloadAsync();
    const status = await recording.getStatusAsync();
    setDuration((status as any).durationMillis / 1000);
    setAudioUri(recording.getURI() ?? null);
    setRecording(null);
  };

  const playback = async () => {
    if (!audioUri) return;
    if (sound) { await sound.unloadAsync(); }
    const { sound: s } = await Audio.Sound.createAsync({ uri: audioUri });
    setSound(s);
    setIsPlaying(true);
    await s.playAsync();
    s.setOnPlaybackStatusUpdate(status => {
      if ('didJustFinish' in status && status.didJustFinish) setIsPlaying(false);
    });
  };

  const submit = async () => {
    if (!audioUri) return;
    setSubmitting(true);
    try {
      // Primary: REST API (goes to Postgres via Prisma)
      await apiPost('/api/submissions/audio', {
        taskId: task?.id ?? null,
        languageId: null, // TODO: map language.code to DB language id
        dialect: dialect || null,
        audioUrl: `audio/${Date.now()}_${auth.currentUser?.uid}.m4a`, // Placeholder until R2 pre-signed upload
        durationSecs: Math.round(duration),
        scriptPrompt: prompts[promptIdx],
        isScripted: true,
        audioType: 'MONOLOGUE',
        environment,
        latitude: location?.latitude ?? null,
        longitude: location?.longitude ?? null,
      });

      // Mirror: Firestore (for real-time field dashboard)
      await addDoc(collection(db, 'audio_submissions'), {
        uid: auth.currentUser?.uid,
        taskId: task?.id ?? null,
        languageCode: language.code,
        environment,
        scriptPrompt: prompts[promptIdx],
        durationSecs: Math.round(duration),
        status: 'PENDING',
        timestamp: serverTimestamp(),
      });

      Alert.alert('Submitted! 🎉', 'Your recording was submitted successfully.', [
        { text: 'Record Another', onPress: () => { setAudioUri(null); setPromptIdx(i => (i + 1) % prompts.length); } },
        { text: 'Done', onPress: () => navigation.goBack() },
      ]);
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Could not submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🎙 Voice Recording</Text>
        <Text style={styles.headerSub}>{task?.title ?? 'Audio Collection Task'}</Text>
      </View>

      {/* Prompt card */}
      <View style={styles.promptCard}>
        <Text style={styles.promptLabel}>READ ALOUD ({promptIdx + 1}/{prompts.length})</Text>
        <Text style={styles.promptText}>{prompts[promptIdx]}</Text>
        <View style={styles.promptNav}>
          <TouchableOpacity onPress={() => setPromptIdx(i => Math.max(0, i - 1))} style={styles.navBtn}>
            <Text style={styles.navBtnText}>← Prev</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setPromptIdx(i => (i + 1) % prompts.length)} style={styles.navBtn}>
            <Text style={styles.navBtnText}>Next →</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Language selector */}
      <Text style={styles.sectionLabel}>LANGUAGE</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
        {LANGUAGES.map(lang => (
          <Pressable key={lang.code} onPress={() => setLanguage(lang)}
            style={[styles.chip, language.code === lang.code && styles.chipActive]}>
            <Text style={[styles.chipText, language.code === lang.code && styles.chipTextActive]}>{lang.name}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Environment selector */}
      <Text style={styles.sectionLabel}>ENVIRONMENT</Text>
      <View style={styles.envRow}>
        {ENVIRONMENTS.map(env => (
          <Pressable key={env} onPress={() => setEnvironment(env)}
            style={[styles.envChip, environment === env && styles.envChipActive]}>
            <Text style={[styles.envChipText, environment === env && styles.envChipTextActive]}>
              {env === 'INDOOR' ? '🏠' : env === 'OUTDOOR' ? '🌳' : env === 'NOISY' ? '🔊' : '🤫'} {env}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Recording button */}
      <View style={styles.recordSection}>
        {!audioUri ? (
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <TouchableOpacity
              onPress={isRecording ? stopRecording : startRecording}
              style={[styles.recordBtn, isRecording && styles.recordBtnActive]}>
              <Text style={styles.recordBtnIcon}>{isRecording ? '⏹' : '🎙'}</Text>
              <Text style={styles.recordBtnText}>{isRecording ? 'Stop Recording' : 'Start Recording'}</Text>
            </TouchableOpacity>
          </Animated.View>
        ) : (
          <View style={styles.playbackSection}>
            <Text style={styles.durationText}>✅ Recorded: {Math.round(duration)}s</Text>
            <View style={styles.playbackBtns}>
              <TouchableOpacity onPress={playback} style={styles.playBtn}>
                <Text style={styles.playBtnText}>{isPlaying ? '⏸ Playing…' : '▶ Play Back'}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setAudioUri(null)} style={styles.retakeBtn}>
                <Text style={styles.retakeBtnText}>🔄 Retake</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* Submit */}
      {audioUri && (
        <TouchableOpacity onPress={submit} disabled={submitting} style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}>
          <Text style={styles.submitBtnText}>{submitting ? 'Submitting…' : 'Submit Recording ✓'}</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d1117' },
  content: { padding: 20, paddingBottom: 40 },
  header: { marginBottom: 20 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#f1f5f9', marginBottom: 4 },
  headerSub: { fontSize: 13, color: '#475569' },
  promptCard: { backgroundColor: 'rgba(139,92,246,0.1)', borderWidth: 1, borderColor: 'rgba(139,92,246,0.3)', borderRadius: 16, padding: 20, marginBottom: 24 },
  promptLabel: { fontSize: 10, fontWeight: '700', color: '#8b5cf6', letterSpacing: 1, marginBottom: 10, textTransform: 'uppercase' },
  promptText: { fontSize: 20, color: '#f1f5f9', fontWeight: '600', lineHeight: 30, marginBottom: 16 },
  promptNav: { flexDirection: 'row', justifyContent: 'space-between' },
  navBtn: { padding: 8, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 8 },
  navBtnText: { color: '#8b5cf6', fontWeight: '600', fontSize: 13 },
  sectionLabel: { fontSize: 10, fontWeight: '700', color: '#475569', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 },
  chipRow: { marginBottom: 20, flexDirection: 'row' },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', marginRight: 8 },
  chipActive: { backgroundColor: 'rgba(139,92,246,0.2)', borderColor: '#8b5cf6' },
  chipText: { color: '#475569', fontSize: 13, fontWeight: '600' },
  chipTextActive: { color: '#8b5cf6' },
  envRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
  envChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  envChipActive: { backgroundColor: 'rgba(240,97,53,0.15)', borderColor: 'rgba(240,97,53,0.4)' },
  envChipText: { color: '#475569', fontSize: 12, fontWeight: '600' },
  envChipTextActive: { color: '#f06135' },
  recordSection: { alignItems: 'center', marginBottom: 24 },
  recordBtn: { alignItems: 'center', justifyContent: 'center', width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 2, borderColor: 'rgba(255,255,255,0.15)' },
  recordBtnActive: { backgroundColor: 'rgba(239,68,68,0.2)', borderColor: '#ef4444' },
  recordBtnIcon: { fontSize: 36, marginBottom: 4 },
  recordBtnText: { color: '#94a3b8', fontSize: 11, fontWeight: '600', textAlign: 'center' },
  playbackSection: { alignItems: 'center', width: '100%' },
  durationText: { fontSize: 16, color: '#10b981', fontWeight: '700', marginBottom: 16 },
  playbackBtns: { flexDirection: 'row', gap: 12 },
  playBtn: { paddingHorizontal: 20, paddingVertical: 12, backgroundColor: 'rgba(139,92,246,0.15)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(139,92,246,0.3)' },
  playBtnText: { color: '#8b5cf6', fontWeight: '700', fontSize: 14 },
  retakeBtn: { paddingHorizontal: 20, paddingVertical: 12, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' },
  retakeBtnText: { color: '#94a3b8', fontWeight: '700', fontSize: 14 },
  submitBtn: { backgroundColor: '#f06135', borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  submitBtnDisabled: { opacity: 0.5 },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '800', letterSpacing: 0.3 },
});
