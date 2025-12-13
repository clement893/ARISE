/**
 * Utility functions for token refresh
 */

/**
 * Refresh access token using refresh token from cookie
 */
export async function refreshAccessToken(): Promise<string | null> {
  try {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include',
    });

    if (response.ok) {
      const data = await response.json();
      if (data.accessToken) {
        localStorage.setItem('arise_access_token', data.accessToken);
        return data.accessToken;
      }
    }
  } catch (error) {
    console.error('Failed to refresh token:', error);
  }
  return null;
}

/**
 * Make an authenticated fetch request with automatic token refresh
 */
export async function authenticatedFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  let accessToken = localStorage.getItem('arise_access_token');

  // If no token, try to refresh
  if (!accessToken) {
    accessToken = await refreshAccessToken();
  }

  // Prepare headers
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  // Make the request
  let response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });

  // If unauthorized, try to refresh token and retry once
  if (response.status === 401 && accessToken) {
    console.log('Token expired, refreshing...');
    const newToken = await refreshAccessToken();
    if (newToken) {
      console.log('Token refreshed, retrying request...');
      headers.set('Authorization', `Bearer ${newToken}`);
      response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include',
      });
    } else {
      console.error('Failed to refresh token, user may need to login again');
    }
  }

  return response;
}
