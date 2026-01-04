import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SwapButton } from '../components/SwapButton';

describe('SwapButton', () => {
  it('renders the swap button', () => {
    render(<SwapButton onSwap={() => {}} />);
    const button = screen.getByRole('button', { name: /swap currencies/i });
    expect(button).toBeInTheDocument();
  });

  it('calls onSwap when clicked', async () => {
    const user = userEvent.setup();
    const mockOnSwap = vi.fn();
    
    render(<SwapButton onSwap={mockOnSwap} />);
    const button = screen.getByRole('button', { name: /swap currencies/i });
    
    await user.click(button);
    
    expect(mockOnSwap).toHaveBeenCalledTimes(1);
  });

  it('can be clicked multiple times', async () => {
    const user = userEvent.setup();
    const mockOnSwap = vi.fn();
    
    render(<SwapButton onSwap={mockOnSwap} />);
    const button = screen.getByRole('button', { name: /swap currencies/i });
    
    await user.click(button);
    await user.click(button);
    await user.click(button);
    
    expect(mockOnSwap).toHaveBeenCalledTimes(3);
  });

  it('has proper aria-label for accessibility', () => {
    render(<SwapButton onSwap={() => {}} />);
    const button = screen.getByLabelText('Swap currencies');
    expect(button).toBeInTheDocument();
  });

  it('contains an SVG icon', () => {
    const { container } = render(<SwapButton onSwap={() => {}} />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('applies correct CSS classes', () => {
    const { container } = render(<SwapButton onSwap={() => {}} />);
    expect(container.querySelector('.swap-button')).toBeInTheDocument();
    expect(container.querySelector('.swap-icon')).toBeInTheDocument();
  });

  it('is keyboard accessible', async () => {
    const user = userEvent.setup();
    const mockOnSwap = vi.fn();
    
    render(<SwapButton onSwap={mockOnSwap} />);
    const button = screen.getByRole('button', { name: /swap currencies/i });
    
    button.focus();
    expect(button).toHaveFocus();
    
    await user.keyboard('{Enter}');
    expect(mockOnSwap).toHaveBeenCalledTimes(1);
  });

  it('svg has correct attributes', () => {
    const { container } = render(<SwapButton onSwap={() => {}} />);
    const svg = container.querySelector('svg');
    
    expect(svg?.getAttribute('width')).toBe('24');
    expect(svg?.getAttribute('height')).toBe('24');
    expect(svg?.getAttribute('viewBox')).toBe('0 0 24 24');
  });
});
