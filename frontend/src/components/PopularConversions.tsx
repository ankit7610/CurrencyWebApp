import React from 'react';

interface PopularConversionsProps {
    onSelect: (from: string, to: string) => void;
    baseCurrency: string;
}

export const PopularConversions: React.FC<PopularConversionsProps> = ({ onSelect, baseCurrency }) => {
    const commonPairs = [
        { from: baseCurrency, to: baseCurrency === 'EUR' ? 'USD' : 'EUR' },
        { from: baseCurrency, to: baseCurrency === 'GBP' ? 'USD' : 'GBP' },
        { from: baseCurrency, to: baseCurrency === 'JPY' ? 'USD' : 'JPY' },
        { from: 'USD', to: 'EUR' },
        { from: 'EUR', to: 'GBP' },
        { from: 'USD', to: 'JPY' },
    ].filter((pair, index, self) =>
        index === self.findIndex((p) => p.from === pair.from && p.to === pair.to)
    ).slice(0, 4);

    return (
        <div className="popular-conversions">
            <h3 className="section-title">Popular Conversions</h3>
            <div className="pairs-grid">
                {commonPairs.map((pair, index) => (
                    <button
                        key={index}
                        className="pair-chip"
                        onClick={() => onSelect(pair.from, pair.to)}
                    >
                        <span className="pair-text">{pair.from} → {pair.to}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};
