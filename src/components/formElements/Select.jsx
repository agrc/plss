import { forwardRef, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Listbox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';
import clsx from 'clsx';

const getDefaultValue = (value, placeholder, options) => {
  if ((value?.length ?? 0) < 1) {
    return placeholder;
  }

  if ((options?.length ?? 0) < 1) {
    return placeholder;
  }

  if (Object.keys(options[0]).includes('value')) {
    const label = options.find(
      (option) => option.value === (value?.value ?? value)
    )?.label;

    if (!label) {
      return placeholder;
    }

    return label;
  }

  const option = options.find((option) => option === value);

  if (!option) {
    return placeholder;
  }

  return option;
};

export const Select = forwardRef(
  (
    { disabled, label, name, required, options, value, onChange, placeholder },
    ref
  ) => {
    return (
      <Listbox
        value={value}
        name={name}
        disabled={disabled}
        className={clsx('transform-opacity', {
          'opacity-25': disabled,
        })}
        as="div"
        onChange={(newValue) => {
          if (onChange) {
            onChange(newValue?.value ?? newValue);
          }
        }}
      >
        {label !== false && (
          <Listbox.Label className="font-semibold">
            {label ?? name}
            {required && (
              <span className="not-sr-only ml-0.5 text-rose-300">*</span>
            )}
          </Listbox.Label>
        )}
        <div className="relative mt-1">
          <Listbox.Button
            ref={ref}
            aria-required={required}
            className="relative w-full cursor-default rounded-lg border border-slate-400 bg-white py-2 pl-3 pr-10 text-left focus:outline-none focus-visible:border-sky-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm"
          >
            <span className="block h-5 truncate text-slate-600">
              {getDefaultValue(value, placeholder, options)}
            </span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronUpDownIcon
                className="h-5 w-5 text-slate-400"
                aria-hidden="true"
              />
            </span>
          </Listbox.Button>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute z-50 mt-1 max-h-60 min-h-full w-full overflow-auto rounded-md border border-slate-400 bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              {(options?.length ?? 0) > 0 ? (
                options?.map((option, id) => (
                  <Listbox.Option
                    key={id}
                    className={({ active }) =>
                      clsx(
                        'relative cursor-default select-none py-2 pl-10 pr-4',
                        {
                          'bg-sky-100 text-sky-900': active,
                          'text-sky-900': !active && !option?.disabled,
                          'cursor-not-allowed text-slate-400':
                            option?.disabled ?? false,
                        }
                      )
                    }
                    value={option}
                    disabled={option?.disabled ?? false}
                  >
                    {({ selected }) => (
                      <>
                        <span
                          className={clsx('block truncate', {
                            'font-bold': selected,
                            'font-normal': !selected,
                          })}
                        >
                          {option?.label ?? option}
                        </span>
                        {selected ? (
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-sky-600">
                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                          </span>
                        ) : null}
                      </>
                    )}
                  </Listbox.Option>
                ))
              ) : (
                <div className="relative cursor-default select-none py-2 pl-10 text-center text-slate-500">
                  This list is empty 😶
                </div>
              )}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
    );
  }
);
Select.displayName = 'Select';
Select.propTypes = {
  /**
   * The property name used by react hook form
   */
  name: PropTypes.string,
  /**
   * The text of the accompanied label otherwise it will be the name of the input
   */
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  /**
   * If the input is required in the form
   */
  required: PropTypes.bool,
  /**
   * The help text to display
   */
  placeholder: PropTypes.string,
  /**
   * If the input is disabled
   */
  disabled: PropTypes.bool,
  /**
   * The options to place inside the select
   */
  options: PropTypes.arrayOf(
    PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({ label: PropTypes.string, value: PropTypes.string }),
    ])
  ),
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({ label: PropTypes.string, value: PropTypes.string }),
  ]),
  onChange: PropTypes.func,
};
