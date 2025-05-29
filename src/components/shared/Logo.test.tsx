import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Logo } from './Logo';

describe('Logo Component', () => {
  test('renders SwiftTrack name', () => {
    render(<Logo />);
    expect(screen.getByText('SwiftTrack')).toBeInTheDocument();
  });

  test('renders with a link to the homepage', () => {
    render(<Logo />);
    const linkElement = screen.getByRole('link', { name: /SwiftTrack Home/i });
    expect(linkElement).toBeInTheDocument();
    expect(linkElement).toHaveAttribute('href', '/');
  });

  test('renders Package icon', () => {
    const { container } = render(<Logo />);
    const svgElement = container.querySelector('svg');
    expect(svgElement).toBeInTheDocument();
  });

  test('renders small size correctly', () => {
    render(<Logo size="small" />);
    const icon = screen.getByRole('link', { name: /SwiftTrack Home/i }).querySelector('svg');
    expect(icon).toHaveClass('h-6 w-6'); // Check size-specific classes
    expect(screen.getByText('SwiftTrack')).toHaveClass('text-xl');
  });

  test('renders normal (default) size correctly', () => {
    render(<Logo />);
    const icon = screen.getByRole('link', { name: /SwiftTrack Home/i }).querySelector('svg');
    expect(icon).toHaveClass('h-8 w-8');
    expect(screen.getByText('SwiftTrack')).toHaveClass('text-2xl');
  });

  test('renders large size correctly', () => {
    render(<Logo size="large" />);
    const icon = screen.getByRole('link', { name: /SwiftTrack Home/i }).querySelector('svg');
    expect(icon).toHaveClass('h-10 w-10');
    expect(screen.getByText('SwiftTrack')).toHaveClass('text-3xl');
  });
});
