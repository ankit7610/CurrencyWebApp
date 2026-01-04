import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PopularConversions } from '../components/PopularConversions';

describe('PopularConversions', () => {
  it('renders the component title', () => {
    render(
      <PopularConversions onSelect={() => {}} baseCurrency="USD" />
    );
    expect(screen.getByText('Popular Conversions')).toBeInTheDocument();
  });

  it('displays currency pair buttons', () => {
    render(
      <PopularConversions onSelect={() => {}} baseCurrency="USD" />
    );
    
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('calls onSelect when a currency pair button is clicked', async () => {
    const user = userEvent.setup();
    const mockOnSelect = vi.fn();
    
    render(
      <PopularConversions onSelect={mockOnSelect} baseCurrency="USD" />
    );
    
    const buttons = screen.getAllByRole('button');
    await user.click(buttons[0]);
    
    expect(mockOnSelect).toHaveBeenCalled();
  });

  it('passes correct currency pair to onSelect', async () => {
    const user = userEvent.setup();
    const mockOnSelect = vi.fn();
    
    render(
      <PopularConversions onSelect={mockOnSelect} baseCurrency="USD" />
    );
    
    const buttons = screen.getAllByRole('button');
    await user.click(buttons[0]);
    
    expect(mockOnSelect).toHaveBeenCalledWith(expect.any(String), expect.any(String));
  });

  it('updates popular pairs when baseCurrency changes', () => {
    const mockOnSelect = vi.fn();
    const { rerender } = render(
      <PopularConversions onSelect={mockOnSelect} baseCurrency="USD" />
    );
    
    const usdTexts = screen.getAllByText(/USD/);
    expect(usdTexts.length).toBeGreaterThan(0);
    
    rerender(
      <PopularConversions onSelect={mockOnSelect} baseCurrency="EUR" />
    );
    
    const eurTexts = screen.getAllByText(/EUR/);
    expect(eurTexts.length).toBeGreaterThan(0);
  });

  it('avoids duplicate currency pairs', () => {
    const mockOnSelect = vi.fn();
    render(
      <PopularConversions onSelect={mockOnSelect} baseCurrency="USD" />
    );
    
    const buttons = screen.getAllByRole('button');
    const buttonTexts = buttons.map(btn => btn.textContent);
    
    // Check that there are no duplicates
    const uniqueTexts = new Set(buttonTexts);
    expect(uniqueTexts.size).toBe(buttonTexts.length);
  });

  it('shows maximum 4 currency pairs', () => {
    const mockOnSelect = vi.fn();
    render(
      <PopularConversions onSelect={mockOnSelect} baseCurrency="USD" />
    );
    
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeLessThanOrEqual(4);
  });

  it('includes base currency conversion when applicable', () => {
    const mockOnSelect = vi.fn();
    render(
      <PopularConversions onSelect={mockOnSelect} baseCurrency="USD" />
    );
    
    // When base currency is USD, it should suggest converting to other currencies
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('handles different base currencies correctly', () => {
    const mockOnSelect = vi.fn();
    const { rerender } = render(
      <PopularConversions onSelect={mockOnSelect} baseCurrency="EUR" />
    );
    
    let buttons = screen.getAllByRole('button');
    let hasEUR = buttons.some(btn => btn.textContent?.includes('EUR'));
    expect(hasEUR).toBe(true);
    
    rerender(
      <PopularConversions onSelect={mockOnSelect} baseCurrency="GBP" />
    );
    
    buttons = screen.getAllByRole('button');
    hasEUR = buttons.some(btn => btn.textContent?.includes('GBP'));
    expect(hasEUR).toBe(true);
  });

  it('applies correct CSS classes', () => {
    const { container } = render(
      <PopularConversions onSelect={() => {}} baseCurrency="USD" />
    );
    
    expect(container.querySelector('.popular-conversions')).toBeInTheDocument();
    expect(container.querySelector('.section-title')).toBeInTheDocument();
    expect(container.querySelector('.pairs-grid')).toBeInTheDocument();
  });

  it('has correct pair chip styling', () => {
    const { container } = render(
      <PopularConversions onSelect={() => {}} baseCurrency="USD" />
    );
    
    const chips = container.querySelectorAll('.pair-chip');
    expect(chips.length).toBeGreaterThan(0);
    
    chips.forEach(chip => {
      expect(chip.querySelector('.pair-text')).toBeInTheDocument();
    });
  });

  it('handles multiple rapid clicks', async () => {
    const user = userEvent.setup();
    const mockOnSelect = vi.fn();
    
    render(
      <PopularConversions onSelect={mockOnSelect} baseCurrency="USD" />
    );
    
    const buttons = screen.getAllByRole('button');
    
    await user.click(buttons[0]);
    await user.click(buttons[1]);
    await user.click(buttons[0]);
    
    expect(mockOnSelect).toHaveBeenCalledTimes(3);
  });

  it('displays arrow separator in pair text', () => {
    render(
      <PopularConversions onSelect={() => {}} baseCurrency="USD" />
    );
    
    const pairTexts = screen.getAllByText(/→/);
    expect(pairTexts.length).toBeGreaterThan(0);
  });
});
