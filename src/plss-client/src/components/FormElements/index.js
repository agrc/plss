import clsx from 'clsx';
import PropTypes from 'prop-types';
import * as React from 'react';

export const Input = ({ name, type, value, placeholder, inputRef, left, className, touched }) => {
  const classes = clsx(
    'block w-full py-2 pl-3 pr-10 text-black placeholder-gray-400 transition duration-100 ease-in-out bg-white shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none focus:ring-opacity-50 sm:text-sm',
    {
      rounded: !left,
      'rounded-l': left,
      'border border-gray-300': touched,
      'border-2 border-yellow-200': !touched,
    },
    className
  );

  return (
    <input name={name} type={type} defaultValue={value} placeholder={placeholder} ref={inputRef} className={classes} />
  );
};

Input.propTypes = {
  /**
   * The property name used by react hook form
   */
  name: PropTypes.string,
  /**
   * The value to preset the input to
   */
  value: PropTypes.string,
  /**
   * The help text to display
   */
  placeholder: PropTypes.string,
  /**
   * The ref property for use with registering with react hook form
   */
  inputRef: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
  /**
   * For input group rounding
   */
  left: PropTypes.bool,
  /**
   * Custom css class names to append to the defaults
   */
  className: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
};

Input.defaultProps = {
  name: null,
  value: null,
  placeholder: null,
  inputRef: null,
  left: false,
  className: null,
};

export const Textarea = ({ name, onChange, limit, placeholder, inputRef, rows, value }) => (
  <textarea
    name={name}
    ref={inputRef}
    maxLength={limit}
    placeholder={placeholder}
    rows={rows}
    value={value}
    onChange={onChange}
    className="block w-full px-3 py-2 text-sm leading-tight text-gray-800 placeholder-gray-400 transition duration-100 ease-in-out bg-white border border-gray-300 rounded shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none focus:ring-opacity-50"
  ></textarea>
);

export const LimitedTextarea = ({ name, rows, placeholder, value, limit, onChange, inputRef, touched }) => {
  const [length, setLength] = React.useState(value?.length || 0);
  let change = onChange ? onChange : (event) => setLength(event.target.value.length);

  const classes = clsx(
    'block w-full px-3 py-2 text-sm leading-tight text-gray-800 placeholder-gray-400 transition duration-100 ease-in-out bg-white rounded shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none focus:ring-opacity-50',
    {
      'border border-gray-300': touched,
      'border-2 border-yellow-200': !touched,
    }
  );
  return (
    <div className="flex flex-col">
      <textarea
        name={name}
        rows={rows}
        defaultValue={value}
        ref={inputRef}
        maxLength={limit}
        placeholder={placeholder}
        className={classes}
        onChange={change}
      ></textarea>
      {length > 0 && <span className="self-end text-xs text-gray-400">{limit - length} characters left</span>}
    </div>
  );
};

LimitedTextarea.propTypes = {
  /**
   * The property name used by react hook form
   */
  name: PropTypes.string,
  /**
   * The help text to display
   */
  placeholder: PropTypes.string,
  /**
   * The value to preset the input to
   */
  value: PropTypes.string,
  /**
   * The number of rows to have in the textarea
   */
  rows: PropTypes.string,
  /**
   * The character count limit
   */
  limit: PropTypes.number.isRequired,
  /**
   * The ref property for use with registering with react hook form
   */
  inputRef: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
  /**
   * The function to execute when the text area value changes
   */
  onChange: PropTypes.func,
};

LimitedTextarea.defaultProps = {
  name: null,
  placeholder: null,
  value: '',
  rows: 3,
  limit: 500,
  inputRef: null,
  onChange: undefined,
};

export const Button = ({ label, name, type, primary, secondary, dark, inputRef, onClick, buttonGroup }) => {
  const base =
    'block px-4 py-2 transition duration-100 ease-in-out shadow-sm border border-transparent focus:ring-2 focus:outline-none focus:ring-opacity-50 disabled:opacity-50';

  const primaryClasses = 'text-white bg-indigo-500 hover:bg-indigo-600 focus:border-indigo-500 focus:ring-indigo-500';
  const secondaryClasses = 'text-black bg-yellow-400 hover:bg-yellow-600 focus:border-yellow-400 focus:ring-yellow-400';
  const darkClasses = 'text-white bg-gray-500 hover:bg-gray-700 focus:border-gray-700 focus:ring-gray-700';

  const noButtonGroup = 'rounded';
  const buttonGroupLeft = 'rounded-l';
  const buttonGroupRight = 'rounded-r';

  const classes = clsx(
    base,
    primary && primaryClasses,
    secondary && secondaryClasses,
    dark && darkClasses,
    !buttonGroup && noButtonGroup,
    buttonGroup?.left && buttonGroupLeft,
    buttonGroup?.right && buttonGroupRight
  );

  return (
    <button type={type} name={name} ref={inputRef} onClick={onClick} className={classes}>
      {label}
    </button>
  );
};

Button.propTypes = {
  /**
   * The property name used by react hook form
   */
  name: PropTypes.string,
  /**
   * The label to display on the button
   */
  label: PropTypes.string.isRequired,
  /**
   * The primary color scheme for the button
   */
  primary: PropTypes.bool,
  /**
   * The primary color scheme for the button
   */
  secondary: PropTypes.bool,
  /**
   * The property name used by react hook form
   */
  type: PropTypes.oneOfType(['button', 'submit', 'reset']),
  /**
   * The ref property for use with registering with react hook form
   */
  inputRef: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
  /**
   * The function to execute when the button is clicked
   */
  onClick: PropTypes.func,
};

Button.defaultProps = {
  name: null,
  label: '',
  type: 'button',
  primary: null,
  secondary: null,
  inputRef: null,
  onClick: undefined,
};

export const Select = ({ name, placeholder, options, inputRef, className, right, touched }) => {
  const classes = clsx(
    'block w-full py-2 pl-3 pr-10 text-black placeholder-gray-400 transition duration-100 ease-in-out bg-white shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-opacity-50 sm:text-sm',
    {
      rounded: !right,
      'rounded-r': right,
      'border border-gray-300': touched,
      'border-2 border-yellow-200': !touched,
    },
    className
  );

  return (
    <select name={name} defaultValue="" className={classes} ref={inputRef}>
      {placeholder ? (
        <option disabled hidden className="placeholder-gray-400" value="">
          {placeholder}
        </option>
      ) : null}
      {options?.map((option, index) => (
        <option value={option?.value ?? option} key={index}>
          {option?.label ?? option}
        </option>
      ))}
    </select>
  );
};

Select.propTypes = {
  /**
   * The property name used by react hook form
   */
  name: PropTypes.string,
  /**
   * The help text to display
   */
  placeholder: PropTypes.string,
  /**
   * The options to place inside the select
   */
  options: PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.string, PropTypes.shape({ label: PropTypes.string, value: PropTypes.string })])
  ),
  /**
   * For input group rounding
   */
  right: PropTypes.bool,
  /**
   * The ref property for use with registering with react hook form
   */
  inputRef: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
};

Select.defaultProps = {
  name: null,
  placeholder: null,
  options: [],
  right: false,
  inputRef: null,
};
