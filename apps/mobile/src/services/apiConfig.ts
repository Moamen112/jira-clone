import Constants from 'expo-constants';
import { setApiBaseUrl } from '@jira-clone/shared';

export function configureMobileApi() {
  // Use a real API URL for a hosted build or when Expo runs through a tunnel.
  const configuredUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (configuredUrl) {
    setApiBaseUrl(configuredUrl);
    return;
  }

  // During local development, the Expo server proxies /api to localhost:5000.
  // Its hostUri is reachable from the phone on the same Wi-Fi network.
  const hostUri = Constants.expoConfig?.hostUri;
  if (!hostUri) return;

  try {
    const expoUrl = new URL(hostUri.includes('://') ? hostUri : `http://${hostUri}`);
    const protocol = expoUrl.protocol === 'https:' ? 'https:' : 'http:';
    setApiBaseUrl(`${protocol}//${expoUrl.host}`);
  } catch {
    // Keep the shared default when Expo does not provide a usable host.
  }
}
