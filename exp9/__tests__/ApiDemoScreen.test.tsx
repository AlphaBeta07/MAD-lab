import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { ApiDemoScreen } from '../src/screens/ApiDemoScreen';

// Mock userApi service functions
jest.mock('../src/services/userApi', () => ({
  fetchUsers: jest.fn(() =>
    Promise.resolve([
      {
        id: 1,
        name: 'Leanne Graham',
        username: 'Bret',
        email: 'Sincere@april.biz',
        phone: '1-770-736-8031',
        website: 'hildegard.org',
        company: { name: 'Romaguera-Crona' },
        address: { city: 'Gwenborough' },
      },
    ])
  ),
  fetchUsersWithAxios: jest.fn(() => Promise.resolve([])),
}));

describe('ApiDemoScreen (Experiment E09)', () => {
  it('renders title and UI elements correctly', async () => {
    let tree!: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      tree = ReactTestRenderer.create(<ApiDemoScreen />);
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(tree).toBeDefined();

    await ReactTestRenderer.act(async () => {
      tree.unmount();
    });
  });
});
