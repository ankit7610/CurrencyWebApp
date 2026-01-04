import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CurrencySelect, type Currency } from '../components/CurrencySelect';

describe('CurrencySelect', () => {
  const mockCurrencies: Currency[] = [
    { code: 'USD', rate: 1.0 },
    { code: 'EUR', rate: 0.85 },
    { code: 'GBP', rate: 0.73 },
    { code: 'JPY', rate: 110.0 },
  ];

  it('renders the label correctly', () => {
    render(
      <CurrencySelect
        label="From Currency"
        value="USD"
        currencies={mockCurrencies}
        onChange={() => {}}
        id="from-currency"
      />
    );
    expect(screen.getByText('From Currency')).toBeInTheDocument();
  });

  it('renders all currency options', () => {
    render(
      <CurrencySelect
        label="From Currency"
        value="USD"
        currencies={mockCurrencies}
        onChange={() => {}}
        id="from-currency"
      />
    );
    
    mockCurrencies.forEach(currency => {
      expect(screen.getByText(currency.code)).toBeInTheDocument();
    });
  });

  it('displays the selected currency', () => {
    render(
      <CurrencySelect
        label="From Currency"
        value="EUR"
        currencies={mockCurrencies}
        onChange={() => {}}
        id="from-currency"
      />
    );
    
    const select = screen.getByLabelText('From Currency') as HTMLSelectElement;
    expect(select.value).toBe('EUR');
  });

  it('calls onChange when a different currency is selected', async () => {
    const user = userEvent.setup();
    const mockOnChange = vi.fn();
    
    render(
      <CurrencySelect
        label="From Currency"
        value="USD"
        currencies={mockCurrencies}
        onChange={mockOnChange}
        id="from-currency"
      />
    );
    
    const select = screen.getByLabelText('From Currency');
    await user.selectOptions(select, 'GBP');
    
    expect(mockOnChange).toHaveBeenCalledWith('GBP');
    expect(mockOnChange).toHaveBeenCalledTimes(1);
  });

  it('has correct select element id', () => {
    render(
      <CurrencySelect
        label="From Currency"
        value="USD"
        currencies={mockCurrencies}
        onChange={() => {}}
        id="test-id"
      />
    );
    
    const select = screen.getByLabelText('From Currency');
    expect(select.id).toBe('test-id');
  });

  it('handles empty currency list gracefully', () => {
    render(
      <CurrencySelect
        label="From Currency"
        value=""
        currencies={[]}
        onChange={() => {}}
        id="from-currency"
      />
    );
    
    const select = screen.getByLabelText('From Currency') as HTMLSelectElement;
    expect(select.options.length).toBe(0);
  });

  it('renders options with unique keys', () => {
    const { container } = render(
      <CurrencySelect
        label="From Currency"
        value="USD"
        currencies={mockCurrencies}
        onChange={() => {}}
        id="from-currency"
      />
    );
    
    const options = container.querySelectorAll('option');
    expect(options.length).toBe(mockCurrencies.length);
  });

  it('allows selecting the same currency that is currently selected', async () => {
    const user = userEvent.setup();
    const mockOnChange = vi.fn();
    
    render(
      <CurrencySelect
        label="From Currency"
        value="USD"
        currencies={mockCurrencies}
        onChange={mockOnChange}
        id="from-currency"
      />
    );
    
    const select = screen.getByLabelText('From Currency');
    await user.selectOptions(select, 'USD');
    
    expect(mockOnChange).toHaveBeenCalledWith('USD');
  });

  it('applies correct CSS classes', () => {
    const { container } = render(
      <CurrencySelect
        label="From Currency"
        value="USD"
        currencies={mockCurrencies}
        onChange={() => {}}
        id="from-currency"
      />
    );
    
    expect(container.querySelector('.currency-select-group')).toBeInTheDocument();
    expect(container.querySelector('.currency-select')).toBeInTheDocument();
    expect(container.querySelector('.select-wrapper')).toBeInTheDocument();
  });

  it('renders a large list of currencies', () => {
    const largeCurrencyList: Currency[] = Array.from({ length: 50 }, (_, i) => ({
      code: `CUR${i}`,
      rate: Math.random() * 10,
    }));
    
    render(
      <CurrencySelect
        label="From Currency"
        value="CUR0"
        currencies={largeCurrencyList}
        onChange={() => {}}
        id="from-currency"
      />
    );
    
    const select = screen.getByLabelText('From Currency') as HTMLSelectElement;
    expect(select.options.length).toBe(50);
  });
});
