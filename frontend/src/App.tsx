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

  return (
    <div className="app">
      <div className="background-gradient"></div>
      <div className="container">
        <header className="header">
          <h1 className="title">Currency Converter</h1>
          <p className="subtitle">Real-time exchange rates at your fingertips</p>
        </header>

        <div className="converter-card">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="input-group">
            <label htmlFor="amount-input" className="label">Amount</label>
            <input
              id="amount-input"
              type="text"
              className="amount-input"
              value={amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              placeholder="Enter amount"
            />
          </div>

          <div className="currency-row">
            <div className="currency-select-group">
              <label htmlFor="from-currency" className="label">From</label>
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
            </div>

            <button
              className="swap-button"
              onClick={swapCurrencies}
              aria-label="Swap currencies"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M7 16V4M7 4L3 8M7 4L11 8M17 8V20M17 20L21 16M17 20L13 16" />
              </svg>
            </button>

            <div className="currency-select-group">
              <label htmlFor="to-currency" className="label">To</label>
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
            </div>
          </div>

          {loading && (
            <div className="loading-spinner">
              <div className="spinner"></div>
            </div>
          )}

          {!loading && convertedAmount !== null && (
            <div className="result-section">
              <div className="result-card">
                <div className="result-amount">
                  {convertedAmount.toFixed(2)} <span className="currency-code">{toCurrency}</span>
                </div>
                {exchangeRate && (
                  <div className="exchange-rate">
                    1 {fromCurrency} = {exchangeRate.toFixed(4)} {toCurrency}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <footer className="footer">
          <p>Powered by FreeCurrencyAPI • Real-time rates updated hourly</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
