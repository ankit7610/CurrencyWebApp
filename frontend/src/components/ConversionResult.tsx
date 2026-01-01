import React from 'react';

interface ConversionResultProps {
    convertedAmount: number;
    toCurrency: string;
    fromCurrency: string;
    exchangeRate: number | null;
}

export const ConversionResult: React.FC<ConversionResultProps> = ({
    convertedAmount,
    toCurrency,
    fromCurrency,
    exchangeRate
}) => {
    return (
        <div className="result-section">
            <div className="result-card">
                <div className="result-label">Converted Amount</div>
                <div className="result-amount">
                    <span className="amount-value">{convertedAmount.toFixed(2)}</span>
                    <span className="currency-code">{toCurrency}</span>
                </div>
                {exchangeRate && (
                    <div className="exchange-rate">
                        <span>1 {fromCurrency} = {exchangeRate.toFixed(4)} {toCurrency}</span>
                    </div>
                )}
            </div>
        </div>
    );
};
