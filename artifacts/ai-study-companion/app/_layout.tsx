import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from '@expo-google-fonts/inter';
import { Stack } from 'expo-router';
import { Redirect, useSegments, type Href, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StudyProvider } from '@/context/StudyContext';
import { ClerkLoaded, ClerkProvider, useAuth } from '@clerk/expo';
import { tokenCache } from '@clerk/expo/token-cache';
import { getApiBaseUrl } from '@/lib/api-url';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const router = useRouter();
  const segments = useSegments();
  const inAuthGroup = (segments[0] as string | undefined) === '(auth)';
  const shouldEnterAuth = isLoaded && !isSignedIn && !inAuthGroup;
  const shouldLeaveAuth = isLoaded && !!isSignedIn && inAuthGroup;

  // Sync user with backend when signed in
  useEffect(() => {
    const syncUser = async () => {
      if (isSignedIn && isLoaded) {
        try {
          const token = await getToken();
          if (token) {
            const apiUrl = getApiBaseUrl();
          const response = await fetch(`${apiUrl}/auth/sync-user`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            });
            if (response.ok) {
              console.log('✅ User synced with backend');
            }
          }
        } catch (error) {
          console.error('❌ Failed to sync user:', error);
        }
      }
    };
    syncUser();
  }, [isSignedIn, isLoaded, getToken]);

  useEffect(() => {
    if (shouldEnterAuth) {
      router.replace('/sign-in' as Href);
    } else if (shouldLeaveAuth) {
      router.replace('/');
    }
  }, [router, shouldEnterAuth, shouldLeaveAuth]);

  if (!isLoaded || shouldEnterAuth || shouldLeaveAuth) return null;

  return (
    <Stack screenOptions={{ headerBackTitle: 'Back', headerShown: false, contentStyle: { backgroundColor: '#0B1730' } }}>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="study-plan" />
      <Stack.Screen name="flashcards" />
      <Stack.Screen name="quiz" />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <ClerkProvider
          publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ?? ''}
          tokenCache={tokenCache}
          proxyUrl={process.env.EXPO_PUBLIC_CLERK_PROXY_URL || undefined}
        >
          <ClerkLoaded>
            <QueryClientProvider client={queryClient}>
              <StudyProvider>
                <GestureHandlerRootView style={{ flex: 1 }}>
                  <KeyboardProvider>
                    <RootLayoutNav />
                  </KeyboardProvider>
                </GestureHandlerRootView>
              </StudyProvider>
            </QueryClientProvider>
          </ClerkLoaded>
        </ClerkProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}