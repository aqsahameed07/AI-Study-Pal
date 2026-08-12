import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, Text, View } from 'react-native';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { useAuth, useSignIn, useSSO } from '@clerk/expo';
import { Link, type Href, useRouter } from 'expo-router';
import { AuthButton, AuthError, AuthInput, AuthShell, authStyles } from '@/components/AuthUI';
import { useColors } from '@/hooks/useColors';

WebBrowser.maybeCompleteAuthSession();

export default function SignInScreen() {
  const colors = useColors();
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const { signIn, errors, fetchStatus } = useSignIn();
  const { startSSOFlow } = useSSO();
  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [showCode, setShowCode] = useState(false);
  const [oauthError, setOauthError] = useState('');
  const busy = fetchStatus === 'fetching';
  const fieldError = (errors as any)?.global?.[0]?.message ?? (errors as any)?.fields?.identifier?.message ?? (errors as any)?.fields?.password?.message;

  const finish = useCallback(async () => {
    await signIn.finalize({
      navigate: ({ session, decorateUrl }) => {
        if (session?.currentTask) return;
        const url = decorateUrl('/');
        if (Platform.OS === 'web' && typeof window !== 'undefined' && url.startsWith('http')) window.location.href = url;
        else router.replace(url as Href);
      },
    });
  }, [router, signIn]);

  const handleSubmit = async () => {
    setOauthError('');
    const { error } = await signIn.password({ emailAddress: emailAddress.trim(), password });
    if (error) return;
    if (signIn.status === 'complete') await finish();
    else if (signIn.status === 'needs_client_trust') {
      await signIn.mfa.sendEmailCode();
      setShowCode(true);
    }
  };

  const handleVerify = async () => {
    await signIn.mfa.verifyEmailCode({ code });
    if (signIn.status === 'complete') await finish();
  };

  const signInWithGoogle = async () => {
    try {
      setOauthError('');
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy: 'oauth_google',
        redirectUrl: AuthSession.makeRedirectUri({ scheme: 'ai-study-companion' }),
      });
      if (createdSessionId) await setActive?.({ session: createdSessionId });
    } catch (error) {
      setOauthError(error instanceof Error ? error.message : 'Google sign in could not be completed.');
    }
  };

  if (isSignedIn) return null;
  return (
    <AuthShell eyebrow="WELCOME BACK" title="Keep your study rhythm." subtitle="Sign in to pick up your plans, tutor conversations, and progress exactly where you left off.">
      {showCode ? (
        <View style={[authStyles.verifyBox, { backgroundColor: colors.secondary }]}>
          <Text style={[authStyles.verifyTitle, { color: colors.foreground }]}>Check your email</Text>
          <Text style={[authStyles.verifyText, { color: colors.mutedForeground }]}>Enter the verification code we sent to continue signing in.</Text>
        </View>
      ) : null}
      {showCode ? <AuthInput label="Verification code" value={code} onChangeText={setCode} placeholder="123456" keyboardType="number-pad" autoCapitalize="none" /> : null}
      {!showCode ? <AuthInput label="Email address" value={emailAddress} onChangeText={setEmailAddress} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" /> : null}
      {!showCode ? <AuthInput label="Password" value={password} onChangeText={setPassword} placeholder="Enter your password" secureTextEntry autoCapitalize="none" /> : null}
      <AuthError message={fieldError ?? oauthError} />
      <AuthButton label={busy ? 'Signing you in…' : showCode ? 'Verify and continue' : 'Continue'} onPress={showCode ? handleVerify : handleSubmit} disabled={busy || (showCode ? !code : !emailAddress || !password)} />
      {!showCode ? (
        <>
          <View style={authStyles.divider}><View style={[authStyles.dividerLine, { backgroundColor: colors.border }]} /><Text style={[authStyles.dividerText, { color: colors.mutedForeground }]}>OR</Text><View style={[authStyles.dividerLine, { backgroundColor: colors.border }]} /></View>
          <AuthButton label="Continue with Google" onPress={signInWithGoogle} secondary={busy} disabled={busy} />
        </>
      ) : <Pressable onPress={() => signIn.reset()} style={authStyles.footer}><Text style={[authStyles.footerLink, { color: colors.accent }]}>Use a different account</Text></Pressable>}
      <View style={authStyles.footer}><Text style={[authStyles.footerText, { color: colors.mutedForeground }]}>New to Orbit Study? </Text><Pressable onPress={() => router.push('/sign-up' as Href)}><Text style={[authStyles.footerLink, { color: colors.accent }]}>Create an account</Text></Pressable></View>
      {busy ? <ActivityIndicator color={colors.accent} style={{ marginTop: 16 }} /> : null}
    </AuthShell>
  );
}