import clsx from 'clsx';
import PropTypes from 'prop-types';
import { forwardRef } from 'react';

export const Input = forwardRef(
  (
    {
      name,
      type,
      value,
      label,
      required,
      placeholder,
      left,
      className,
      step,
      min,
      max,
      onChange,
      onBlur,
    },
    ref
  ) => {
    const classes = clsx(
      'border border-slate-400 bg-white py-2 px-3 text-slate-800 placeholder:text-slate-400 shadow-sm transition-all duration-200 ease-in-out focus:border-sky-500 focus:outline-none focus:ring focus:ring-sky-600 focus:ring-opacity-50 disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm',
      {
        'rounded-md': !left,
        'rounded-l-md': left,
      },
      className
    );

    return (
      <div className="flex flex-col gap-[2px]">
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
  }
);
Input.displayName = 'Input';
Input.propTypes = {
  /**
   * The property name used by react hook form
   */
  name: PropTypes.string,
  /**
   * The type of input, text, password, etc
   */
  type: PropTypes.string,
  /**
   * The text of the accompanied label otherwise it will be the name of the input
   */
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  /**
   * If the input is required in the form
   */
  required: PropTypes.bool,
  /**
   * The value to preset the input to
   */
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  /**
   * The help text to display
   */
  placeholder: PropTypes.string,
  /**
   * For input group rounding
   */
  left: PropTypes.bool,
  /**
   * Custom css class names to append to the defaults
   */
  className: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string),
  ]),
  touched: PropTypes.bool,
  step: PropTypes.string,
  min: PropTypes.string,
  max: PropTypes.string,
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
};

Input.defaultProps = {
  name: null,
  type: 'text',
  label: undefined,
  required: false,
  value: null,
  placeholder: null,
  left: false,
  className: null,
  touched: false,
  step: '1',
};

export const Label = ({ children, htmlFor, required, className }) => {
  return (
    <label id={`label.${htmlFor}`} htmlFor={htmlFor} className={className}>
      {children}
      {required && <span className="not-sr-only ml-0.5 text-rose-300">*</span>}
    </label>
  );
};
Label.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  htmlFor: PropTypes.string,
  required: PropTypes.bool,
};
