import React from 'react';

interface ConversionResultProps {
    convertedAmount: number | null | undefined;
    toCurrency: string;
    fromCurrency: string;
    exchangeRate: number | null | undefined;
}

export const ConversionResult: React.FC<ConversionResultProps> = ({
    convertedAmount,
    toCurrency,
    fromCurrency,
    exchangeRate
}) => {
    if (convertedAmount === null || convertedAmount === undefined) {
        return null;
    }

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
