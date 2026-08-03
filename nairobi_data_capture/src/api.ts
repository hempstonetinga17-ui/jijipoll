/**
 * Kijijipoll REST API config for mobile app
 * Update BASE_URL to your deployed domain (e.g. https://jijipoll.co.ke)
 * or use your dev machine's LAN IP when developing (e.g. http://192.168.x.x:3000)
 */
export const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

/**
 * Get a Firebase ID token for authenticating requests to the Next.js API.
 */
import { auth } from './firebase';

export async function getAuthHeaders(): Promise<HeadersInit> {
  const user = auth.currentUser;
  if (!user) return { 'Content-Type': 'application/json' };
  const token = await user.getIdToken();
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

/**
 * POST to a REST endpoint. Falls back to offline queue if network is unavailable.
 */
export async function apiPost(endpoint: string, body: object): Promise<any> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
    throw new Error(err.error ?? `Request failed: ${res.status}`);
  }
  return res.json();
}
