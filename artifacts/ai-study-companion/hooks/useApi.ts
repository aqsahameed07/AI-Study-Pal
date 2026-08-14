import { useAuth } from '@clerk/expo';
import { ApiClient } from '@/services/api';

export function useApi() {
  const { getToken, isSignedIn } = useAuth();

  const getApiClient = async () => {
    if (!isSignedIn) {
      throw new Error('User not signed in');
    }
    const token = await getToken();
    return new ApiClient(token || undefined);
  };

  return { getApiClient };
}