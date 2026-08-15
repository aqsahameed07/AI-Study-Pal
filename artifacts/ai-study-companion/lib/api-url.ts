import Constants from 'expo-constants';

export function getApiBaseUrl() {
  const configuredUrl = process.env.EXPO_PUBLIC_API_URL?.trim();

  if (configuredUrl) {
    return configuredUrl.replace(/\/+$/, '');
  }

  const hostUri =
    Constants.expoConfig?.hostUri ??
    (Constants as any)?.manifest2?.extra?.expoGo?.hostUri ??
    (Constants as any)?.manifest?.debuggerHost ??
    '';

  if (hostUri) {
    const host = hostUri.split(':')[0];
    return `http://${host}:5000/api`;
  }

  return 'http://localhost:5000/api';
}
