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
  const { isSignedIn, setActive, getToken } = useAuth();
  const { signIn, errors, fetchStatus } = useSignIn();
  const { startSSOFlow } = useSSO();

  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [showCode, setShowCode] = useState(false);
  const [oauthError, setOauthError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const busy = fetchStatus === 'fetching' || isVerifying;
  const fieldError =
    (errors as any)?.global?.[0]?.message ??
    (errors as any)?.fields?.identifier?.message ??
    (errors as any)?.fields?.password?.message;

  // ---------- Sync user to your backend ----------
  const syncUserWithBackend = useCallback(async () => {
    try {
      // Small delay so Clerk session/token is fully ready
      await new Promise((r) => setTimeout(r, 300));

      const token = await getToken();
      if (!token) {
        console.warn('⚠️ No Clerk token available after sign-in.');
        return;
      }

      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiUrl}/auth/sync-user`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        throw new Error(errBody?.message || `Sync failed (${response.status})`);
      }

      console.log('✅ Sign-in user synced to backend');
    } catch (error) {
      console.error('❌ Failed to sync user after sign-in:', error);
      // Don't block the user from entering the app
    }
  }, [getToken]);

  // ---------- Finish sign-in (navigate + sync) ----------
  const finish = useCallback(async () => {
    console.log('🔄 Finishing sign in...');
    try {
      // Sync before navigating so the user exists in DB
      await syncUserWithBackend();

      await signIn.finalize({
        navigate: ({ session, decorateUrl }) => {
          console.log('🔍 Session in finalize:', session);
          if (session?.currentTask) return;

          const url = decorateUrl('/');
          console.log('🔍 Navigating to:', url);

          if (Platform.OS === 'web' && typeof window !== 'undefined' && url.startsWith('http')) {
            window.location.href = url;
          } else {
            router.replace(url as Href);
          }
        },
      });
    } catch (error) {
      console.error('❌ Finalize error:', error);
    }
  }, [router, signIn, syncUserWithBackend]);

  // ---------- Email + password submit ----------
  const handleSubmit = async () => {
    setOauthError('');
    console.log('🔍 Attempting sign in with email:', emailAddress.trim());

    try {
      const { error } = await signIn.password({
        emailAddress: emailAddress.trim(),
        password,
      });

      if (error) {
        console.error('❌ Password sign in error:', error);
        return;
      }

      console.log('🔍 Sign in status after password:', signIn.status);

      if (signIn.status === 'complete') {
        console.log('✅ Sign in complete, finishing...');
        await finish();
      } else if (
        signIn.status === 'needs_client_trust' ||
        signIn.status === 'needs_second_factor'
      ) {
        console.log('📧 Sending verification code...');
        await signIn.mfa.sendEmailCode();
        setShowCode(true);
        console.log('✅ Verification code sent!');
      } else {
        console.log('⚠️ Unexpected status:', signIn.status);
      }
    } catch (error) {
      console.error('❌ Submit error:', error);
      setOauthError(error instanceof Error ? error.message : 'Sign in failed. Please try again.');
    }
  };

  // ---------- Verify MFA / email code ----------
  const handleVerify = async () => {
    if (!code || code.length < 6) {
      setOauthError('Please enter a valid verification code');
      return;
    }

    setIsVerifying(true);
    setOauthError('');
    console.log('🔍 Verifying code:', code);

    try {
      const result: any = await signIn.mfa.verifyEmailCode({ code });
      console.log('🔍 Verification result:', JSON.stringify(result, null, 2));
      console.log('🔍 SignIn status after verify:', signIn.status);
      console.log('🔍 SignIn createdSessionId:', signIn.createdSessionId);

      // Give Clerk a moment to update state
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (signIn.status === 'complete') {
        console.log('✅ Sign in complete!');
        await finish();
        return;
      }

      if (signIn.createdSessionId && setActive) {
        console.log('✅ Session created! Setting active...');
        await setActive({ session: signIn.createdSessionId });
        console.log('✅ Session active, finishing...');
        await finish();
        return;
      }

      if (result?.session && setActive) {
        console.log('✅ Session in result!');
        await setActive({ session: result.session });
        await finish();
        return;
      }

      if (result?.status === 'complete') {
        console.log('✅ Status complete in result!');
        await finish();
        return;
      }

      console.log('⚠️ Verification not complete, status:', signIn.status);

      // Last attempt: force finalize
      try {
        console.log('🔄 Attempting to force finalize...');
        await signIn.finalize({
          navigate: ({ session, decorateUrl }) => {
            if (session?.currentTask) return;
            const url = decorateUrl('/');
            if (Platform.OS === 'web' && typeof window !== 'undefined' && url.startsWith('http')) {
              window.location.href = url;
            } else {
              router.replace(url as Href);
            }
          },
        });
        // Still try to sync even on forced finalize
        await syncUserWithBackend();
        console.log('✅ Finalized successfully!');
      } catch (finalizeError) {
        console.error('❌ Finalize error:', finalizeError);
        setOauthError(
          "Verification succeeded but couldn't complete sign in. Please try again."
        );
      }
    } catch (error) {
      console.error('❌ Verification error:', error);

      if (error instanceof Error && error.message.includes('already verified')) {
        console.log('⚠️ Code already verified, attempting to complete sign in...');
        try {
          await signIn.finalize({
            navigate: ({ session, decorateUrl }) => {
              if (session?.currentTask) return;
              const url = decorateUrl('/');
              if (Platform.OS === 'web' && typeof window !== 'undefined' && url.startsWith('http')) {
                window.location.href = url;
              } else {
                router.replace(url as Href);
              }
            },
          });
          await syncUserWithBackend();
          console.log('✅ Completed sign in after "already verified" error');
          return;
        } catch (finalizeError) {
          console.error('❌ Finalize after "already verified" error:', finalizeError);
          setOauthError(
            "Code was already verified but couldn't complete sign in. Please try signing in again."
          );
        }
      } else {
        setOauthError(
          error instanceof Error ? error.message : 'Verification failed. Please try again.'
        );
      }

      signIn.reset();
      setShowCode(false);
      setCode('');
    } finally {
      setIsVerifying(false);
    }
  };

  // ---------- Resend code ----------
  const handleResendCode = async () => {
    setOauthError('');
    try {
      console.log('📧 Resending verification code...');
      await signIn.mfa.sendEmailCode();
      console.log('✅ Code resent!');
      setOauthError('A new verification code has been sent to your email.');
    } catch (error) {
      console.error('❌ Resend error:', error);
      setOauthError('Failed to resend code. Please try again.');
    }
  };

  // ---------- Google SSO ----------
  const signInWithGoogle = async () => {
    try {
      setOauthError('');
      console.log('🔍 Starting Google SSO flow...');

      const { createdSessionId, setActive: setActiveFromSSO } = await startSSOFlow({
        strategy: 'oauth_google',
        redirectUrl: AuthSession.makeRedirectUri({ scheme: 'ai-study-companion' }),
      });

      console.log('🔍 Google SSO result:', createdSessionId);

      if (createdSessionId) {
        console.log('✅ Google SSO success, setting active session...');
        await setActiveFromSSO?.({ session: createdSessionId });

        // Sync after Google sign-in
        await syncUserWithBackend();

        console.log('✅ Session active, navigating...');
        router.replace('/');
      }
    } catch (error) {
      console.error('❌ Google sign in error:', error);
      setOauthError(
        error instanceof Error ? error.message : 'Google sign in could not be completed.'
      );
    }
  };

  // Auto-redirect if already signed in
  useEffect(() => {
    if (isSignedIn) {
      console.log('✅ Already signed in, redirecting...');
      // Optional: also sync on cold start when already signed in
      // syncUserWithBackend();
      router.replace('/');
    }
  }, [isSignedIn, router]);

  if (isSignedIn) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: colors.foreground }}>Already signed in. Redirecting...</Text>
      </View>
    );
  }

  return (
    <AuthShell
      eyebrow="WELCOME BACK"
      title="Keep your study rhythm."
      subtitle="Sign in to pick up your plans, tutor conversations, and progress exactly where you left off."
    >
      {showCode ? (
        <View style={[authStyles.verifyBox, { backgroundColor: colors.secondary }]}>
          <Text style={[authStyles.verifyTitle, { color: colors.foreground }]}>
            Check your email
          </Text>
          <Text style={[authStyles.verifyText, { color: colors.mutedForeground }]}>
            Enter the verification code we sent to continue signing in.
          </Text>
        </View>
      ) : null}

      {showCode ? (
        <>
          <AuthInput
            label="Verification code"
            value={code}
            onChangeText={setCode}
            placeholder="123456"
            keyboardType="number-pad"
            autoCapitalize="none"
          />
          <Pressable onPress={handleResendCode} style={{ alignSelf: 'center', marginVertical: 8 }}>
            <Text style={[authStyles.footerLink, { color: colors.accent }]}>Resend code</Text>
          </Pressable>
        </>
      ) : null}

      {!showCode ? (
        <AuthInput
          label="Email address"
          value={emailAddress}
          onChangeText={setEmailAddress}
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
        />
      ) : null}

      {!showCode ? (
        <AuthInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="Enter your password"
          secureTextEntry
          autoCapitalize="none"
        />
      ) : null}

      <AuthError message={fieldError ?? oauthError} />

      <AuthButton
        label={busy ? 'Signing you in…' : showCode ? 'Verify and continue' : 'Continue'}
        onPress={showCode ? handleVerify : handleSubmit}
        disabled={
          busy ||
          (showCode ? !code || code.length < 6 : !emailAddress || !password)
        }
      />

      {!showCode ? (
        <>
          <View style={authStyles.divider}>
            <View style={[authStyles.dividerLine, { backgroundColor: colors.border }]} />
            <Text style={[authStyles.dividerText, { color: colors.mutedForeground }]}>OR</Text>
            <View style={[authStyles.dividerLine, { backgroundColor: colors.border }]} />
          </View>
          <AuthButton
            label="Continue with Google"
            onPress={signInWithGoogle}
            secondary={busy}
            disabled={busy}
          />
        </>
      ) : (
        <Pressable
          onPress={() => {
            signIn.reset();
            setShowCode(false);
            setCode('');
            setOauthError('');
          }}
          style={authStyles.footer}
        >
          <Text style={[authStyles.footerLink, { color: colors.accent }]}>
            Use a different account
          </Text>
        </Pressable>
      )}

      <View style={authStyles.footer}>
        <Text style={[authStyles.footerText, { color: colors.mutedForeground }]}>
          New to Orbit Study?{' '}
        </Text>
        <Pressable onPress={() => router.push('/sign-up' as Href)}>
          <Text style={[authStyles.footerLink, { color: colors.accent }]}>Create an account</Text>
        </Pressable>
      </View>

      {busy ? <ActivityIndicator color={colors.accent} style={{ marginTop: 16 }} /> : null}
    </AuthShell>
  );
}