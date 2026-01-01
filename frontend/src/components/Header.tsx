import React from 'react';

export const Header: React.FC = () => {
    return (
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
    );
};
