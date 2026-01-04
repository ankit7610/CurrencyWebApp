import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ConversionResult } from '../components/ConversionResult';

describe('ConversionResult', () => {
  it('renders the converted amount correctly', () => {
    render(
      <ConversionResult
        convertedAmount={850.5}
        toCurrency="EUR"
        fromCurrency="USD"
        exchangeRate={0.85}
      />
    );
    
    expect(screen.getByText('850.50')).toBeInTheDocument();
  });

  it('displays the target currency code', () => {
    render(
      <ConversionResult
        convertedAmount={850}
        toCurrency="EUR"
        fromCurrency="USD"
        exchangeRate={0.85}
      />
    );
    
    expect(screen.getByText('EUR')).toBeInTheDocument();
  });

  it('shows the exchange rate when provided', () => {
    render(
      <ConversionResult
        convertedAmount={850}
        toCurrency="EUR"
        fromCurrency="USD"
        exchangeRate={0.85}
      />
    );
    
    expect(screen.getByText('1 USD = 0.8500 EUR')).toBeInTheDocument();
  });

  it('does not show exchange rate when null', () => {
    render(
      <ConversionResult
        convertedAmount={850}
        toCurrency="EUR"
        fromCurrency="USD"
        exchangeRate={null}
      />
    );
    
    expect(screen.queryByText(/=/)).not.toBeInTheDocument();
  });

  it('formats amount to 2 decimal places', () => {
    render(
      <ConversionResult
        convertedAmount={123.456789}
        toCurrency="GBP"
        fromCurrency="USD"
        exchangeRate={0.73}
      />
    );
    
    expect(screen.getByText('123.46')).toBeInTheDocument();
  });

  it('formats exchange rate to 4 decimal places', () => {
    render(
      <ConversionResult
        convertedAmount={850}
        toCurrency="EUR"
        fromCurrency="USD"
        exchangeRate={0.123456}
      />
    );
    
    expect(screen.getByText('1 USD = 0.1235 EUR')).toBeInTheDocument();
  });

  it('handles zero amount correctly', () => {
    render(
      <ConversionResult
        convertedAmount={0}
        toCurrency="EUR"
        fromCurrency="USD"
        exchangeRate={0.85}
      />
    );
    
    expect(screen.getByText('0.00')).toBeInTheDocument();
  });

  it('handles large amounts correctly', () => {
    render(
      <ConversionResult
        convertedAmount={1234567.89}
        toCurrency="JPY"
        fromCurrency="USD"
        exchangeRate={110.0}
      />
    );
    
    expect(screen.getByText('1234567.89')).toBeInTheDocument();
  });

  it('displays correct label', () => {
    render(
      <ConversionResult
        convertedAmount={850}
        toCurrency="EUR"
        fromCurrency="USD"
        exchangeRate={0.85}
      />
    );
    
    expect(screen.getByText('Converted Amount')).toBeInTheDocument();
  });

  it('applies correct CSS classes', () => {
    const { container } = render(
      <ConversionResult
        convertedAmount={850}
        toCurrency="EUR"
        fromCurrency="USD"
        exchangeRate={0.85}
      />
    );
    
    expect(container.querySelector('.result-section')).toBeInTheDocument();
    expect(container.querySelector('.result-card')).toBeInTheDocument();
    expect(container.querySelector('.result-amount')).toBeInTheDocument();
    expect(container.querySelector('.exchange-rate')).toBeInTheDocument();
  });

  it('handles same currency conversion', () => {
    render(
      <ConversionResult
        convertedAmount={100}
        toCurrency="USD"
        fromCurrency="USD"
        exchangeRate={1.0}
      />
    );
    
    expect(screen.getByText('1 USD = 1.0000 USD')).toBeInTheDocument();
  });

  it('handles very small exchange rates', () => {
    render(
      <ConversionResult
        convertedAmount={0.01}
        toCurrency="EUR"
        fromCurrency="USD"
        exchangeRate={0.0001}
      />
    );
    
    expect(screen.getByText('1 USD = 0.0001 EUR')).toBeInTheDocument();
  });

  it('handles negative amounts (edge case)', () => {
    render(
      <ConversionResult
        convertedAmount={-50}
        toCurrency="EUR"
        fromCurrency="USD"
        exchangeRate={0.85}
      />
    );
    
    expect(screen.getByText('-50.00')).toBeInTheDocument();
  });
});
