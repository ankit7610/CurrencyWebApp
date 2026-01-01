import { useState, useEffect, useCallback } from 'react';
import './App.css';
import { cacheService } from './services/CacheService';
import { Header } from './components/Header';
import { CurrencyInput } from './components/CurrencyInput';
import { CurrencySelect, type Currency } from './components/CurrencySelect';
import { SwapButton } from './components/SwapButton';
import { ConversionResult } from './components/ConversionResult';

interface ConversionResponse {
  from: string;
  to: string;
  amount: number;
  convertedAmount: number;
  rate: number;
}

interface CurrenciesApiResponse {
  currencies: Record<string, number>;
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
  const [lastCallTime, setLastCallTime] = useState<number>(0);

  const THROTTLE_MS = 500;
  const API_BASE_URL = 'http://localhost:8080/api';

  const processCurrencyData = useCallback((data: CurrenciesApiResponse) => {
    const currencyList: Currency[] = Object.entries(data.currencies).map(([code, rate]) => ({
      code,
      rate: rate as number
    }));
    setCurrencies(currencyList.sort((a, b) => a.code.localeCompare(b.code)));
  }, []);

  const fetchCurrencies = useCallback(async () => {
    try {
      const url = `${API_BASE_URL}/currencies`;
      const cachedData = await cacheService.getResponse<CurrenciesApiResponse>(url);

      if (cachedData) {
        processCurrencyData(cachedData);
        return;
      }

      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch currencies');

      const data = await response.json();
      await cacheService.saveResponse(url, data);
      processCurrencyData(data);
    } catch (err) {
      setError('Failed to load currencies. Please ensure the backend is running.');
      console.error(err);
    }
  }, [API_BASE_URL, processCurrencyData]);

  const convertCurrency = useCallback(async () => {
    if (!amount || parseFloat(amount) <= 0) return;

    const now = Date.now();
    if (now - lastCallTime < THROTTLE_MS) return;
    setLastCallTime(now);

    setLoading(true);
    setError('');

    try {
      const url = `${API_BASE_URL}/convert`;
      const body = {
        from: fromCurrency,
        to: toCurrency,
        amount: parseFloat(amount),
      };

      const cachedData = await cacheService.getResponse<ConversionResponse>(url, body);
      if (cachedData) {
        setConvertedAmount(cachedData.convertedAmount);
        setExchangeRate(cachedData.rate);
        setLoading(false);
        return;
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error('Conversion failed');

      const data: ConversionResponse = await response.json();
      await cacheService.saveResponse(url, data, body);

      setConvertedAmount(data.convertedAmount);
      setExchangeRate(data.rate);
    } catch (err) {
      setError('Conversion failed. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [amount, lastCallTime, API_BASE_URL, fromCurrency, toCurrency, THROTTLE_MS]);

  useEffect(() => {
    fetchCurrencies();
  }, [fetchCurrencies]);

  useEffect(() => {
    if (amount && parseFloat(amount) > 0) {
      convertCurrency();
    }
  }, [fromCurrency, toCurrency, amount, convertCurrency]);

  const handleAmountChange = (value: string) => {
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setAmount(value);
    }
  };

  const swapCurrencies = () => {
    const temp = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(temp);
  };

  return (
    <div className="app">
      <div className="container">
        <Header />

        <main className="converter-card">
          {error && <div className="error-message">{error}</div>}

          <CurrencyInput amount={amount} onAmountChange={handleAmountChange} />

          <div className="currency-row">
            <CurrencySelect
              id="from-currency"
              label="From"
              value={fromCurrency}
              currencies={currencies}
              onChange={setFromCurrency}
            />

            <div className="swap-container">
              <SwapButton onSwap={swapCurrencies} />
            </div>

            <CurrencySelect
              id="to-currency"
              label="To"
              value={toCurrency}
              currencies={currencies}
              onChange={setToCurrency}
            />
          </div>

          {loading && (
            <div className="loading-container">
              <span>Updating rates...</span>
            </div>
          )}

          {!loading && convertedAmount !== null && (
            <ConversionResult
              convertedAmount={convertedAmount}
              toCurrency={toCurrency}
              fromCurrency={fromCurrency}
              exchangeRate={exchangeRate}
            />
          )}
        </main>

        <footer className="footer">
          <div className="footer-content">
            <span>Powered by FreeCurrencyAPI</span>
            <span>•</span>
            <span>Hourly Updates</span>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
