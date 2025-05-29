
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { LoginForm } from './LoginForm';
import type { UserRole } from '@/lib/types';

describe('LoginForm Component', () => {
  const mockOnSubmit = jest.fn();

  const defaultProps = {
    role: 'vendor' as UserRole,
    onSubmit: mockOnSubmit,
    title: 'Vendor Login',
    description: 'Access your dashboard.',
  };

  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  test('renders the form with title, description, email, and password fields', () => {
    render(<LoginForm {...defaultProps} />);
    expect(screen.getByText(defaultProps.title)).toBeInTheDocument();
    expect(screen.getByText(defaultProps.description)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Login as Vendor/i })).toBeInTheDocument();
  });

  test('displays delivery partner role correctly in button', () => {
    render(<LoginForm {...defaultProps} role="delivery_partner" />);
    expect(screen.getByRole('button', { name: /Login as Delivery Partner/i })).toBeInTheDocument();
  });

  test('allows typing in email and password fields', () => {
    render(<LoginForm {...defaultProps} />);
    const emailInput = screen.getByLabelText(/Email Address/i) as HTMLInputElement;
    const passwordInput = screen.getByLabelText(/Password/i) as HTMLInputElement;

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(emailInput.value).toBe('test@example.com');
    expect(passwordInput.value).toBe('password123');
  });

  test('shows validation errors for empty fields on submit attempt', async () => {
    render(<LoginForm {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: /Login as Vendor/i }));

    expect(await screen.findByText(/Please enter a valid email address./i)).toBeInTheDocument();
    expect(await screen.findByText(/Password must be at least 6 characters./i)).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  test('shows validation error for invalid email format', async () => {
    render(<LoginForm {...defaultProps} />);
    const emailInput = screen.getByLabelText(/Email Address/i);
    const passwordInput = screen.getByLabelText(/Password/i);

    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /Login as Vendor/i }));
    
    expect(await screen.findByText(/Please enter a valid email address./i)).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  test('shows validation error for short password', async () => {
    render(<LoginForm {...defaultProps} />);
    const emailInput = screen.getByLabelText(/Email Address/i);
    const passwordInput = screen.getByLabelText(/Password/i);

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: '123' } });
    fireEvent.click(screen.getByRole('button', { name: /Login as Vendor/i }));

    expect(await screen.findByText(/Password must be at least 6 characters./i)).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  test('calls onSubmit with correct data for valid form', async () => {
    render(<LoginForm {...defaultProps} />);
    const emailInput = screen.getByLabelText(/Email Address/i);
    const passwordInput = screen.getByLabelText(/Password/i);

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /Login as Vendor/i }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });

  test('disables submit button and shows loader when isSubmitting is true', () => {
    render(<LoginForm {...defaultProps} isSubmitting={true} />);
    const submitButton = screen.getByRole('button', { name: /Login as Vendor/i });
    expect(submitButton).toBeDisabled();
    expect(submitButton.querySelector('svg.animate-spin')).toBeInTheDocument(); // Checks for loader icon
  });

  test('renders children when provided', () => {
    const childText = "I am a child element";
    render(<LoginForm {...defaultProps}><div>{childText}</div></LoginForm>);
    expect(screen.getByText(childText)).toBeInTheDocument();
  });
});
