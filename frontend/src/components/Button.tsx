import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    fullWidth = false,
    className = '',
    ...props
}) => {
    const baseStyle: React.CSSProperties = {
        padding: '12px 24px',
        borderRadius: '40px',
        fontWeight: 600,
        fontSize: '14px',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: fullWidth ? '100%' : 'auto',
    };

    const variants: Record<string, React.CSSProperties> = {
        primary: {
            backgroundColor: 'var(--secondary-purple)',
            color: 'var(--white)',
        },
        secondary: {
            backgroundColor: 'var(--dark-purple)',
            color: 'var(--white)',
        },
        outline: {
            backgroundColor: 'transparent',
            border: '1px solid var(--primary-purple)',
            color: 'var(--primary-purple)',
        },
        ghost: {
            backgroundColor: 'transparent',
            color: 'var(--primary-purple)',
        }
    };

    return (
        <button
            style={{ ...baseStyle, ...variants[variant] }}
            className={`btn-${variant} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;
