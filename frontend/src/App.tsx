import { useState, useEffect } from 'react';
import './App.css';

interface Currency {
  code: string;
  rate: number;
}

interface ConversionResponse {
  from: string;
  to: string;
  amount: number;
  convertedAmount: number;
  rate: number;
}

function App() {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [fromCurrency, setFromCurrency] = useState<string>('USD');
  const [toCurrency, setToCurrency] = useState<string>('EUR');
  const [amount, setAmount] = useState<string>('100');
  const [convertedAmount, setConvertedAmount] = useState<number | null>(null);
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

  const API_BASE_URL = 'http://localhost:8080/api';

  // Fetch available currencies on mount
  useEffect(() => {
    fetchCurrencies();
  }, []);

  // Convert currency when inputs change
  useEffect(() => {
    if (amount && parseFloat(amount) > 0) {
      convertCurrency();
    }
  }, [fromCurrency, toCurrency, amount]);

  const fetchCurrencies = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/currencies`);
      if (!response.ok) throw new Error('Failed to fetch currencies');

      const data = await response.json();
      const currencyList: Currency[] = Object.entries(data.currencies).map(([code, rate]) => ({
        code,
        rate: rate as number
      }));

      setCurrencies(currencyList.sort((a, b) => a.code.localeCompare(b.code)));
    } catch (err) {
      setError('Failed to load currencies. Please ensure the backend is running.');
      console.error(err);
    }
  };

  const convertCurrency = async () => {
    if (!amount || parseFloat(amount) <= 0) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/convert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromCurrency,
          to: toCurrency,
          amount: parseFloat(amount),
        }),
      });

      if (!response.ok) throw new Error('Conversion failed');

      const data: ConversionResponse = await response.json();
      setConvertedAmount(data.convertedAmount);
      setExchangeRate(data.rate);
    } catch (err) {
      setError('Conversion failed. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAmountChange = (value: string) => {
    // Allow only numbers and decimal point
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setAmount(value);
    }
  };

  const swapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className={`app ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
      {/* Animated background */}
      <div className="background-animation">
        <div className="grid-overlay"></div>
        <div className="floating-particles">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="particle" style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 10}s`
            }}></div>
          ))}
        </div>
      </div>

      <div className="container">
        {/* Theme Toggle */}
        <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
          {isDarkMode ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </button>

        <header className="header">
          <div className="logo-container">
            <div className="logo-icon">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="2" />
                <path d="M18 24h12M24 18v12" stroke="currentColor" strokeWidth="2" />
              </svg>
            </div>
            <h1 className="title">
              <span className="title-main">CURRENCY</span>
              <span className="title-sub">CONVERTER</span>
            </h1>
          </div>
          <p className="subtitle">Real-time exchange rates • Powered by AI</p>
        </header>

        <div className="converter-card">
          <div className="card-glow"></div>

          {error && (
            <div className="error-message">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </div>
          )}

          <div className="input-group">
            <label htmlFor="amount-input" className="label">
              <span className="label-text">Amount</span>
              <span className="label-line"></span>
            </label>
            <div className="input-wrapper">
              <input
                id="amount-input"
                type="text"
                className="amount-input"
                value={amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                placeholder="0.00"
              />
              <div className="input-border"></div>
            </div>
          </div>

          <div className="currency-row">
            <div className="currency-select-group">
              <label htmlFor="from-currency" className="label">
                <span className="label-text">From</span>
                <span className="label-line"></span>
              </label>
              <div className="select-wrapper">
                <select
                  id="from-currency"
                  className="currency-select"
                  value={fromCurrency}
                  onChange={(e) => setFromCurrency(e.target.value)}
                >
                  {currencies.map((currency) => (
                    <option key={currency.code} value={currency.code}>
                      {currency.code}
                    </option>
                  ))}
                </select>
                <div className="select-border"></div>
              </div>
            </div>

            <button
              className="swap-button"
              onClick={swapCurrencies}
              aria-label="Swap currencies"
            >
              <div className="swap-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M7 16V4M7 4L3 8M7 4L11 8M17 8V20M17 20L21 16M17 20L13 16" />
                </svg>
              </div>
              <div className="swap-glow"></div>
            </button>

            <div className="currency-select-group">
              <label htmlFor="to-currency" className="label">
                <span className="label-text">To</span>
                <span className="label-line"></span>
              </label>
              <div className="select-wrapper">
                <select
                  id="to-currency"
                  className="currency-select"
                  value={toCurrency}
                  onChange={(e) => setToCurrency(e.target.value)}
                >
                  {currencies.map((currency) => (
                    <option key={currency.code} value={currency.code}>
                      {currency.code}
                    </option>
                  ))}
                </select>
                <div className="select-border"></div>
              </div>
            </div>
          </div>

          {loading && (
            <div className="loading-container">
              <div className="loading-spinner">
                <div className="spinner-ring"></div>
                <div className="spinner-ring"></div>
                <div className="spinner-ring"></div>
              </div>
              <p className="loading-text">Processing...</p>
            </div>
          )}

          {!loading && convertedAmount !== null && (
            <div className="result-section">
              <div className="result-card">
                <div className="result-label">Converted Amount</div>
                <div className="result-amount">
                  <span className="amount-value">{convertedAmount.toFixed(2)}</span>
                  <span className="currency-code">{toCurrency}</span>
                </div>
                {exchangeRate && (
                  <div className="exchange-rate">
                    <div className="rate-indicator"></div>
                    <span>1 {fromCurrency} = {exchangeRate.toFixed(4)} {toCurrency}</span>
                  </div>
                )}
                <div className="result-glow"></div>
              </div>
            </div>
          )}
        </div>

        <footer className="footer">
          <div className="footer-content">
            <span className="footer-icon">⚡</span>
            <span>Powered by FreeCurrencyAPI</span>
            <span className="footer-separator">•</span>
            <span>Real-time rates updated hourly</span>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
