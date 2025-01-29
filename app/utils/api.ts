export function getBaseUrl() {
  if (typeof window !== 'undefined') {
    // browser should use relative path
    return '';
  }
  // reference for vercel.com
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  // use NEXT_PUBLIC_APP_URL from environment variables
  return process.env.NEXT_PUBLIC_APP_URL || 'https://www.spectrumpccoe25.tech';
}

export async function fetchApi(endpoint: string, init?: RequestInit) {
  const baseUrl = getBaseUrl();
  const url = new URL(endpoint, baseUrl);
  
  const defaultInit: RequestInit = {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    }
  };

  const mergedInit: RequestInit = {
    ...defaultInit,
    ...init,
    headers: {
      ...defaultInit.headers,
      ...init?.headers,
    }
  };

  return fetch(url, mergedInit);
}
