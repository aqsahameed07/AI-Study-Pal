import React, { useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { useAuth, useSignUp } from '@clerk/expo';
import { type Href, useRouter } from 'expo-router';
import { AuthButton, AuthError, AuthInput, AuthShell, authStyles } from '@/components/AuthUI';
import { useColors } from '@/hooks/useColors';

export default function SignUpScreen() {
  const colors = useColors();
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const { signUp, errors, fetchStatus } = useSignUp();
  const [fullName, setFullName] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [showCode, setShowCode] = useState(false);
  const busy = fetchStatus === 'fetching';
  const fieldError = (errors as any)?.global?.[0]?.message ?? (errors as any)?.fields?.emailAddress?.message ?? (errors as any)?.fields?.password?.message;

  const handleSubmit = async () => {
    const { error } = await signUp.password({ emailAddress: emailAddress.trim(), password, firstName: fullName.trim() });
    if (error) return;
    await signUp.verifications.sendEmailCode();
    setShowCode(true);
  };

  const handleVerify = async () => {
    await signUp.verifications.verifyEmailCode({ code });
    if (signUp.status === 'complete') {
      await signUp.finalize({
        navigate: ({ decorateUrl }) => router.replace(decorateUrl('/') as any),
      });
    }
  };

  if (isSignedIn) return null;
  return (
    <AuthShell eyebrow="START FRESH" title="Make studying feel lighter." subtitle="Create your Orbit Study account and turn your next exam into a clear, doable rhythm.">
      {showCode ? (
        <>
          <View style={[authStyles.verifyBox, { backgroundColor: colors.secondary }]}>
            <Text style={[authStyles.verifyTitle, { color: colors.foreground }]}>Verify your email</Text>
            <Text style={[authStyles.verifyText, { color: colors.mutedForeground }]}>We sent a six-digit code to {emailAddress}.</Text>
          </View>
          <AuthInput label="Verification code" value={code} onChangeText={setCode} placeholder="123456" keyboardType="number-pad" autoCapitalize="none" />
          <AuthError message={(errors as any)?.fields?.code?.message ?? fieldError} />
          <AuthButton label={busy ? 'Creating your account…' : 'Verify and start studying'} onPress={handleVerify} disabled={busy || !code} />
          <AuthButton label="Send a new code" onPress={() => signUp.verifications.sendEmailCode()} secondary disabled={busy} />
        </>
      ) : (
        <>
          <AuthInput label="Full name" value={fullName} onChangeText={setFullName} placeholder="How should we call you?" autoCapitalize="words" />
          <AuthInput label="Email address" value={emailAddress} onChangeText={setEmailAddress} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" />
          <AuthInput label="Password" value={password} onChangeText={setPassword} placeholder="At least 8 characters" secureTextEntry autoCapitalize="none" />
          <AuthError message={fieldError} />
          <AuthButton label={busy ? 'Creating your account…' : 'Create account'} onPress={handleSubmit} disabled={busy || !fullName || !emailAddress || !password} />
        </>
      )}
      <View style={authStyles.footer}><Text style={[authStyles.footerText, { color: colors.mutedForeground }]}>Already have an account? </Text><Pressable onPress={() => router.push('/sign-in' as Href)}><Text style={[authStyles.footerLink, { color: colors.accent }]}>Sign in</Text></Pressable></View>
      {busy ? <ActivityIndicator color={colors.accent} style={{ marginTop: 16 }} /> : null}
    </AuthShell>
  );
}