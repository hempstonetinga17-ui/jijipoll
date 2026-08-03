import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, Pressable, KeyboardAvoidingView, Platform
} from 'react-native';
import { auth, db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { apiPost } from '../api';

const LANGUAGES = [
  { code: 'sw', name: 'Swahili' }, { code: 'ki', name: 'Kikuyu' },
  { code: 'luo', name: 'Luo' }, { code: 'luh', name: 'Luhya' },
  { code: 'kam', name: 'Kamba' }, { code: 'som', name: 'Somali' },
  { code: 'en', name: 'English' },
];

const TEXT_TYPES = [
  { value: 'CORPUS', label: '📖 Corpus', desc: 'Write a sentence about the prompt topic' },
  { value: 'TRANSLATION', label: '🌍 Translation', desc: 'Translate the source text to your language' },
  { value: 'RLHF_PROMPT', label: '🤖 RLHF', desc: 'Write a prompt or question for an AI system' },
];

const SAMPLE_PROMPTS: Record<string, string[]> = {
  CORPUS: [
    'Write a sentence about farming practices in your region.',
    'Describe what happens at your local health clinic.',
    'Explain how to send money using your phone.',
    'Write about a typical school day for a child in your area.',
  ],
  TRANSLATION: [
    'The patient needs to take this medicine twice a day.',
    'The government is building a new road to the village.',
    'Farmers received support from the cooperative this season.',
    'Please fill in this form to register your business.',
  ],
  RLHF_PROMPT: [
    'Write a question you would ask a doctor about malaria.',
    'Ask an AI how to start a small business in your area.',
    'Write a question about how to improve crop yields.',
    'Ask for advice on saving money as a boda boda rider.',
  ],
};

export default function TextEntryScreen({ navigation, route }: any) {
  const task = route?.params?.task;
  const [textType, setTextType] = useState('CORPUS');
  const [language, setLanguage] = useState(LANGUAGES[0]);
  const [promptIdx, setPromptIdx] = useState(0);
  const [inputText, setInputText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(0);

  const prompts = task?.prompts?.length ? task.prompts : (SAMPLE_PROMPTS[textType] ?? SAMPLE_PROMPTS.CORPUS);
  const currentPrompt = prompts[promptIdx];
  const minChars = textType === 'RLHF_PROMPT' ? 20 : 30;

  const submit = async () => {
    if (inputText.trim().length < minChars) {
      Alert.alert('Too short', `Please write at least ${minChars} characters.`);
      return;
    }
    setSubmitting(true);
    try {
      // Primary: REST API
      await apiPost('/api/submissions/text', {
        taskId: task?.id ?? null,
        languageId: null, // TODO: map language.code to DB language id
        sourceLanguage: language.code,
        textType,
        domain: task?.domain ?? null,
        sourceText: currentPrompt,
        submittedText: inputText.trim(),
        conversationTurn: 1,
      });

      // Mirror: Firestore
      await addDoc(collection(db, 'text_submissions'), {
        uid: auth.currentUser?.uid,
        taskId: task?.id ?? null,
        languageCode: language.code,
        textType,
        sourceText: currentPrompt,
        submittedText: inputText.trim(),
        status: 'PENDING',
        timestamp: serverTimestamp(),
      });

      setSubmitted(s => s + 1);
      setInputText('');
      setPromptIdx(i => (i + 1) % prompts.length);
      Alert.alert('Submitted! ✓', `Entry #${submitted + 1} saved. Keep going!`);
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>✍️ Text Entry</Text>
          <Text style={styles.headerSub}>{task?.title ?? 'Text Collection Task'}</Text>
          {submitted > 0 && <Text style={styles.badge}>{submitted} submitted today</Text>}
        </View>

        {/* Type selector */}
        <Text style={styles.label}>TASK TYPE</Text>
        <View style={styles.typeRow}>
          {TEXT_TYPES.map(tt => (
            <Pressable key={tt.value} onPress={() => { setTextType(tt.value); setPromptIdx(0); setInputText(''); }}
              style={[styles.typeChip, textType === tt.value && styles.typeChipActive]}>
              <Text style={[styles.typeChipText, textType === tt.value && styles.typeChipTextActive]}>{tt.label}</Text>
            </Pressable>
          ))}
        </View>

        {/* Language */}
        <Text style={styles.label}>YOUR LANGUAGE</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
          {LANGUAGES.map(lang => (
            <Pressable key={lang.code} onPress={() => setLanguage(lang)}
              style={[styles.chip, language.code === lang.code && styles.chipActive]}>
              <Text style={[styles.chipText, language.code === lang.code && styles.chipTextActive]}>{lang.name}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Prompt */}
        <View style={styles.promptCard}>
          <Text style={styles.promptLabel}>{TEXT_TYPES.find(t => t.value === textType)?.desc?.toUpperCase()}</Text>
          <Text style={styles.promptText}>{currentPrompt}</Text>
          <View style={styles.promptNav}>
            <TouchableOpacity onPress={() => { setPromptIdx(i => Math.max(0, i - 1)); setInputText(''); }} style={styles.navBtn}>
              <Text style={styles.navBtnText}>← Prev</Text>
            </TouchableOpacity>
            <Text style={styles.promptCounter}>{promptIdx + 1} / {prompts.length}</Text>
            <TouchableOpacity onPress={() => { setPromptIdx(i => (i + 1) % prompts.length); setInputText(''); }} style={styles.navBtn}>
              <Text style={styles.navBtnText}>Next →</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Text input */}
        <Text style={styles.label}>YOUR RESPONSE IN {language.name.toUpperCase()}</Text>
        <TextInput
          value={inputText}
          onChangeText={setInputText}
          multiline
          numberOfLines={6}
          placeholder={`Type your ${textType === 'TRANSLATION' ? 'translation' : 'response'} here in ${language.name}…`}
          placeholderTextColor="#334155"
          style={styles.textInput}
          textAlignVertical="top"
        />
        <Text style={[styles.charCount, inputText.length >= minChars ? styles.charCountOk : styles.charCountWarn]}>
          {inputText.length} chars {inputText.length < minChars ? `(need ${minChars - inputText.length} more)` : '✓'}
        </Text>

        <TouchableOpacity onPress={submit} disabled={submitting || inputText.length < minChars}
          style={[styles.submitBtn, (submitting || inputText.length < minChars) && styles.submitBtnDisabled]}>
          <Text style={styles.submitBtnText}>{submitting ? 'Submitting…' : 'Submit Entry ✓'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d1117' },
  content: { padding: 20, paddingBottom: 40 },
  header: { marginBottom: 20 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#f1f5f9', marginBottom: 4 },
  headerSub: { fontSize: 13, color: '#475569', marginBottom: 6 },
  badge: { fontSize: 12, color: '#10b981', fontWeight: '700', backgroundColor: 'rgba(16,185,129,0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, alignSelf: 'flex-start', borderWidth: 1, borderColor: 'rgba(16,185,129,0.2)' },
  label: { fontSize: 10, fontWeight: '700', color: '#475569', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 },
  typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  typeChip: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  typeChipActive: { backgroundColor: 'rgba(6,182,212,0.15)', borderColor: 'rgba(6,182,212,0.4)' },
  typeChipText: { color: '#475569', fontSize: 13, fontWeight: '600' },
  typeChipTextActive: { color: '#06b6d4' },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', marginRight: 8 },
  chipActive: { backgroundColor: 'rgba(6,182,212,0.15)', borderColor: '#06b6d4' },
  chipText: { color: '#475569', fontSize: 13, fontWeight: '600' },
  chipTextActive: { color: '#06b6d4' },
  promptCard: { backgroundColor: 'rgba(6,182,212,0.07)', borderWidth: 1, borderColor: 'rgba(6,182,212,0.2)', borderRadius: 16, padding: 18, marginBottom: 20 },
  promptLabel: { fontSize: 9, fontWeight: '700', color: '#06b6d4', letterSpacing: 1, marginBottom: 8 },
  promptText: { fontSize: 16, color: '#e2e8f0', fontWeight: '500', lineHeight: 26, marginBottom: 14 },
  promptNav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  promptCounter: { fontSize: 12, color: '#475569' },
  navBtn: { padding: 8, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 8 },
  navBtnText: { color: '#06b6d4', fontWeight: '600', fontSize: 13 },
  textInput: { backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 14, padding: 14, color: '#e2e8f0', fontSize: 16, minHeight: 140, marginBottom: 6 },
  charCount: { fontSize: 12, marginBottom: 20, textAlign: 'right' },
  charCountOk: { color: '#10b981' },
  charCountWarn: { color: '#475569' },
  submitBtn: { backgroundColor: '#f06135', borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  submitBtnDisabled: { opacity: 0.4 },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '800', letterSpacing: 0.3 },
});
