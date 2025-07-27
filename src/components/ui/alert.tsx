interface AlertProps {
  children: React.ReactNode;
  variant?: 'info' | 'success' | 'warning' | 'error';
  className?: string;
}

export function Alert({ children, variant = 'info', className = '' }: AlertProps) {
  const variantClasses = {
    info: 'alert-info',
    success: 'alert-success', 
    warning: 'alert-warning',
    error: 'alert-error'
  };

  return (
    <div className={`alert ${variantClasses[variant]} ${className}`}>
      {children}
    </div>
  );
}