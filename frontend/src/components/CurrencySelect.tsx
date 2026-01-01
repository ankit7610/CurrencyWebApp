import React, { type ChangeEvent } from 'react';

export interface Currency {
    code: string;
    rate: number;
}

interface CurrencySelectProps {
    label: string;
    value: string;
    currencies: Currency[];
    onChange: (value: string) => void;
    id: string;
}

export const CurrencySelect: React.FC<CurrencySelectProps> = ({
    label,
    value,
    currencies,
    onChange,
    id
}) => {
    const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
        onChange(e.target.value);
    };

    return (
        <div className="currency-select-group">
            <label htmlFor={id} className="label">
                <span className="label-text">{label}</span>
            </label>
            <div className="select-wrapper">
                <select
                    id={id}
                    className="currency-select"
                    value={value}
                    onChange={handleChange}
                >
                    {currencies.map((currency) => (
                        <option key={currency.code} value={currency.code}>
                            {currency.code}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
};
