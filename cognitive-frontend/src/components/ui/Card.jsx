import { forwardRef } from 'react';

/**
 * 🎴 Card Component
 * 
 * کامپوننت کارت برای نمایش محتوا با استایل‌های مختلف
 */
export const Card = forwardRef(({ 
  children, 
  className = '', 
  variant = 'default',
  padding = 'default',
  hover = false,
  ...props 
}, ref) => {
  // انواع مختلف Card
  const variants = {
    default: 'bg-white border border-gray-200',
    elevated: 'bg-white shadow-md border border-gray-100',
    flat: 'bg-gray-50 border border-gray-200',
    primary: 'bg-primary-50 border border-primary-200',
    success: 'bg-green-50 border border-green-200',
    warning: 'bg-yellow-50 border border-yellow-200',
    danger: 'bg-red-50 border border-red-200',
  };

  // سایزهای padding
  const paddings = {
    none: '',
    sm: 'p-3',
    default: 'p-4',
    lg: 'p-6',
    xl: 'p-8',
  };

  // Hover effect
  const hoverClass = hover ? 'transition-shadow hover:shadow-lg cursor-pointer' : '';

  return (
    <div
      ref={ref}
      className={`
        rounded-lg
        ${variants[variant] || variants.default}
        ${paddings[padding] || paddings.default}
        ${hoverClass}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = 'Card';

/**
 * 📋 Card Header - برای هدر کارت
 */
export const CardHeader = ({ children, className = '', ...props }) => (
  <div className={`mb-4 ${className}`} {...props}>
    {children}
  </div>
);

/**
 * 📝 Card Title - برای عنوان کارت
 */
export const CardTitle = ({ children, className = '', ...props }) => (
  <h3 className={`text-xl font-semibold text-gray-900 ${className}`} {...props}>
    {children}
  </h3>
);

/**
 * 📄 Card Description - برای توضیحات
 */
export const CardDescription = ({ children, className = '', ...props }) => (
  <p className={`text-sm text-gray-600 mt-1 ${className}`} {...props}>
    {children}
  </p>
);

/**
 * 🎯 Card Content - برای محتوای اصلی
 */
export const CardContent = ({ children, className = '', ...props }) => (
  <div className={className} {...props}>
    {children}
  </div>
);

/**
 * 🔘 Card Footer - برای دکمه‌ها و اکشن‌ها
 */
export const CardFooter = ({ children, className = '', ...props }) => (
  <div className={`mt-4 pt-4 border-t border-gray-200 ${className}`} {...props}>
    {children}
  </div>
);
