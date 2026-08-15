import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { useAuth, useClerk, useSignUp } from '@clerk/expo';
import { type Href, useRouter } from 'expo-router';
import { AuthButton, AuthError, AuthInput, AuthShell, authStyles } from '@/components/AuthUI';
import { useColors } from '@/hooks/useColors';
import { getApiBaseUrl } from '@/lib/api-url';

export default function SignUpScreen() {
  const colors = useColors();
  const router = useRouter();
  const { isSignedIn, getToken } = useAuth();
  const { setActive } = useClerk();
  const { signUp, errors, fetchStatus } = useSignUp();

  const [fullName, setFullName] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [showCode, setShowCode] = useState(false);
  const [syncError, setSyncError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const busy = fetchStatus === 'fetching' || isVerifying;
  const fieldError =
    (errors as any)?.global?.[0]?.message ??
    (errors as any)?.fields?.emailAddress?.message ??
    (errors as any)?.fields?.password?.message;

  // ---------- Sync user to backend ----------
  const syncUserWithBackend = useCallback(async () => {
    try {
      await new Promise((r) => setTimeout(r, 500));

      const token = await getToken();
      if (!token) {
        console.warn('⚠️ No Clerk token available after sign-up.');
        setSyncError('Signed up but could not sync with server (no token).');
        return;
      }

      const apiUrl = getApiBaseUrl();
      console.log('🔄 Syncing user to:', `${apiUrl}/auth/sync-user`);

      const response = await fetch(`${apiUrl}/auth/sync-user`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const body = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(body?.message || `Sync failed (${response.status})`);
      }

      console.log('✅ Sign-up user synced to backend:', body);
      setSyncError('');
    } catch (error) {
      console.error('❌ Failed to sync user after sign-up:', error);
      setSyncError(error instanceof Error ? error.message : 'Failed to sync user');
    }
  }, [getToken]);

  // ---------- Finish: session → sync → navigate ----------
  const finishSignUp = useCallback(
    async (sessionId?: string | null) => {
      try {
        const id = sessionId || signUp.createdSessionId;

        if (id && setActive) {
          console.log('✅ Setting active session:', id);
          await setActive({ session: id });
        }

        await syncUserWithBackend();

        try {
          await signUp.finalize({
            navigate: ({ decorateUrl }) => {
              router.replace(decorateUrl('/') as Href);
            },
          });
        } catch (finalizeErr) {
          console.warn('finalize failed, navigating manually:', finalizeErr);
          router.replace('/' as Href);
        }
      } catch (err) {
        console.error('❌ finishSignUp error:', err);
        setSyncError(err instanceof Error ? err.message : 'Could not complete sign-up');
      }
    },
    [signUp, setActive, syncUserWithBackend, router]
  );

  // ---------- Create account ----------
  const handleSubmit = async () => {
    setSyncError('');

    try {
      const parts = fullName.trim().split(/\s+/);
      const firstName = parts[0] || fullName.trim();
      const lastName = parts.slice(1).join(' ') || firstName;

      console.log('Creating account with email:', emailAddress.trim());

      const { error } = await signUp.password({
        emailAddress: emailAddress.trim(),
        password,
        firstName,
        lastName,
      });

      if (error) {
        console.error('Create error:', error);
        setSyncError(
          (error as any)?.longMessage ||
            (error as any)?.message ||
            'Could not create account'
        );
        return;
      }

      await signUp.verifications.sendEmailCode();
      setShowCode(true);
    } catch (err: any) {
      console.error('Submit error:', err);
      setSyncError(
        err?.errors?.[0]?.longMessage ||
          err?.errors?.[0]?.message ||
          err?.message ||
          'Could not create account'
      );
    }
  };

  // ---------- Verify email code ----------
  const handleVerify = async () => {
    if (!code || code.length < 6) {
      setSyncError('Enter the 6-digit code');
      return;
    }

    setSyncError('');
    setIsVerifying(true);

    try {
      console.log('🔍 Verifying code...');
      const result: any = await signUp.verifications.verifyEmailCode({
        code: code.trim(),
      });

      console.log('🔍 Verify result:', JSON.stringify(result, null, 2));
      console.log('🔍 status:', signUp.status);
      console.log('🔍 missingFields:', signUp.missingFields);
      console.log('🔍 createdSessionId:', signUp.createdSessionId);

      await new Promise((r) => setTimeout(r, 300));

      // Name fallback
      if (signUp.status === 'missing_requirements') {
        const parts = fullName.trim().split(/\s+/);
        const firstName = parts[0] || fullName.trim();
        const lastName = parts.slice(1).join(' ') || firstName;
        try {
          await signUp.update({ firstName, lastName });
        } catch (_) {}
      }

      await new Promise((r) => setTimeout(r, 200));

      const sessionId =
        signUp.createdSessionId ||
        result?.createdSessionId ||
        result?.session?.id;

      const isComplete =
        signUp.status === 'complete' ||
        result?.status === 'complete' ||
        !!sessionId;

      if (isComplete) {
        console.log('✅ Sign-up complete');
        await finishSignUp(sessionId);
        return;
      }

      if (signUp.createdSessionId) {
        await finishSignUp(signUp.createdSessionId);
        return;
      }

      setSyncError(
        `Account not complete. Missing: ${(signUp.missingFields || []).join(', ') || signUp.status}`
      );
    } catch (error: any) {
      console.error('❌ Verify error:', error);

      const msg = (error?.message || '').toLowerCase();
      if (msg.includes('already') || msg.includes('verified') || error?.status === 400) {
        if (signUp.createdSessionId || signUp.status === 'complete') {
          await finishSignUp(signUp.createdSessionId);
          return;
        }
      }

      setSyncError(
        error?.errors?.[0]?.longMessage ||
          error?.errors?.[0]?.message ||
          error?.message ||
          'Verification failed'
      );
    } finally {
      setIsVerifying(false);
    }
  };

  if (isSignedIn) {
    router.replace('/' as Href);
    return null;
  }

  return (
    <AuthShell
      eyebrow="START FRESH"
      title="Make studying feel lighter."
      subtitle="Create your Orbit Study account and turn your next exam into a clear, doable rhythm."
    >
      {showCode ? (
        <>
          <View style={[authStyles.verifyBox, { backgroundColor: colors.secondary }]}>
            <Text style={[authStyles.verifyTitle, { color: colors.foreground }]}>
              Verify your email
            </Text>
            <Text style={[authStyles.verifyText, { color: colors.mutedForeground }]}>
              We sent a six-digit code to {emailAddress}.
            </Text>
          </View>

          <AuthInput
            label="Verification code"
            value={code}
            onChangeText={setCode}
            placeholder="123456"
            keyboardType="number-pad"
            autoCapitalize="none"
          />

          <AuthError
            message={(errors as any)?.fields?.code?.message ?? fieldError ?? syncError}
          />

          <AuthButton
            label={busy ? 'Creating your account…' : 'Verify and start studying'}
            onPress={handleVerify}
            disabled={busy || !code || code.length < 6}
          />

          <AuthButton
            label="Send a new code"
            onPress={async () => {
              try {
                await signUp.verifications.sendEmailCode();
                setSyncError('A new code has been sent.');
              } catch (e: any) {
                setSyncError(e?.message || 'Could not resend code');
              }
            }}
            secondary
            disabled={busy}
          />
        </>
      ) : (
        <>
          <AuthInput
            label="Full name"
            value={fullName}
            onChangeText={setFullName}
            placeholder="How should we call you?"
            autoCapitalize="words"
          />
          <AuthInput
            label="Email address"
            value={emailAddress}
            onChangeText={setEmailAddress}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <AuthInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="At least 8 characters"
            secureTextEntry
            autoCapitalize="none"
          />

          <AuthError message={fieldError ?? syncError} />

          <AuthButton
            label={busy ? 'Creating your account…' : 'Create account'}
            onPress={handleSubmit}
            disabled={
              busy ||
              !fullName ||
              !emailAddress ||
              !password
            }
          />
        </>
      )}

      <View style={authStyles.footer}>
        <Text style={[authStyles.footerText, { color: colors.mutedForeground }]}>
          Already have an account?{' '}
        </Text>
        <Pressable onPress={() => router.push('/sign-in' as Href)}>
          <Text style={[authStyles.footerLink, { color: colors.accent }]}>Sign in</Text>
        </Pressable>
      </View>

      {busy ? <ActivityIndicator color={colors.accent} style={{ marginTop: 16 }} /> : null}
    </AuthShell>
  );
}