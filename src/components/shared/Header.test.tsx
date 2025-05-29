
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Header } from './Header';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import type { AuthenticatedUser } from '@/lib/types';

// Mock the custom hooks
jest.mock('@/hooks/useAuth');
jest.mock('next-themes');
jest.mock('next/navigation');

const mockUseAuth = useAuth as jest.Mock;
const mockUseTheme = useTheme as jest.Mock;
const mockUseRouter = useRouter as jest.Mock;

describe('Header Component', () => {
  const mockRouterPush = jest.fn();
  const mockSetTheme = jest.fn();

  beforeEach(() => {
    mockUseRouter.mockReturnValue({ push: mockRouterPush });
    mockUseTheme.mockReturnValue({ theme: 'light', setTheme: mockSetTheme });
    // Reset mocks for each test
    mockRouterPush.mockClear();
    mockSetTheme.mockClear();
  });

  test('renders logo', () => {
    mockUseAuth.mockReturnValue({ user: null, isLoading: false, logout: jest.fn() });
    render(<Header />);
    expect(screen.getByLabelText('SwiftTrack Home')).toBeInTheDocument();
  });

  test('renders loading state', () => {
    mockUseAuth.mockReturnValue({ user: null, isLoading: true, logout: jest.fn() });
    render(<Header />);
    // Expect skeletons or some loading indicator
    expect(screen.getAllByRole('generic', { name: '' })[0]).toHaveClass('animate-pulse'); // Basic check for skeleton
  });

  describe('Unauthenticated User', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({ user: null, isLoading: false, logout: jest.fn() });
    });

    test('renders Home and Login buttons', () => {
      render(<Header />);
      expect(screen.getByRole('button', { name: /Home/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Login/i })).toBeInTheDocument();
    });

    test('navigates to home on Home button click', () => {
      render(<Header />);
      fireEvent.click(screen.getByRole('button', { name: /Home/i }));
      expect(mockRouterPush).toHaveBeenCalledWith('/');
    });

    test('navigates to home (portals) on Login button click', () => {
      render(<Header />);
      fireEvent.click(screen.getByRole('button', { name: /Login/i }));
      expect(mockRouterPush).toHaveBeenCalledWith('/');
    });
  });

  describe('Authenticated User (Vendor)', () => {
    const mockVendorUser: AuthenticatedUser = {
      id: 'vendor1',
      name: 'Test Vendor',
      email: 'vendor@example.com',
      role: 'vendor',
    };
    const mockLogout = jest.fn();

    beforeEach(() => {
      mockUseAuth.mockReturnValue({ user: mockVendorUser, isLoading: false, logout: mockLogout });
      mockLogout.mockClear();
    });

    test('renders user name, role, and Logout button', () => {
      render(<Header />);
      expect(screen.getByText(`${mockVendorUser.name} (vendor)`)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Logout/i })).toBeInTheDocument();
    });

    test('navigates to vendor dashboard on profile click', () => {
      render(<Header />);
      fireEvent.click(screen.getByText(`${mockVendorUser.name} (vendor)`));
      expect(mockRouterPush).toHaveBeenCalledWith('/vendor/dashboard');
    });

    test('calls logout and navigates to home on Logout button click', () => {
      render(<Header />);
      fireEvent.click(screen.getByRole('button', { name: /Logout/i }));
      expect(mockLogout).toHaveBeenCalledTimes(1);
      expect(mockRouterPush).toHaveBeenCalledWith('/');
    });
  });
  
  describe('Theme Toggle', () => {
    test('renders theme toggle button (moon icon for light theme)', () => {
      mockUseAuth.mockReturnValue({ user: null, isLoading: false, logout: jest.fn() });
      mockUseTheme.mockReturnValue({ theme: 'light', setTheme: mockSetTheme, systemTheme: 'light', resolvedTheme: 'light' });
      render(<Header />);
      expect(screen.getByLabelText('Switch to dark mode')).toBeInTheDocument();
      expect(screen.getByLabelText('Switch to dark mode').querySelector('svg')).toHaveClass('lucide-moon');
    });

    test('renders theme toggle button (sun icon for dark theme)', () => {
      mockUseAuth.mockReturnValue({ user: null, isLoading: false, logout: jest.fn() });
      mockUseTheme.mockReturnValue({ theme: 'dark', setTheme: mockSetTheme, systemTheme: 'dark', resolvedTheme: 'dark' });
      render(<Header />);
      expect(screen.getByLabelText('Switch to light mode')).toBeInTheDocument();
      expect(screen.getByLabelText('Switch to light mode').querySelector('svg')).toHaveClass('lucide-sun');
    });

    test('calls setTheme when theme toggle button is clicked (light to dark)', () => {
      mockUseAuth.mockReturnValue({ user: null, isLoading: false, logout: jest.fn() });
      mockUseTheme.mockReturnValue({ theme: 'light', setTheme: mockSetTheme, systemTheme: 'light', resolvedTheme: 'light' });
      render(<Header />);
      fireEvent.click(screen.getByLabelText('Switch to dark mode'));
      expect(mockSetTheme).toHaveBeenCalledWith('dark');
    });

     test('calls setTheme when theme toggle button is clicked (dark to light)', () => {
      mockUseAuth.mockReturnValue({ user: null, isLoading: false, logout: jest.fn() });
      mockUseTheme.mockReturnValue({ theme: 'dark', setTheme: mockSetTheme, systemTheme: 'dark', resolvedTheme: 'dark' });
      render(<Header />);
      fireEvent.click(screen.getByLabelText('Switch to light mode'));
      expect(mockSetTheme).toHaveBeenCalledWith('light');
    });
  });
});
