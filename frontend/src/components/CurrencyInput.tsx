import React, { type ChangeEvent } from 'react';

interface CurrencyInputProps {
    amount: string;
    onAmountChange: (value: string) => void;
}

export const CurrencyInput: React.FC<CurrencyInputProps> = ({ amount, onAmountChange }) => {
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        onAmountChange(e.target.value);
    };

    return (
        <div className="input-group">
            <label htmlFor="amount-input" className="label">
                <span className="label-text">Amount</span>
            </label>
            <div className="input-wrapper">
                <input
                    id="amount-input"
                    type="text"
                    className="amount-input"
                    value={amount}
                    onChange={handleChange}
                    placeholder="0.00"
                />
            </div>
        </div>
    );
};
