import React, { useState, useRef, useEffect, useMemo } from 'react';
import { type Currency } from './CurrencySelect';

interface CurrencyDropdownProps {
    label: string;
    value: string;
    currencies: Currency[];
    onChange: (value: string) => void;
    id: string;
}

export const CurrencyDropdown: React.FC<CurrencyDropdownProps> = ({
    label,
    value,
    currencies,
    onChange,
    id
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);

    const filteredCurrencies = useMemo(() => {
        return currencies.filter(c =>
            c.code.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [currencies, searchTerm]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getFlagUrl = (code: string) => {
        // Basic mapping for common currencies where code doesn't match country
        const mapping: Record<string, string> = {
            'EUR': 'eu',
            'USD': 'us',
            'GBP': 'gb',
            'JPY': 'jp',
            'AUD': 'au',
            'CAD': 'ca',
            'CHF': 'ch',
            'CNY': 'cn',
            'INR': 'in',
            'BRL': 'br',
            'RUB': 'ru',
            'ZAR': 'za',
            'KRW': 'kr',
            'SGD': 'sg',
            'MXN': 'mx',
            'NZD': 'nz',
            'HKD': 'hk',
            'IDR': 'id',
            'TRY': 'tr',
            'SEK': 'se',
            'NOK': 'no',
            'DKK': 'dk',
            'PLN': 'pl',
            'ILS': 'il',
            'PHP': 'ph',
            'AED': 'ae',
            'SAR': 'sa',
            'THB': 'th',
            'MYR': 'my',
            'HUF': 'hu',
            'CZK': 'cz',
            'KWD': 'kw',
            'BGN': 'bg',
            'RON': 'ro',
            'HRK': 'hr',
            'ISK': 'is',
        };

        const countryCode = mapping[code] || code.substring(0, 2).toLowerCase();
        return `https://flagcdn.com/w40/${countryCode}.png`;
    };

    const handleSelect = (code: string) => {
        onChange(code);
        setIsOpen(false);
        setSearchTerm('');
    };

    return (
        <div className="currency-select-group" ref={dropdownRef}>
            <label htmlFor={id} className="label">
                <span className="label-text">{label}</span>
            </label>
            <div className="custom-select-wrapper">
                <div
                    className={`custom-select-trigger ${isOpen ? 'open' : ''}`}
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <div className="selected-value">
                        <img
                            src={getFlagUrl(value)}
                            alt={value}
                            className="currency-flag"
                            onError={(e) => (e.currentTarget.style.display = 'none')}
                        />
                        <span>{value}</span>
                    </div>
                    <div className="arrow"></div>
                </div>

                {isOpen && (
                    <div className="custom-dropdown">
                        <div className="search-box">
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                autoFocus
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                        <div className="options-list">
                            {filteredCurrencies.length > 0 ? (
                                filteredCurrencies.map((currency) => (
                                    <div
                                        key={currency.code}
                                        className={`option-item ${currency.code === value ? 'selected' : ''}`}
                                        onClick={() => handleSelect(currency.code)}
                                    >
                                        <img
                                            src={getFlagUrl(currency.code)}
                                            alt={currency.code}
                                            className="currency-flag"
                                            onError={(e) => (e.currentTarget.style.display = 'none')}
                                        />
                                        <span>{currency.code}</span>
                                    </div>
                                ))
                            ) : (
                                <div className="no-results">No currency found</div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
