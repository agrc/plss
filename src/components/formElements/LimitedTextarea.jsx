import { ErrorMessage } from '@hookform/error-message';
import { clsx } from 'clsx';
import ErrorMessageTag from '../pageElements/ErrorMessage.jsx';

/**
 * @typedef {Object} LimitedTextareaProps
 * @property {string} [name] - The property name used by react hook form
 * @property {string} [placeholder] - The help text to display
 * @property {string} [value] - The value to preset the input to
 * @property {string} [rows] - The number of rows to have in the textarea
 * @property {number} limit - The character count limit
 * @property {Object|function} [inputRef] - The ref property for use with registering with react hook form
 * @property {function} [onChange] - The function to execute when the text area value changes
 * @property {number} [maxLength]
 * @property {Object} [field]
 * @property {Object} [errors]
 * @property {string} [className]
 * @property {boolean} [disabled]
 */

/**
 * @type {React.FC<LimitedTextareaProps>}
 */
export const LimitedTextarea = ({
  rows = 3,
  placeholder,
  value = '',
  maxLength = 500,
  field,
  errors,
  className,
  disabled = false,
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
          'rounded-sm border border-slate-400 bg-white px-2 text-sm text-slate-800 placeholder:text-sm placeholder:text-slate-600',
          className,
        )}
        {...field}
        value={field.value ?? value}
      ></textarea>
      <CharactersRemaining limit={limit} remaining={remaining} />
      <ErrorMessage errors={errors} name={field.name} as={ErrorMessageTag} />
    </div>
  );
};

const useMaxLength = ({ value, limit }) => {
  return {
    limit,
    remaining: limit - (value?.length || 0),
  };
};

/**
 * @typedef {Object} CharactersRemainingProps
 * @property {number} remaining
 * @property {number} limit
 */

/**
 * @type {React.FC<CharactersRemainingProps>}
 */
export const CharactersRemaining = ({ remaining, limit }) => {
  if (remaining === limit) {
    return null;
  }

  const percentage = (limit - remaining) / limit;

  return (
    <span
      className={clsx('absolute right-3 bottom-0', {
        'text-xs text-slate-500': percentage >= 0 && percentage < 0.8,
        'text-xs text-amber-600': percentage >= 0.8 && percentage < 0.9,
        'border border-red-600 bg-white p-2 text-lg font-black text-red-600': percentage >= 0.9,
      })}
    >
      {remaining} characters left
    </span>
  );
};
