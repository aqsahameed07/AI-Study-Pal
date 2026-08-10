import React, { PropsWithChildren } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

export function Screen({ children, scroll = true }: PropsWithChildren<{ scroll?: boolean }>) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const paddingTop = insets.top + (Platform.OS === 'web' ? 20 : 10);
  const content = <View style={[styles.screen, { backgroundColor: colors.background, paddingTop }]}>{children}</View>;
  if (!scroll) return content;
  const { ScrollView } = require('react-native') as typeof import('react-native');
  return <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 110 }} showsVerticalScrollIndicator={false} style={{ backgroundColor: colors.background }}>{content}</ScrollView>;
}

export function TopBar({ title, subtitle, onBack, action, actionIcon = 'ellipsis-horizontal' }: { title: string; subtitle?: string; onBack?: () => void; action?: () => void; actionIcon?: IconName }) {
  const colors = useColors();
  return (
    <View style={styles.topBar}>
      <View style={styles.topBarLeft}>
        {onBack ? <IconButton icon="chevron-back" onPress={onBack} label="Go back" /> : null}
        <View>
          <Text style={[styles.eyebrow, { color: colors.accent }]}>{subtitle ?? 'AI STUDY COMPANION'}</Text>
          <Text style={[styles.topTitle, { color: colors.foreground }]}>{title}</Text>
        </View>
      </View>
      {action ? <IconButton icon={actionIcon} onPress={action} label="More options" /> : null}
    </View>
  );
}

export function IconButton({ icon, onPress, label, tint }: { icon: IconName; onPress: () => void; label: string; tint?: string }) {
  const colors = useColors();
  return <Pressable accessibilityLabel={label} accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.iconButton, { backgroundColor: colors.secondary, opacity: pressed ? 0.68 : 1 }]}><Ionicons name={icon} size={19} color={tint ?? colors.foreground} /></Pressable>;
}

export function PrimaryButton({ label, onPress, icon, disabled = false }: { label: string; onPress: () => void; icon?: IconName; disabled?: boolean }) {
  const colors = useColors();
  return <Pressable accessibilityRole="button" onPress={onPress} disabled={disabled} style={({ pressed }) => [styles.primaryButton, { backgroundColor: colors.primary, opacity: disabled ? 0.4 : pressed ? 0.78 : 1 }]}>{icon ? <Ionicons name={icon} size={18} color={colors.primaryForeground} /> : null}<Text style={[styles.primaryLabel, { color: colors.primaryForeground }]}>{label}</Text></Pressable>;
}

export function SoftButton({ label, onPress, icon, disabled = false }: { label: string; onPress: () => void; icon?: IconName; disabled?: boolean }) {
  const colors = useColors();
  return <Pressable accessibilityRole="button" onPress={onPress} disabled={disabled} style={({ pressed }) => [styles.softButton, { borderColor: colors.border, backgroundColor: colors.secondary, opacity: disabled ? 0.4 : pressed ? 0.7 : 1 }]}>{icon ? <Ionicons name={icon} size={17} color={colors.accent} /> : null}<Text style={[styles.softLabel, { color: colors.foreground }]}>{label}</Text></Pressable>;
}

export function ProgressBar({ value, color }: { value: number; color?: string }) {
  const colors = useColors();
  return <View style={[styles.progressTrack, { backgroundColor: colors.muted }]}><View style={[styles.progressFill, { backgroundColor: color ?? colors.accent, width: `${Math.min(100, Math.max(0, value * 100))}%` }]} /></View>;
}

export function Surface({ children, style, accent }: PropsWithChildren<{ style?: any; accent?: boolean }>) {
  const colors = useColors();
  return <View style={[styles.surface, { backgroundColor: colors.card, borderColor: colors.border }, accent ? { borderLeftColor: colors.primary, borderLeftWidth: 3 } : null, style]}>{children}</View>;
}

export function SectionTitle({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  const colors = useColors();
  return <View style={styles.sectionRow}><Text style={[styles.sectionTitle, { color: colors.foreground }]}>{title}</Text>{action && onAction ? <Pressable onPress={onAction}><Text style={[styles.sectionAction, { color: colors.accent }]}>{action}</Text></Pressable> : null}</View>;
}

export const ui = StyleSheet.create({
  body: { fontFamily: 'Inter_400Regular', fontSize: 14, lineHeight: 21 },
  label: { fontFamily: 'Inter_600SemiBold', fontSize: 12, letterSpacing: 0.5 },
  input: { borderWidth: 1, borderRadius: 14, paddingHorizontal: 15, paddingVertical: 13, fontFamily: 'Inter_400Regular', fontSize: 15 },
});

const styles = StyleSheet.create({
  screen: { flex: 1, paddingHorizontal: 20 },
  topBar: { minHeight: 65, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 12 },
  topBarLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  eyebrow: { fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1.4, marginBottom: 3 },
  topTitle: { fontFamily: 'Inter_700Bold', fontSize: 25, letterSpacing: -0.5 },
  iconButton: { width: 42, height: 42, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  primaryButton: { minHeight: 50, borderRadius: 15, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  primaryLabel: { fontFamily: 'Inter_700Bold', fontSize: 14 },
  softButton: { minHeight: 46, borderRadius: 14, borderWidth: 1, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  softLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 13 },
  progressTrack: { height: 7, borderRadius: 8, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 8 },
  surface: { borderRadius: 20, borderWidth: 1, padding: 16 },
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  sectionTitle: { fontFamily: 'Inter_700Bold', fontSize: 16, letterSpacing: -0.2 },
  sectionAction: { fontFamily: 'Inter_600SemiBold', fontSize: 12 },
});
