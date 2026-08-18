import { Label, Listbox, ListboxButton, ListboxOption, ListboxOptions, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';
import { clsx } from 'clsx';
import { forwardRef, Fragment, type ReactNode } from 'react';

type SelectOption = string | { disabled?: boolean; label?: ReactNode; value?: string };
type SelectProps = {
  disabled?: boolean;
  label?: ReactNode | false;
  name?: string;
  onChange?: (value: string | undefined) => void;
  options?: readonly SelectOption[];
  placeholder?: string;
  required?: boolean;
  value?: SelectOption;
};

const isOptionObject = (option: SelectOption): option is Exclude<SelectOption, string> => typeof option === 'object';

const getOptionValue = (option: SelectOption) => (isOptionObject(option) ? option.value : option);

const getDefaultValue = (
  value: SelectOption | undefined,
  placeholder: string | undefined,
  options: readonly SelectOption[] | undefined,
): ReactNode => {
  if (!value) {
    return placeholder;
  }

  if (!options?.length) {
    return placeholder;
  }

  const firstOption = options[0];
  if (!firstOption) {
    return placeholder;
  }

  if (isOptionObject(firstOption)) {
    const label = options.find((option) => getOptionValue(option) === getOptionValue(value));

    if (!label || !isOptionObject(label)) {
      return placeholder;
    }

    return label.label;
  }

  const option = options.find((option) => option === value);

  if (!option) {
    return placeholder;
  }

  return isOptionObject(option) ? option.label : option;
};

export const Select = forwardRef<HTMLButtonElement, SelectProps>(
  ({ disabled, label, name, required, options, value, onChange, placeholder }, ref) => {
    return (
      <Listbox
        value={value}
        name={name}
        disabled={disabled}
        className={clsx('transform-opacity', {
          'opacity-25': disabled,
        })}
        as="div"
        onChange={(newValue: SelectOption) => {
          if (onChange) {
            onChange(getOptionValue(newValue));
          }
        }}
      >
        {label !== false && (
          <Label className="font-semibold">
            {label ?? name}
            {required && <span className="not-sr-only ml-0.5 text-rose-300">*</span>}
          </Label>
        )}
        <div className="relative mt-1">
          <ListboxButton
            ref={ref}
            aria-required={required}
            className="focus-visible:ring-whites/75 relative w-full cursor-default rounded-lg border border-slate-400 bg-white py-2 pr-10 pl-3 text-left focus:outline-hidden focus-visible:border-sky-500 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm"
          >
            <span className="block h-5 truncate text-slate-600">{getDefaultValue(value, placeholder, options)}</span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronUpDownIcon className="h-5 w-5 text-slate-400" aria-hidden="true" />
            </span>
          </ListboxButton>
          <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
            <ListboxOptions className="absolute z-50 mt-1 max-h-56 min-h-full w-full overflow-auto rounded-md border border-slate-400 bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-hidden sm:text-sm">
              {(options?.length ?? 0) > 0 ? (
                options?.map((option, id) => (
                  <ListboxOption
                    key={id}
                    className={({ focus }) =>
                      clsx('relative cursor-default py-2 pr-4 pl-10 select-none', {
                        'bg-sky-100 text-sky-900': focus,
                        'text-sky-900': !focus && !(isOptionObject(option) && option.disabled),
                        'cursor-not-allowed text-slate-400': isOptionObject(option) && (option.disabled ?? false),
                      })
                    }
                    value={option}
                    disabled={isOptionObject(option) && (option.disabled ?? false)}
                  >
                    {({ selected }) => (
                      <>
                        <span
                          className={clsx('block truncate', {
                            'font-bold': selected,
                            'font-normal': !selected,
                          })}
                        >
                          {isOptionObject(option) ? option.label : option}
                        </span>
                        {selected ? (
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-sky-600">
                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                          </span>
                        ) : null}
                      </>
                    )}
                  </ListboxOption>
                ))
              ) : (
                <div className="relative cursor-default py-2 pl-10 text-center text-slate-500 select-none">
                  This list is empty 😶
                </div>
              )}
            </ListboxOptions>
          </Transition>
        </div>
      </Listbox>
    );
  },
);
Select.displayName = 'Select';
