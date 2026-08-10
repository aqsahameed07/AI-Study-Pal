import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { TopBar } from '@/components/StudyUI';

type Message = { id: string; role: 'user' | 'tutor'; text: string };
const starter: Message[] = [{ id: '1', role: 'tutor', text: 'Hi Maya. I’m ready when you are. What are you working through today?' }, { id: '2', role: 'user', text: 'Can you help me understand cellular respiration?' }, { id: '3', role: 'tutor', text: 'Absolutely. Think of it as a cell turning food into a usable energy currency. Want the three stages in a simple story, or a quick comparison table?' }];
const prompts = ['Explain it simply', 'Quiz me on this', 'Make a study plan'];

export default function TutorScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const inputRef = useRef<TextInput>(null);
  const { prompt } = useLocalSearchParams<{ prompt?: string }>();
  const [messages, setMessages] = useState<Message[]>(starter);
  const [draft, setDraft] = useState('');
  const [typing, setTyping] = useState(false);
  useEffect(() => { AsyncStorage.getItem('study-companion/chat').then(raw => raw && setMessages(JSON.parse(raw) as Message[])); }, []);
  useEffect(() => {
    if (prompt) setDraft(prompt);
  }, [prompt]);
  const send = (text = draft) => {
    const value = text.trim();
    if (!value || typing) return;
    Haptics.selectionAsync();
    const next = [...messages, { id: Date.now().toString(), role: 'user' as const, text: value }];
    setMessages(next);
    setDraft('');
    setTyping(true);
    setTimeout(() => {
      const reply: Message = { id: `${Date.now()}-reply`, role: 'tutor', text: 'Let’s make that manageable: start with the big idea, connect one example, then test your recall. I can turn this into a short quiz whenever you’re ready.' };
      const complete = [...next, reply];
      setMessages(complete);
      setTyping(false);
      AsyncStorage.setItem('study-companion/chat', JSON.stringify(complete));
    }, 850);
  };
  return (
    <KeyboardAvoidingView style={[styles.root, { backgroundColor: colors.background }]} behavior="padding" keyboardVerticalOffset={0}>
      <View style={[styles.shell, { paddingTop: insets.top + (Platform.OS === 'web' ? 20 : 10), paddingBottom: Platform.OS === 'web' ? 34 : insets.bottom + 76 }]}>
        <TopBar title="Tutor" subtitle="YOUR POCKET TUTOR" action={() => setMessages(starter)} actionIcon="refresh-outline" />
        <FlatList
          data={[...messages].reverse()}
          inverted
          style={styles.messages}
          keyExtractor={item => item.id}
          contentContainerStyle={[styles.list, Platform.OS === 'web' ? styles.webList : null]}
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <View style={[styles.bubble, { backgroundColor: item.role === 'user' ? colors.primary : colors.card, alignSelf: item.role === 'user' ? 'flex-end' : 'flex-start', borderColor: colors.border }]}>
              <Text style={[styles.bubbleText, { color: item.role === 'user' ? colors.primaryForeground : colors.foreground }]}>{item.text}</Text>
            </View>
          )}
          ListHeaderComponent={typing ? <View style={[styles.typing, { backgroundColor: colors.card }]}><ActivityIndicator size="small" color={colors.accent} /><Text style={[styles.typingText, { color: colors.mutedForeground }]}>Tutor is thinking</Text></View> : null}
        />
        <View style={[styles.bottomDock, Platform.OS === 'web' ? styles.webBottomDock : null]}>
          <ScrollView horizontal style={styles.promptScroll} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.promptRow} keyboardShouldPersistTaps="handled">
            {prompts.map(promptText => (
              <Pressable key={promptText} onPress={() => send(promptText)} style={({ pressed }) => [styles.prompt, { borderColor: colors.border, opacity: pressed ? 0.72 : 1 }]}>
                <Text style={[styles.promptText, { color: colors.accent }]}>{promptText}</Text>
              </Pressable>
            ))}
          </ScrollView>
          <View style={[styles.composer, { borderColor: colors.border, backgroundColor: colors.card }]}>
            <TextInput
              ref={inputRef}
              value={draft}
              onChangeText={setDraft}
              placeholder="Ask anything about your studies"
              placeholderTextColor={colors.mutedForeground}
              style={[styles.input, { color: colors.foreground }]}
              multiline
              textAlignVertical="center"
              returnKeyType="send"
              blurOnSubmit={false}
              onSubmitEditing={() => send()}
            />
            <Pressable accessibilityLabel="Send message" accessibilityRole="button" onPress={() => { send(); inputRef.current?.focus(); }} style={({ pressed }) => [styles.send, { backgroundColor: draft.trim() ? colors.primary : colors.muted, opacity: pressed ? 0.75 : 1 }]}>
              <Ionicons name="arrow-up" size={19} color={draft.trim() ? colors.primaryForeground : colors.mutedForeground} />
            </Pressable>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
const styles = StyleSheet.create({
  root: { flex: 1 },
  shell: { flex: 1, paddingHorizontal: 20 },
  messages: { flex: 1 },
  list: { paddingTop: 10, paddingBottom: 16, flexGrow: 1, justifyContent: 'flex-end' },
  webList: { paddingBottom: 120 },
  bubble: { maxWidth: '86%', borderWidth: 1, borderRadius: 18, padding: 14, marginVertical: 6 },
  bubbleText: { fontFamily: 'Inter_400Regular', fontSize: 15, lineHeight: 22 },
  typing: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 9, padding: 12, borderRadius: 15, marginBottom: 8 },
  typingText: { fontFamily: 'Inter_500Medium', fontSize: 12 },
  promptScroll: { flexGrow: 0, height: 42 },
  promptRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  bottomDock: { backgroundColor: 'transparent' },
  webBottomDock: { position: 'absolute', left: 20, right: 20, bottom: 84 },
  prompt: { borderWidth: 1, borderRadius: 20, paddingVertical: 8, paddingHorizontal: 10 },
  promptText: { fontFamily: 'Inter_500Medium', fontSize: 11 },
  composer: { minHeight: 56, borderWidth: 1, borderRadius: 18, flexDirection: 'row', alignItems: 'center', paddingLeft: 14, paddingRight: 7 },
  input: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 14, maxHeight: 90, minHeight: 40, paddingVertical: 9 },
  send: { width: 39, height: 39, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
});