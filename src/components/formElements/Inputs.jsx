import { clsx } from 'clsx';
import { forwardRef } from 'react';

/**
 * @typedef {Object} InputProps
 * @property {string} [name] - The property name used by react hook form
 * @property {string} [type] - The type of input, text, password, etc
 * @property {string|boolean} [label] - The text of the accompanied label otherwise it will be the name of the input
 * @property {boolean} [required] - If the input is required in the form
 * @property {string|number} [value] - The value to preset the input to
 * @property {string} [placeholder] - The help text to display
 * @property {boolean} [left] - For input group rounding
 * @property {string|string[]} [className] - Custom css class names to append to the defaults
 * @property {boolean} [touched]
 * @property {string} [step]
 * @property {string} [min]
 * @property {string} [max]
 * @property {function} [onChange]
 * @property {function} [onBlur]
 */

/**
 * @type {React.ForwardRefExoticComponent<InputProps & React.RefAttributes<any>>}
 */
export const Input = forwardRef(
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
          step={type === 'number' ? step : null}
          min={type === 'number' ? min : null}
          max={type === 'number' ? max : null}
          defaultValue={value}
          placeholder={placeholder}
          onChange={onChange}
          onBlur={onBlur}
          ref={ref}
          className={classes}
          aria-required={required}
          aria-labelledby={label ? `label.${name}` : null}
        />
      </div>
    );
  },
);
Input.displayName = 'Input';

export const Label = ({ children, htmlFor, required, className }) => {
  return (
    <label id={`label.${htmlFor}`} htmlFor={htmlFor} className={className}>
      {children}
      {required && <span className="not-sr-only ml-0.5 text-rose-300">*</span>}
    </label>
  );
};
