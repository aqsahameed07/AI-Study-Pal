import React, { PropsWithChildren } from 'react';
import { Image, KeyboardTypeOptions, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';

export function AuthShell({ eyebrow, title, subtitle, children }: PropsWithChildren<{ eyebrow: string; title: string; subtitle: string }>) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  return (
    <KeyboardAwareScrollViewCompat
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 34, paddingBottom: insets.bottom + (typeof window !== 'undefined' ? 34 : 24) }]}
      bottomOffset={24}
    >
      <View style={styles.brand}>
        <Image source={require('../assets/images/icon.png')} style={styles.logo} />
        <Text style={[styles.brandName, { color: colors.foreground }]}>Orbit Study</Text>
      </View>
      <Text style={[styles.eyebrow, { color: colors.accent }]}>{eyebrow}</Text>
      <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>
      <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>{subtitle}</Text>
      <View style={styles.form}>{children}</View>
    </KeyboardAwareScrollViewCompat>
  );
}

export function AuthInput({ label, value, onChangeText, placeholder, secureTextEntry, keyboardType = 'default', autoCapitalize = 'sentences' }: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
}) {
  const colors = useColors();
  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: colors.foreground }]}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.mutedForeground}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
        style={[styles.input, { color: colors.foreground, backgroundColor: colors.card, borderColor: colors.border }]}
      />
    </View>
  );
}

export function AuthButton({ label, onPress, disabled, secondary = false }: { label: string; onPress: () => void; disabled?: boolean; secondary?: boolean }) {
  const colors = useColors();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: secondary ? colors.secondary : colors.primary, borderColor: colors.border, opacity: disabled ? 0.45 : pressed ? 0.75 : 1 },
      ]}
    >
      <Text style={[styles.buttonText, { color: secondary ? colors.foreground : colors.primaryForeground }]}>{label}</Text>
    </Pressable>
  );
}

export function AuthError({ message }: { message?: string }) {
  const colors = useColors();
  if (!message) return null;
  return <Text style={[styles.error, { color: colors.destructive }]}>{message}</Text>;
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 24, flexGrow: 1, justifyContent: 'center' },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 42 },
  logo: { width: 42, height: 42, borderRadius: 13 },
  brandName: { fontFamily: 'Inter_700Bold', fontSize: 18, letterSpacing: -0.3 },
  eyebrow: { fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1.5, marginBottom: 9 },
  title: { fontFamily: 'Inter_700Bold', fontSize: 32, letterSpacing: -1, lineHeight: 38 },
  subtitle: { fontFamily: 'Inter_400Regular', fontSize: 15, lineHeight: 22, marginTop: 9, maxWidth: 330 },
  form: { marginTop: 30 },
  field: { marginBottom: 16 },
  label: { fontFamily: 'Inter_600SemiBold', fontSize: 13, marginBottom: 8 },
  input: { minHeight: 52, borderRadius: 15, borderWidth: 1, paddingHorizontal: 15, fontFamily: 'Inter_400Regular', fontSize: 15 },
  button: { minHeight: 52, borderRadius: 15, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  buttonText: { fontFamily: 'Inter_700Bold', fontSize: 14 },
  error: { fontFamily: 'Inter_500Medium', fontSize: 12, lineHeight: 18, marginBottom: 12 },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 22 },
  dividerLine: { flex: 1, height: 1 },
  dividerText: { fontFamily: 'Inter_500Medium', fontSize: 11 },
  footer: { alignItems: 'center', marginTop: 26 },
  footerText: { fontFamily: 'Inter_400Regular', fontSize: 13 },
  footerLink: { fontFamily: 'Inter_700Bold', fontSize: 13 },
  verifyBox: { padding: 16, borderRadius: 18, marginBottom: 18 },
  verifyTitle: { fontFamily: 'Inter_700Bold', fontSize: 17, marginBottom: 6 },
  verifyText: { fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 19 },
});

export const authStyles = styles;