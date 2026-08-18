import { clsx } from 'clsx';
import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';

type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'className' | 'value'> & {
  className?: string | string[];
  label?: ReactNode | false;
  left?: boolean;
  value?: string | number;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      name,
      type = 'text',
      value,
      label,
      required = false,
      placeholder,
      left = false,
      className,
      step = '1',
      min,
      max,
      onChange,
      onBlur,
    },
    ref,
  ) => {
    const classes = clsx(
      'border border-slate-400 bg-white px-3 py-2 text-slate-800 shadow-xs transition-all duration-200 ease-in-out placeholder:text-slate-400 focus:border-sky-500 focus:ring-3 focus:ring-sky-600/50 focus:outline-hidden disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm',
      {
        'rounded-md': !left,
        'rounded-l-md': left,
      },
      className,
    );

    return (
      <div className="flex flex-col gap-0.5">
        {label !== false && (
          <Label htmlFor={name} required={required} className="font-semibold">
            {label ?? name}
          </Label>
        )}
        <input
          name={name}
          id={name}
          type={type}
          step={type === 'number' ? step : undefined}
          min={type === 'number' ? min : undefined}
          max={type === 'number' ? max : undefined}
          defaultValue={value}
          placeholder={placeholder}
          onChange={onChange}
          onBlur={onBlur}
          ref={ref}
          className={classes}
          aria-required={required}
          aria-labelledby={label ? `label.${name}` : undefined}
        />
      </div>
    );
  },
);
Input.displayName = 'Input';

type LabelProps = {
  children: ReactNode;
  className?: string;
  htmlFor?: string;
  required?: boolean;
};

export const Label = ({ children, htmlFor, required, className }: LabelProps) => {
  return (
    <label id={`label.${htmlFor}`} htmlFor={htmlFor} className={className}>
      {children}
      {required && <span className="not-sr-only ml-0.5 text-rose-300">*</span>}
    </label>
  );
};
