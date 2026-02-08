import { createContext, forwardRef, useContext, useId } from 'react';
import { FormProvider, useFormContext, Controller } from 'react-hook-form';
import { cn } from '@/lib/utils';

/**
 * 📝 Form Components - مجموعه کامل کامپوننت‌های فرم
 */

// Context برای فرم
const FormFieldContext = createContext({});
const FormItemContext = createContext({});

// Form wrapper
export const Form = ({ children, ...props }) => {
  return <FormProvider {...props}>{children}</FormProvider>;
};

// FormField - برای کنترل فیلدها
export const FormField = ({ name, control, render, ...props }) => {
  return (
    <FormFieldContext.Provider value={{ name }}>
      <Controller
        name={name}
        control={control}
        render={({ field, fieldState, formState }) => (
          <FormItemContext.Provider
            value={{
              id: useId(),
              name,
              formItemId: `${name}-form-item`,
              formDescriptionId: `${name}-form-item-description`,
              formMessageId: `${name}-form-item-message`,
            }}
          >
            {render({ field, fieldState, formState })}
          </FormItemContext.Provider>
        )}
        {...props}
      />
    </FormFieldContext.Provider>
  );
};

// FormItem - کانتینر فیلد
export const FormItem = ({ className, ...props }) => {
  const id = useContext(FormItemContext);
  return <div className={cn('space-y-2', className)} {...props} />;
};

// FormLabel - لیبل فیلد
export const FormLabel = ({ className, ...props }) => {
  const { formItemId } = useContext(FormItemContext);
  return (
    <label
      className={cn(
        'text-sm font-medium text-gray-700 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
        className
      )}
      htmlFor={formItemId}
      {...props}
    />
  );
};

// FormControl - کنترل فیلد
export const FormControl = ({ ...props }) => {
  const { formItemId, formDescriptionId, formMessageId } = useContext(FormItemContext);
  return (
    <div
      id={formItemId}
      aria-describedby={`${formDescriptionId} ${formMessageId}`}
      {...props}
    />
  );
};

// FormDescription - توضیحات فیلد
export const FormDescription = ({ className, ...props }) => {
  const { formDescriptionId } = useContext(FormItemContext);
  return (
    <p
      id={formDescriptionId}
      className={cn('text-sm text-gray-500', className)}
      {...props}
    />
  );
};

// FormMessage - پیام خطا
export const FormMessage = ({ className, children, ...props }) => {
  const { formMessageId } = useContext(FormItemContext);
  const { name } = useContext(FormFieldContext);
  const formContext = useFormContext();
  const error = formContext?.formState?.errors?.[name];
  const body = error ? String(error?.message) : children;

  if (!body) return null;

  return (
    <p
      id={formMessageId}
      className={cn('text-sm font-medium text-red-500', className)}
      {...props}
    >
      {body}
    </p>
  );
};

/**
 * ✅ Input Component
 */
export const Input = forwardRef(({ className, type = 'text', ...props }, ref) => {
  return (
    <input
      ref={ref}
      type={type}
      className={cn(
        'flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm',
        'placeholder:text-gray-400',
        'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    />
  );
});
Input.displayName = 'Input';

/**
 * 📝 Textarea Component
 */
export const Textarea = forwardRef(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn(
        'flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm',
        'placeholder:text-gray-400',
        'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    />
  );
});
Textarea.displayName = 'Textarea';

/**
 * 📋 Select Component
 */
export const Select = forwardRef(({ className, children, ...props }, ref) => {
  return (
    <select
      ref={ref}
      className={cn(
        'flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm',
        'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
});
Select.displayName = 'Select';

/**
 * ☑️ Checkbox Component
 */
export const Checkbox = forwardRef(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      type="checkbox"
      className={cn(
        'h-4 w-4 rounded border-gray-300 text-primary-600',
        'focus:ring-2 focus:ring-primary-500',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    />
  );
});
Checkbox.displayName = 'Checkbox';

/**
 * 🔘 Radio Component
 */
export const Radio = forwardRef(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      type="radio"
      className={cn(
        'h-4 w-4 border-gray-300 text-primary-600',
        'focus:ring-2 focus:ring-primary-500',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    />
  );
});
Radio.displayName = 'Radio';

/**
 * 🔄 Switch Component (Toggle)
 */
export const Switch = ({ className, checked, onChange, ...props }) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange?.(!checked)}
      className={cn(
        'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
        checked ? 'bg-primary-600' : 'bg-gray-200',
        className
      )}
      {...props}
    >
      <span
        className={cn(
          'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
          checked ? 'translate-x-6' : 'translate-x-1'
        )}
      />
    </button>
  );
};
