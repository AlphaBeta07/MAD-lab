import axios from 'axios';

export const USERS_API_URL = 'https://jsonplaceholder.typicode.com/users';
export const REQUEST_TIMEOUT_MS = 10000;

/**
 * Function A: Fetches user list using the native Fetch API.
 * - Requires manual response status checking via `response.ok`.
 * - Requires explicit JSON parsing via `response.json()`.
 *
 * @param {string} [url=USERS_API_URL] - The REST API endpoint URL.
 * @returns {Promise<Array<Object>>} Parsed array of user objects.
 */
export async function fetchUsers(url = USERS_API_URL) {
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    // Fetch API does NOT reject HTTP error status codes (e.g., 404, 500)
    // Developers must explicitly verify response.ok
    if (!response.ok) {
      throw new Error(`Fetch failed with HTTP status ${response.status} (${response.statusText || 'Error'})`);
    }

    // Explicitly parse the response stream into JSON
    const data = await response.json();

    if (!Array.isArray(data)) {
      throw new Error('Unexpected response format: Expected an array of users.');
    }

    return data;
  } catch (error) {
    console.error('[userApi] Fetch API error:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Network request failed while using Fetch API. Please check your connection.');
  }
}

/**
 * Function B: Fetches user list using Axios.
 * - Automatically rejects non-2xx HTTP status codes.
 * - Automatically deserializes JSON response into `response.data`.
 * - Supports declarative timeout configuration.
 *
 * @param {string} [url=USERS_API_URL] - The REST API endpoint URL.
 * @returns {Promise<Array<Object>>} Deserialized array of user objects.
 */
export async function fetchUsersWithAxios(url = USERS_API_URL) {
  try {
    const response = await axios.get(url, {
      timeout: REQUEST_TIMEOUT_MS,
      headers: {
        Accept: 'application/json',
      },
    });

    // Axios stores the automatically parsed response body in .data
    const data = response.data;

    if (!Array.isArray(data)) {
      throw new Error('Unexpected response format: Expected an array of users.');
    }

    return data;
  } catch (error) {
    console.error('[userApi] Axios error:', error);

    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        throw new Error(`Request timed out after ${REQUEST_TIMEOUT_MS / 1000} seconds.`);
      }
      if (error.response) {
        // Server responded with an HTTP status outside of 2xx range
        throw new Error(`Server responded with HTTP ${error.response.status}: ${error.response.statusText || 'Error'}`);
      }
      if (error.request) {
        // Request was made but no response was received (e.g., device offline)
        throw new Error('No response from server. Please check your network connection.');
      }
    }

    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred while using Axios.');
  }
}
