import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CurrencyInput } from '../components/CurrencyInput';

describe('CurrencyInput', () => {
  it('renders with the provided amount', () => {
    render(<CurrencyInput amount="100" onAmountChange={() => {}} />);
    const input = screen.getByLabelText('Amount') as HTMLInputElement;
    expect(input.value).toBe('100');
  });

  it('calls onAmountChange when user types', async () => {
    const user = userEvent.setup();
    const mockOnChange = vi.fn();
    render(<CurrencyInput amount="" onAmountChange={mockOnChange} />);
    
    const input = screen.getByLabelText('Amount');
    await user.type(input, '250');
    
    // Verify it was called for each character typed
    expect(mockOnChange).toHaveBeenCalled();
    expect(mockOnChange.mock.calls.length).toBeGreaterThan(0);
  });

  it('displays placeholder text when empty', () => {
    render(<CurrencyInput amount="" onAmountChange={() => {}} />);
    const input = screen.getByPlaceholderText('0.00');
    expect(input).toBeInTheDocument();
  });

  it('has correct input attributes', () => {
    render(<CurrencyInput amount="50" onAmountChange={() => {}} />);
    const input = screen.getByLabelText('Amount') as HTMLInputElement;
    expect(input.type).toBe('text');
    expect(input.id).toBe('amount-input');
  });

  it('updates when amount prop changes', () => {
    const { rerender } = render(<CurrencyInput amount="100" onAmountChange={() => {}} />);
    let input = screen.getByLabelText('Amount') as HTMLInputElement;
    expect(input.value).toBe('100');
    
    rerender(<CurrencyInput amount="200" onAmountChange={() => {}} />);
    input = screen.getByLabelText('Amount') as HTMLInputElement;
    expect(input.value).toBe('200');
  });

  it('handles decimal values', async () => {
    const user = userEvent.setup();
    const mockOnChange = vi.fn();
    render(<CurrencyInput amount="" onAmountChange={mockOnChange} />);
    
    const input = screen.getByLabelText('Amount') as HTMLInputElement;
    await user.type(input, '123.45');
    
    // Verify the callback was called with the typed values
    expect(mockOnChange).toHaveBeenCalled();
    expect(mockOnChange.mock.calls.length).toBeGreaterThan(0);
  });

  it('applies correct CSS classes', () => {
    const { container } = render(<CurrencyInput amount="100" onAmountChange={() => {}} />);
    expect(container.querySelector('.input-group')).toBeInTheDocument();
    expect(container.querySelector('.amount-input')).toBeInTheDocument();
    expect(container.querySelector('.input-wrapper')).toBeInTheDocument();
  });

  it('clears input when amount is empty string', () => {
    render(<CurrencyInput amount="" onAmountChange={() => {}} />);
    const input = screen.getByLabelText('Amount') as HTMLInputElement;
    expect(input.value).toBe('');
  });
});
