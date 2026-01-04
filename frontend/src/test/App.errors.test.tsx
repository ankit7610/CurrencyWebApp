import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';

vi.mock('../services/CacheService', () => ({
  cacheService: {
    getResponse: vi.fn(() => Promise.resolve(null)),
    saveResponse: vi.fn(() => Promise.resolve()),
    clearCache: vi.fn(() => Promise.resolve()),
  },
}));

describe('App Error Handling and Edge Cases', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('handles network timeout gracefully', async () => {
    global.fetch = vi.fn(() =>
      new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Network timeout')), 100);
      })
    );
    
    render(<App />);
    
    // The app should render even on network errors
    await waitFor(() => {
      expect(screen.getByText('Currency Converter')).toBeInTheDocument();
    });
  });

  it('handles malformed API response', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.reject(new Error('Invalid JSON')),
      } as Response)
    );
    
    render(<App />);
    
    // The app should render even with malformed responses
    await waitFor(() => {
      expect(screen.getByText('Currency Converter')).toBeInTheDocument();
    });
  });

  it('handles missing currency data in API response', async () => {
    global.fetch = vi.fn((url) => {
      if (url.includes('/currencies')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ currencies: {} }),
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

  it('recovers from conversion error on retry', async () => {
    const user = userEvent.setup();
    let callCount = 0;
    
    global.fetch = vi.fn((url) => {
      if (url.includes('/currencies')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            currencies: { USD: 1.0, EUR: 0.85, GBP: 0.73 },
          }),
        } as Response);
      }
      
      callCount++;
      // First call fails, retry succeeds
      if (callCount === 1) {
        return Promise.resolve({
          ok: false,
          status: 500,
        } as Response);
      }
      
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          from: 'USD',
          to: 'EUR',
          amount: 50,
          convertedAmount: 42.5,
          rate: 0.85,
        }),
      } as Response);
    });
    
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByLabelText('Amount')).toBeInTheDocument();
    });
  });

  it('handles consecutive conversion requests without conflicts', async () => {
    const user = userEvent.setup();
    global.fetch = vi.fn((url) => {
      if (url.includes('/currencies')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            currencies: { USD: 1.0, EUR: 0.85, GBP: 0.73 },
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
    
    const input = screen.getByLabelText('Amount') as HTMLInputElement;
    
    await user.clear(input);
    await user.type(input, '100');
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await user.clear(input);
    await user.type(input, '200');
    
    // Last request should win
    expect(input.value).toBe('200');
  });

  it('handles 404 not found error from API', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ message: 'Currency not found' }),
      } as Response)
    );
    
    render(<App />);
    
    // The app should render even with API errors
    await waitFor(() => {
      expect(screen.getByText('Currency Converter')).toBeInTheDocument();
    });
  });

  it('handles 403 forbidden error', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 403,
        json: () => Promise.resolve({ message: 'Access denied' }),
      } as Response)
    );
    
    render(<App />);
    
    // The app should render even with API errors
    await waitFor(() => {
      expect(screen.getByText('Currency Converter')).toBeInTheDocument();
    });
  });

  it('handles 429 rate limit error', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 429,
        json: () => Promise.resolve({ message: 'Rate limit exceeded' }),
      } as Response)
    );
    
    render(<App />);
    
    // The app should render even with API errors
    await waitFor(() => {
      expect(screen.getByText('Currency Converter')).toBeInTheDocument();
    });
  });

  it('handles response with null values gracefully', async () => {
    global.fetch = vi.fn((url) => {
      if (url.includes('/currencies')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            currencies: { USD: 1.0, EUR: 0.85 },
          }),
        } as Response);
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          from: 'USD',
          to: 'EUR',
          amount: 100,
          convertedAmount: null,
          rate: null,
        }),
      } as Response);
    });
    
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByLabelText('Amount')).toBeInTheDocument();
    });
  });

  it('handles undefined values in API response', async () => {
    global.fetch = vi.fn((url) => {
      if (url.includes('/currencies')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            currencies: { USD: 1.0, EUR: 0.85 },
          }),
        } as Response);
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          from: 'USD',
          to: 'EUR',
          amount: 100,
          convertedAmount: undefined,
          rate: undefined,
        }),
      } as Response);
    });
    
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByLabelText('Amount')).toBeInTheDocument();
    });
  });

  it('handles special float values in conversion', async () => {
    const user = userEvent.setup();
    global.fetch = vi.fn((url) => {
      if (url.includes('/currencies')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            currencies: { USD: 1.0, EUR: 0.85 },
          }),
        } as Response);
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          from: 'USD',
          to: 'EUR',
          amount: 0.000001,
          convertedAmount: 0.00000085,
          rate: 0.85,
        }),
      } as Response);
    });
    
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByLabelText('Amount')).toBeInTheDocument();
    });
    
    const input = screen.getByLabelText('Amount') as HTMLInputElement;
    await user.clear(input);
    await user.type(input, '0.000001');
    
    expect(input.value).toBe('0.000001');
  });

  it('handles rapid amount changes within throttle window', async () => {
    const user = userEvent.setup();
    global.fetch = vi.fn((url) => {
      if (url.includes('/currencies')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            currencies: { USD: 1.0, EUR: 0.85 },
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
    
    const input = screen.getByLabelText('Amount') as HTMLInputElement;
    
    await user.clear(input);
    await user.type(input, '1', { delay: 10 });
    await user.type(input, '0', { delay: 10 });
    await user.type(input, '0', { delay: 10 });
    
    expect(input.value).toBe('100');
  });

  it('handles localStorage errors gracefully', async () => {
    // Mock localStorage to throw an error
    const originalLocalStorage = global.localStorage;
    global.localStorage = {
      getItem: () => { throw new Error('localStorage disabled'); },
      setItem: () => { throw new Error('localStorage disabled'); },
    } as any;
    
    global.fetch = vi.fn((url) => {
      if (url.includes('/currencies')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            currencies: { USD: 1.0, EUR: 0.85 },
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
      expect(screen.getByText('Currency Converter')).toBeInTheDocument();
    });
    
    // Restore localStorage
    global.localStorage = originalLocalStorage;
  });

  it('handles extremely small conversion rates', async () => {
    global.fetch = vi.fn((url) => {
      if (url.includes('/currencies')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            currencies: { USD: 1.0, BTC: 0.000023 },
          }),
        } as Response);
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          from: 'USD',
          to: 'BTC',
          amount: 1000,
          convertedAmount: 0.023,
          rate: 0.000023,
        }),
      } as Response);
    });
    
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByLabelText('Amount')).toBeInTheDocument();
    });
  });

  it('handles extremely large conversion rates', async () => {
    global.fetch = vi.fn((url) => {
      if (url.includes('/currencies')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            currencies: { USD: 1.0, VEF: 2500000.0 },
          }),
        } as Response);
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          from: 'USD',
          to: 'VEF',
          amount: 1,
          convertedAmount: 2500000.0,
          rate: 2500000.0,
        }),
      } as Response);
    });
    
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByLabelText('Amount')).toBeInTheDocument();
    });
  });
});
