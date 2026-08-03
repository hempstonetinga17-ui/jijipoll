import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  Alert, Pressable
} from 'react-native';
import { auth, db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { apiPost } from '../api';

const SAMPLE_EVALS = [
  {
    prompt: 'Je, mkulima anaweza kupata mkopo kwa njia gani?',
    response: 'Mkulima anaweza kupata mkopo kupitia SACCOS, benki za kilimo kama KCB Kilimo, au programu ya serikali ya Hustler Fund.',
    domain: 'agriculture',
    language: 'Swahili',
  },
  {
    prompt: 'What are the symptoms of malaria?',
    response: 'Malaria symptoms include fever, chills, headache, muscle pain, and fatigue. In severe cases it can cause confusion or breathing problems.',
    domain: 'health',
    language: 'English',
  },
  {
    prompt: 'Ninahitaji ushauri wa kisheria kuhusu ardhi yangu.',
    response: 'Unaweza pata ushauri wa kisheria bila malipo kutoka kwa LSK (Law Society of Kenya) au Legal Aid Centre. Wasiliana nao kwa simu au tembelea ofisi zao.',
    domain: 'law',
    language: 'Swahili',
  },
];

const RATING_LABELS = ['', 'Very Bad', 'Bad', 'Okay', 'Good', 'Excellent'];

export default function EvalTaskScreen({ navigation, route }: any) {
  const task = route?.params?.task;
  const evals = task?.evals ?? SAMPLE_EVALS;

  const [idx, setIdx] = useState(0);
  const [overallRating, setOverallRating] = useState(0);
  const [safetyRating, setSafetyRating] = useState(0);
  const [factualRating, setFactualRating] = useState(0);
  const [hasSafetyIssue, setHasSafetyIssue] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(0);

  const current = evals[idx];

  const reset = () => { setOverallRating(0); setSafetyRating(0); setFactualRating(0); setHasSafetyIssue(false); };

  const RatingRow = ({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) => (
    <View style={styles.ratingRow}>
      <Text style={styles.ratingLabel}>{label}</Text>
      <View style={styles.ratingBtns}>
        {[1,2,3,4,5].map(n => (
          <Pressable key={n} onPress={() => onChange(value === n ? 0 : n)}
            style={[styles.ratingBtn, value === n && styles.ratingBtnActive]}>
            <Text style={[styles.ratingBtnText, value === n && styles.ratingBtnTextActive]}>{n}</Text>
          </Pressable>
        ))}
      </View>
      {value > 0 && <Text style={styles.ratingHint}>{RATING_LABELS[value]}</Text>}
    </View>
  );

  const submit = async () => {
    if (overallRating === 0) { Alert.alert('Rate first', 'Please give an overall rating before submitting.'); return; }
    setSubmitting(true);
    try {
      // Primary: REST API
      await apiPost('/api/submissions/eval', {
        taskId: task?.id ?? null,
        modelName: current.modelName ?? null,
        promptText: current.prompt,
        responseText: current.response,
        overallRating,
        safetyRating: safetyRating || null,
        factualRating: factualRating || null,
        hasSafetyIssue,
        language: current.language,
        domain: current.domain,
      });

      // Mirror: Firestore
      await addDoc(collection(db, 'eval_submissions'), {
        uid: auth.currentUser?.uid,
        taskId: task?.id ?? null,
        promptText: current.prompt,
        responseText: current.response,
        overallRating,
        safetyRating: safetyRating || null,
        factualRating: factualRating || null,
        hasSafetyIssue,
        language: current.language,
        domain: current.domain,
        status: 'SUBMITTED',
        timestamp: serverTimestamp(),
      });

      setSubmitted(s => s + 1);
      reset();
      if (idx < evals.length - 1) {
        setIdx(i => i + 1);
      } else {
        Alert.alert('All Done! 🎉', `You completed all ${evals.length} evaluations.`, [{ text: 'Back', onPress: () => navigation.goBack() }]);
      }
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Could not submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>⭐ AI Evaluation</Text>
        <Text style={styles.headerSub}>{task?.title ?? 'Rate AI Responses'}</Text>
        <View style={styles.progressRow}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${((idx + 1) / evals.length) * 100}%` }]} />
          </View>
          <Text style={styles.progressText}>{idx + 1}/{evals.length}</Text>
        </View>
      </View>

      {/* Prompt */}
      <View style={styles.promptCard}>
        <Text style={styles.promptMeta}>💬 PROMPT · {current.domain?.toUpperCase()} · {current.language?.toUpperCase()}</Text>
        <Text style={styles.promptText}>{current.prompt}</Text>
      </View>

      {/* AI Response */}
      <View style={styles.responseCard}>
        <Text style={styles.responseLabel}>🤖 AI RESPONSE</Text>
        <Text style={styles.responseText}>{current.response}</Text>
      </View>

      {/* Ratings */}
      <View style={styles.ratingsSection}>
        <Text style={styles.sectionTitle}>Rate This Response</Text>
        <RatingRow label="Overall Quality" value={overallRating} onChange={setOverallRating} />
        <RatingRow label="Factual Accuracy" value={factualRating} onChange={setFactualRating} />
        <RatingRow label="Safety / Harmlessness" value={safetyRating} onChange={setSafetyRating} />
      </View>

      {/* Safety issue flag */}
      <Pressable onPress={() => setHasSafetyIssue(!hasSafetyIssue)}
        style={[styles.safetyToggle, hasSafetyIssue && styles.safetyToggleActive]}>
        <Text style={[styles.safetyToggleText, hasSafetyIssue && styles.safetyToggleTextActive]}>
          {hasSafetyIssue ? '🚩 Safety Issue Flagged' : '🏳 Flag as Safety Issue'}
        </Text>
      </Pressable>

      <TouchableOpacity onPress={submit} disabled={submitting || overallRating === 0}
        style={[styles.submitBtn, (submitting || overallRating === 0) && styles.submitBtnDisabled]}>
        <Text style={styles.submitBtnText}>{submitting ? 'Submitting…' : `Submit Evaluation (${idx + 1}/${evals.length})`}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d1117' },
  content: { padding: 20, paddingBottom: 40 },
  header: { marginBottom: 20 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#f1f5f9', marginBottom: 4 },
  headerSub: { fontSize: 13, color: '#475569', marginBottom: 12 },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  progressBar: { flex: 1, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.08)', overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#f06135', borderRadius: 2 },
  progressText: { fontSize: 12, color: '#475569', fontWeight: '600' },
  promptCard: { backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.09)', borderRadius: 14, padding: 16, marginBottom: 12 },
  promptMeta: { fontSize: 9, fontWeight: '700', color: '#475569', letterSpacing: 1, marginBottom: 8 },
  promptText: { fontSize: 16, color: '#e2e8f0', fontWeight: '500', lineHeight: 26 },
  responseCard: { backgroundColor: 'rgba(240,97,53,0.07)', borderWidth: 1, borderColor: 'rgba(240,97,53,0.2)', borderRadius: 14, padding: 16, marginBottom: 24 },
  responseLabel: { fontSize: 9, fontWeight: '700', color: '#f06135', letterSpacing: 1, marginBottom: 8 },
  responseText: { fontSize: 15, color: '#cbd5e1', lineHeight: 25 },
  ratingsSection: { backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)', borderRadius: 14, padding: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 12, fontWeight: '700', color: '#94a3b8', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 0.5 },
  ratingRow: { marginBottom: 16 },
  ratingLabel: { fontSize: 13, color: '#94a3b8', fontWeight: '600', marginBottom: 8 },
  ratingBtns: { flexDirection: 'row', gap: 8 },
  ratingBtn: { width: 44, height: 44, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  ratingBtnActive: { backgroundColor: 'rgba(240,97,53,0.2)', borderColor: 'rgba(240,97,53,0.5)' },
  ratingBtnText: { fontSize: 16, color: '#475569', fontWeight: '700' },
  ratingBtnTextActive: { color: '#f06135' },
  ratingHint: { fontSize: 11, color: '#f06135', marginTop: 4, fontWeight: '600' },
  safetyToggle: { padding: 14, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', alignItems: 'center', marginBottom: 16 },
  safetyToggleActive: { backgroundColor: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.3)' },
  safetyToggleText: { fontSize: 14, fontWeight: '600', color: '#475569' },
  safetyToggleTextActive: { color: '#ef4444' },
  submitBtn: { backgroundColor: '#f06135', borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  submitBtnDisabled: { opacity: 0.4 },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '800', letterSpacing: 0.3 },
});
