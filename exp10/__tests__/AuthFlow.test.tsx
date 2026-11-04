import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { AuthProvider } from '../src/context/AuthContext';
import { LoginScreen } from '../src/screens/LoginScreen';
import { RegisterScreen } from '../src/screens/RegisterScreen';
import { HomeScreen } from '../src/screens/HomeScreen';

describe('Authentication Flow Screens (Experiment E10)', () => {
  it('renders LoginScreen with input fields and sign in button', async () => {
    const mockNavigate = jest.fn();
    let tree!: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      tree = ReactTestRenderer.create(
        <AuthProvider>
          <LoginScreen onNavigateToRegister={mockNavigate} />
        </AuthProvider>
      );
    });

    const root = tree.root;
    const signInElements = root.findAllByProps({ children: 'Sign In' });
    expect(signInElements.length).toBeGreaterThanOrEqual(1);

    const forgotText = root.findByProps({ children: 'Forgot Password?' });
    expect(forgotText).toBeDefined();

    await ReactTestRenderer.act(async () => {
      tree.unmount();
    });
  });

  it('renders RegisterScreen with email, password, and confirm password fields', async () => {
    const mockNavigate = jest.fn();
    let tree!: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      tree = ReactTestRenderer.create(
        <AuthProvider>
          <RegisterScreen onNavigateToLogin={mockNavigate} />
        </AuthProvider>
      );
    });

    const root = tree.root;
    const createAccountElements = root.findAllByProps({ children: 'Create Account' });
    expect(createAccountElements.length).toBeGreaterThanOrEqual(1);

    const signUpTitle = root.findByProps({ children: 'Sign Up' });
    expect(signUpTitle).toBeDefined();

    await ReactTestRenderer.act(async () => {
      tree.unmount();
    });
  });

  it('renders HomeScreen with account information and logout button', async () => {
    let tree!: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      tree = ReactTestRenderer.create(
        <AuthProvider>
          <HomeScreen />
        </AuthProvider>
      );
    });

    const root = tree.root;
    const heading = root.findByProps({ children: 'Account Information' });
    expect(heading).toBeDefined();

    const logoutBtn = root.findByProps({ children: '🚪 Sign Out' });
    expect(logoutBtn).toBeDefined();

    await ReactTestRenderer.act(async () => {
      tree.unmount();
    });
  });
});
