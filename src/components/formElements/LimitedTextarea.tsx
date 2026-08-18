import { ErrorMessage } from '@hookform/error-message';
import { clsx } from 'clsx';
import type { ControllerRenderProps, FieldErrors, FieldValues } from 'react-hook-form';
import ErrorMessageTag from '../pageElements/ErrorMessage.tsx';

type LimitedTextareaProps<TFieldValues extends FieldValues> = {
  className?: string;
  disabled?: boolean;
  errors: FieldErrors<TFieldValues>;
  field: ControllerRenderProps<TFieldValues>;
  maxLength?: number;
  placeholder?: string;
  rows?: number;
  value?: string;
};

export const LimitedTextarea = <TFieldValues extends FieldValues>({
  rows = 3,
  placeholder,
  value = '',
  maxLength = 500,
  field,
  errors,
  className,
  disabled = false,
}: LimitedTextareaProps<TFieldValues>) => {
  const fieldValue = typeof field.value === 'string' ? field.value : value;
  const { limit, remaining } = useMaxLength({
    value: fieldValue,
    limit: maxLength,
  });

  return (
    <div className="relative flex grow flex-col">
      <textarea
        disabled={disabled}
        id={field.name}
        rows={rows}
        maxLength={limit}
        placeholder={placeholder}
        className={clsx(
          'rounded-sm border border-slate-400 bg-white px-2 text-sm text-slate-800 placeholder:text-sm placeholder:text-slate-600',
          className,
        )}
        {...field}
        value={fieldValue}
      ></textarea>
      <CharactersRemaining limit={limit} remaining={remaining} />
      <ErrorMessage errors={errors} name={field.name as never} as={ErrorMessageTag} />
    </div>
  );
};

type UseMaxLengthProps = {
  limit: number;
  value?: string;
};

const useMaxLength = ({ value, limit }: UseMaxLengthProps) => {
  return {
    limit,
    remaining: limit - (value?.length || 0),
  };
};

type CharactersRemainingProps = {
  limit: number;
  remaining: number;
};

export const CharactersRemaining = ({ remaining, limit }: CharactersRemainingProps) => {
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
