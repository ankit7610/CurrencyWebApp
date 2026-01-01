import React from 'react';

interface SwapButtonProps {
    onSwap: () => void;
}

export const SwapButton: React.FC<SwapButtonProps> = ({ onSwap }) => {
    return (
        <button
            className="swap-button"
            onClick={onSwap}
            aria-label="Swap currencies"
        >
            <div className="swap-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M7 16V4M7 4L3 8M7 4L11 8M17 8V20M17 20L21 16M17 20L13 16" />
                </svg>
            </div>
        </button>
    );
};
