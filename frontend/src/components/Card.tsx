import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
}

const Card: React.FC<CardProps> = ({ children, className = '', style }) => {
    return (
        <div
            className={`card ${className}`}
            style={{
                border: '1px solid #E0E0E0',
                borderRadius: '8px',
                overflow: 'hidden',
                backgroundColor: 'var(--white)',
                ...style
            }}
        >
            {children}
        </div>
    );
};

export default Card;
