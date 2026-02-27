import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    suffix?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({ label, error, className = '', suffix, ...props }, ref) => {
    return (
        <div className={`input-wrapper flex-col ${className}`} style={{ width: '100%' }}>
            {label && <label style={{ marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: 'var(--dark-gray)' }}>{label}</label>}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                    ref={ref}
                    style={{
                        borderColor: error ? 'var(--error)' : '#E0E0E0',
                        paddingRight: suffix ? '40px' : '16px'
                    }}
                    {...props}
                />
                {suffix && (
                    <div style={{ position: 'absolute', right: '12px', color: 'var(--medium-gray)' }}>
                        {suffix}
                    </div>
                )}
            </div>
            {error && <span style={{ color: 'var(--error)', fontSize: '12px', marginTop: '4px' }}>{error}</span>}
        </div>
    );
});

Input.displayName = 'Input';

export default Input;
