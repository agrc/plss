import clsx from 'clsx';
import PropTypes from 'prop-types';

export const Select = ({
  name,
  placeholder,
  options,
  inputRef,
  className,
  right,
}) => {
  const { onChange, ref, name: name2 } = inputRef(name);

  return (
    <select
      name={name2}
      defaultValue=""
      className={clsx(
        'w-full border border-slate-400 bg-white py-2 px-3 text-slate-800 placeholder-slate-400 shadow-sm transition-all duration-200 ease-in-out focus:border-indigo-500 focus:outline-none focus:ring focus:ring-indigo-600 focus:ring-opacity-50 disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm',
        {
          'rounded-md': !right,
          'rounded-r-md': right,
        },
        className
      )}
      ref={ref}
      onChange={(event) => {
        onChange(event);
      }}
    >
      {placeholder ? (
        <option
          disabled
          hidden
          className="text-red-400 placeholder-yellow-400 disabled:text-yellow-400"
          value=""
        >
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
    PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({ label: PropTypes.string, value: PropTypes.string }),
    ])
  ),
  /**
   * For input group rounding
   */
  right: PropTypes.bool,
  /**
   * The ref property for use with registering with react hook form
   */
  inputRef: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
  touched: PropTypes.bool,
  className: PropTypes.string,
};

Select.defaultProps = {
  name: null,
  placeholder: null,
  options: [],
  right: false,
  inputRef: null,
};
