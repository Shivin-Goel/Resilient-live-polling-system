import React from 'react';

const Header: React.FC = () => {
    return (
        <div className="flex justify-center mb-4">
            <div
                style={{
                    backgroundColor: 'var(--primary-purple)',
                    color: 'var(--white)',
                    padding: '4px 16px',
                    borderRadius: '20px',
                    fontSize: '14px',
                    fontWeight: 600,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px'
                }}
            >
                <span>✨</span> Intervue Poll
            </div>
        </div>
    );
};

export default Header;
