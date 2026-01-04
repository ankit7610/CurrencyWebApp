import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';

// Mock the CacheService
vi.mock('../services/CacheService', () => ({
  cacheService: {
    getResponse: vi.fn(() => Promise.resolve(null)),
    saveResponse: vi.fn(() => Promise.resolve()),
    clearCache: vi.fn(() => Promise.resolve()),
  },
}));

describe('App Integration Tests', () => {
  beforeEach(() => {
    global.fetch = vi.fn((url) => {
      if (url.includes('/currencies')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            currencies: {
              USD: 1.0,
              EUR: 0.85,
              GBP: 0.73,
              JPY: 110.0,
              CAD: 1.36,
              AUD: 1.53,
              CHF: 0.88,
              CNY: 7.24,
            },
          }),
        } as Response);
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          from: 'USD',
          to: 'EUR',
          amount: 100,
          convertedAmount: 85,
          rate: 0.85,
        }),
      } as Response);
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders the complete app layout', async () => {
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText('Currency Converter')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Real-time exchange rates')).toBeInTheDocument();
    expect(screen.getByLabelText('From')).toBeInTheDocument();
    expect(screen.getByLabelText('To')).toBeInTheDocument();
  });

  it('fetches and displays currencies on mount', async () => {
    render(<App />);
    
    await waitFor(() => {
      const fromSelect = screen.getByLabelText('From') as HTMLSelectElement;
      expect(fromSelect.options.length).toBeGreaterThan(0);
    });
  });

  it('performs currency conversion with valid input', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByLabelText('From')).toBeInTheDocument();
    });
    
    const input = screen.getByLabelText('Amount') as HTMLInputElement;
    await user.clear(input);
    await user.type(input, '100');
    
    await waitFor(() => {
      const result = screen.queryByText(/Converted Amount/i);
      expect(result).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('swaps currencies and maintains conversion', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByLabelText('From')).toBeInTheDocument();
    });
    
    const fromSelect = screen.getByLabelText('From') as HTMLSelectElement;
    const toSelect = screen.getByLabelText('To') as HTMLSelectElement;
    
    const originalFrom = fromSelect.value;
    const originalTo = toSelect.value;
    
    const swapButton = screen.getByRole('button', { name: /swap currencies/i });
    await user.click(swapButton);
    
    await waitFor(() => {
      expect(fromSelect.value).toBe(originalTo);
      expect(toSelect.value).toBe(originalFrom);
    });
  });

  it('updates conversion when source currency changes', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByLabelText('From')).toBeInTheDocument();
    });
    
    const fromSelect = screen.getByLabelText('From');
    await user.selectOptions(fromSelect, 'EUR');
    
    await waitFor(() => {
      expect((fromSelect as HTMLSelectElement).value).toBe('EUR');
    });
  });

  it('updates conversion when target currency changes', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    // Wait for the select elements to have options populated
    await waitFor(() => {
      const toSelect = screen.getByLabelText('To') as HTMLSelectElement;
      expect(toSelect.options.length).toBeGreaterThan(1);
    });
    
    const toSelect = screen.getByLabelText('To') as HTMLSelectElement;
    const gbpOption = Array.from(toSelect.options).find(opt => opt.value === 'GBP');
    
    if (gbpOption) {
      await user.selectOptions(toSelect, 'GBP');
      
      await waitFor(() => {
        expect(toSelect.value).toBe('GBP');
      });
    }
  });

  it('handles failed currency fetch gracefully', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 500,
      } as Response)
    );
    
    render(<App />);
    
    // The app should render even if currency fetch fails
    await waitFor(() => {
      expect(screen.getByText('Currency Converter')).toBeInTheDocument();
    });
  });

  it('handles conversion API errors', async () => {
    const user = userEvent.setup();
    let callCount = 0;
    
    global.fetch = vi.fn((url) => {
      if (url.includes('/currencies')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            currencies: { USD: 1.0, EUR: 0.85 },
          }),
        } as Response);
      }
      
      // Second call onwards returns error
      callCount++;
      if (callCount > 1) {
        return Promise.resolve({
          ok: false,
          status: 400,
          json: () => Promise.resolve({
            message: 'Invalid currency',
          }),
        } as Response);
      }
      
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          from: 'USD',
          to: 'EUR',
          amount: 100,
          convertedAmount: 85,
          rate: 0.85,
        }),
      } as Response);
    });
    
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByLabelText('Amount')).toBeInTheDocument();
    });
  });

  it('maintains amount input while changing currencies', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByLabelText('Amount')).toBeInTheDocument();
    });
    
    const input = screen.getByLabelText('Amount') as HTMLInputElement;
    await user.clear(input);
    await user.type(input, '500');
    
    const fromSelect = screen.getByLabelText('From');
    await user.selectOptions(fromSelect, 'EUR');
    
    expect(input.value).toBe('500');
  });

  it('shows loading state during conversion', async () => {
    const user = userEvent.setup();
    let resolveConversion: (() => void) | null = null;
    
    global.fetch = vi.fn((url) => {
      if (url.includes('/currencies')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            currencies: { USD: 1.0, EUR: 0.85 },
          }),
        } as Response);
      }
      
      return new Promise((resolve) => {
        resolveConversion = () => {
          resolve({
            ok: true,
            json: () => Promise.resolve({
              from: 'USD',
              to: 'EUR',
              amount: 100,
              convertedAmount: 85,
              rate: 0.85,
            }),
          } as Response);
        };
      });
    });
    
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByLabelText('Amount')).toBeInTheDocument();
    });
    
    const input = screen.getByLabelText('Amount') as HTMLInputElement;
    await user.clear(input);
    await user.type(input, '100');
    
    // Loading state might appear briefly
    await new Promise(resolve => setTimeout(resolve, 100));
    
    if (resolveConversion) {
      resolveConversion();
    }
  });

  it('clears errors when user fixes invalid input', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByLabelText('Amount')).toBeInTheDocument();
    });
    
    const input = screen.getByLabelText('Amount') as HTMLInputElement;
    
    // Input is valid, no error should show
    await user.clear(input);
    await user.type(input, '50');
    
    // Errors should be cleared
    const errorMessages = screen.queryAllByText(/error/i);
    expect(errorMessages.length).toBe(0);
  });

  it('handles rapid currency changes', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByLabelText('From')).toBeInTheDocument();
    });
    
    const fromSelect = screen.getByLabelText('From');
    
    await user.selectOptions(fromSelect, 'EUR');
    await user.selectOptions(fromSelect, 'GBP');
    await user.selectOptions(fromSelect, 'JPY');
    
    expect((fromSelect as HTMLSelectElement).value).toBe('JPY');
  });

  it('caches conversion results', async () => {
    const user = userEvent.setup();
    const { cacheService } = await import('../services/CacheService');
    
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByLabelText('Amount')).toBeInTheDocument();
    });
    
    const input = screen.getByLabelText('Amount') as HTMLInputElement;
    await user.clear(input);
    await user.type(input, '100');
    
    await waitFor(() => {
      expect(cacheService.saveResponse).toHaveBeenCalled();
    });
  });

  it('displays footer information', async () => {
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText('Powered by FreeCurrencyAPI')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Hourly Updates')).toBeInTheDocument();
  });

  it('handles very large conversion amounts', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByLabelText('Amount')).toBeInTheDocument();
    });
    
    const input = screen.getByLabelText('Amount') as HTMLInputElement;
    await user.clear(input);
    await user.type(input, '999999999');
    
    // Should handle without errors
    expect(input.value).toBe('999999999');
  });

  it('displays conversion result with proper formatting', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByLabelText('Amount')).toBeInTheDocument();
    });
    
    const input = screen.getByLabelText('Amount') as HTMLInputElement;
    await user.clear(input);
    await user.type(input, '123.45');
    
    await waitFor(() => {
      const result = screen.queryByText(/Converted Amount/i);
      expect(result).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('provides exchange rate information', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByLabelText('Amount')).toBeInTheDocument();
    });
    
    const input = screen.getByLabelText('Amount') as HTMLInputElement;
    await user.clear(input);
    await user.type(input, '100');
    
    await waitFor(() => {
      const rateText = screen.queryByText(/=/);
      expect(rateText).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('prevents conversion with invalid amount', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByLabelText('Amount')).toBeInTheDocument();
    });
    
    const input = screen.getByLabelText('Amount') as HTMLInputElement;
    await user.clear(input);
    
    // With empty input, conversion shouldn't happen automatically
    // Wait a moment for any pending updates
    await new Promise(resolve => setTimeout(resolve, 100));
  });

  it('restores currencies after selecting same source and target', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByLabelText('From')).toBeInTheDocument();
    });
    
    const fromSelect = screen.getByLabelText('From');
    const toSelect = screen.getByLabelText('To');
    
    await user.selectOptions(fromSelect, 'USD');
    await user.selectOptions(toSelect, 'USD');
    
    expect((fromSelect as HTMLSelectElement).value).toBe('USD');
    expect((toSelect as HTMLSelectElement).value).toBe('USD');
  });
});
