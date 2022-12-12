import clsx from 'clsx';
import PropTypes from 'prop-types';
import { ErrorMessage } from '@hookform/error-message';
import ErrorMessageTag from '../pageElements/ErrorMessage.jsx';

export const LimitedTextarea = ({
  rows,
  placeholder,
  value,
  maxLength,
  field,
  errors,
  className,
  disabled,
}) => {
  const { limit, remaining } = useMaxLength({
    value: field.value ?? value,
    limit: maxLength,
  });

  return (
    <div className="relative flex grow flex-col">
      <textarea
        disabled={disabled}
        id={field.name}
        rows={rows}
        type="textarea"
        maxLength={limit}
        placeholder={placeholder}
        className={clsx(
          'rounded border border-slate-400 px-2 text-sm text-slate-800 placeholder:text-sm placeholder:text-slate-600',
          className
        )}
        {...field}
        value={field.value ?? value}
      ></textarea>
      <CharactersRemaining limit={limit} remaining={remaining} />
      <ErrorMessage errors={errors} name={field.name} as={ErrorMessageTag} />
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
  maxLength: PropTypes.number,
  field: PropTypes.object,
  errors: PropTypes.object,
  className: PropTypes.string,
  disabled: PropTypes.bool,
};

LimitedTextarea.defaultProps = {
  name: null,
  placeholder: null,
  value: '',
  rows: 3,
  limit: 500,
  inputRef: null,
  onChange: undefined,
  disabled: false,
};

const useMaxLength = ({ value, limit }) => {
  return {
    limit,
    remaining: limit - (value?.length || 0),
  };
};

export const CharactersRemaining = ({ remaining, limit }) => {
  if (remaining === limit) {
    return null;
  }

  const percentage = (limit - remaining) / limit;

  return (
    <span
      className={clsx('absolute bottom-0 right-3', {
        'text-xs text-slate-500': percentage >= 0 && percentage < 0.8,
        'text-xs text-amber-600': percentage >= 0.8 && percentage < 0.9,
        'border border-red-600 bg-white p-2 text-lg font-black text-red-600':
          percentage >= 0.9,
      })}
    >
      {remaining} characters left
    </span>
  );
};

CharactersRemaining.propTypes = {
  remaining: PropTypes.number.isRequired,
  limit: PropTypes.number.isRequired,
};
