export const GOOGLE_API_HOST = 'googleapis.com';

export function isGoogleApiRequest(url: string): boolean {
  try {
    return new URL(url).hostname.endsWith(GOOGLE_API_HOST);
  } catch {
    return false;
  }
}
