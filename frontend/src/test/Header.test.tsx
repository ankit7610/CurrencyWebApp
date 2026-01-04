import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Header } from '../components/Header';

describe('Header', () => {
  it('renders the title correctly', () => {
    render(<Header />);
    expect(screen.getByText('Currency Converter')).toBeInTheDocument();
  });

  it('renders the subtitle correctly', () => {
    render(<Header />);
    expect(screen.getByText('Real-time exchange rates')).toBeInTheDocument();
  });

  it('has correct semantic HTML structure', () => {
    const { container } = render(<Header />);
    const header = container.querySelector('header');
    expect(header).toBeInTheDocument();
    expect(header?.querySelector('h1')).toBeInTheDocument();
    expect(header?.querySelector('p')).toBeInTheDocument();
  });

  it('applies correct CSS classes', () => {
    const { container } = render(<Header />);
    expect(container.querySelector('.header')).toBeInTheDocument();
    expect(container.querySelector('.title')).toBeInTheDocument();
    expect(container.querySelector('.subtitle')).toBeInTheDocument();
  });
});
