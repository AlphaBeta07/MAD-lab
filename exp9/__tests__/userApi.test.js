import axios from 'axios';
import { fetchUsers, fetchUsersWithAxios } from '../src/services/userApi';

jest.mock('axios');

describe('userApi Service (Experiment E09)', () => {
  const mockUsers = [
    {
      id: 1,
      name: 'Leanne Graham',
      username: 'Bret',
      email: 'Sincere@april.biz',
      phone: '1-770-736-8031 x56442',
      website: 'hildegard.org',
      company: { name: 'Romaguera-Crona' },
      address: { city: 'Gwenborough' },
    },
    {
      id: 2,
      name: 'Ervin Howell',
      username: 'Antonette',
      email: 'Shanna@melissa.tv',
      phone: '010-692-6593 x09125',
      website: 'anastasia.net',
      company: { name: 'Deckow-Crist' },
      address: { city: 'Wisokyburgh' },
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchUsers (Fetch API)', () => {
    it('successfully retrieves and parses users via Fetch API', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockUsers,
      });

      const users = await fetchUsers();
      expect(users).toEqual(mockUsers);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://jsonplaceholder.typicode.com/users',
        expect.objectContaining({ method: 'GET' })
      );
    });

    it('throws error when response.ok is false', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      await expect(fetchUsers()).rejects.toThrow(
        'Fetch failed with HTTP status 404'
      );
    });

    it('throws error when response format is not an array', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ message: 'unexpected object' }),
      });

      await expect(fetchUsers()).rejects.toThrow(
        'Unexpected response format: Expected an array of users.'
      );
    });
  });

  describe('fetchUsersWithAxios (Axios)', () => {
    it('successfully retrieves users via Axios', async () => {
      axios.get.mockResolvedValue({
        status: 200,
        data: mockUsers,
      });

      const users = await fetchUsersWithAxios();
      expect(users).toEqual(mockUsers);
      expect(axios.get).toHaveBeenCalledWith(
        'https://jsonplaceholder.typicode.com/users',
        expect.objectContaining({ timeout: 10000 })
      );
    });

    it('handles Axios timeout error (ECONNABORTED)', async () => {
      const timeoutError = new Error('timeout of 10000ms exceeded');
      timeoutError.code = 'ECONNABORTED';
      timeoutError.isAxiosError = true;
      axios.isAxiosError.mockReturnValue(true);
      axios.get.mockRejectedValue(timeoutError);

      await expect(fetchUsersWithAxios()).rejects.toThrow('Request timed out');
    });

    it('handles Axios server HTTP error (status outside 2xx)', async () => {
      const httpError = new Error('Request failed with status code 500');
      httpError.isAxiosError = true;
      httpError.response = { status: 500, statusText: 'Internal Server Error' };
      axios.isAxiosError.mockReturnValue(true);
      axios.get.mockRejectedValue(httpError);

      await expect(fetchUsersWithAxios()).rejects.toThrow('Server responded with HTTP 500');
    });
  });
});
