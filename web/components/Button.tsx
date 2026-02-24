import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
  href?: string;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  onClick,
  href,
}) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 border-2';
  
  const variantClasses = {
    primary: 'bg-blue-700 text-white hover:bg-blue-800',
    secondary: 'bg-blue-100 text-blue-900 hover:bg-blue-200',
    outline: 'bg-transparent border border-blue-700 text-blue-700 hover:bg-blue-50',
  };
  
  const sizeClasses = {
    sm: 'text-sm px-4 py-1.5',
    md: 'text-base px-6 py-2',
    lg: 'text-lg px-8 py-3',
  };
  
  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;
  
  if (href) {
    return (
      <a href={href} className={classes} onClick={onClick} style={{borderColor: '#ed7c30'}}>
        {children}
      </a>
    );
  }
  
  return (
    <button className={classes} onClick={onClick} style={{borderColor: '#ed7c30'}}>
      {children}
    </button>
  );
};

export default Button;