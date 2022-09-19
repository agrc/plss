import clsx from 'clsx';
import PropTypes from 'prop-types';
import { Fragment, useState } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';

const getDefaultValue = (value, placeholder, options) => {
  if (options?.length < 1) {
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

export const Select = ({ options, currentValue, onUpdate, placeholder }) => {
  const [value, setValue] = useState(currentValue);
  return (
    <Listbox
      value={value}
      onChange={(newValue) => {
        setValue(newValue);
        onUpdate(newValue?.value ?? newValue);
      }}
    >
      <div className="relative mt-1">
        <Listbox.Button className="relative w-full cursor-default rounded-lg border border-slate-400 bg-white py-2 pl-3 pr-10 text-left focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
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
          <Listbox.Options className="absolute z-10 mt-1 max-h-60 min-h-full w-full overflow-auto rounded-md border-2 border-slate-400 bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            {options?.length > 0 ? (
              options?.map((option, id) => (
                <Listbox.Option
                  key={id}
                  className={({ active }) =>
                    clsx(
                      'relative cursor-default select-none py-2 pl-10 pr-4',
                      {
                        'bg-indigo-100 text-indigo-900': active,
                        'text-slate-900': !active,
                      }
                    )
                  }
                  value={option}
                >
                  {({ selected }) => (
                    <>
                      <span
                        className={clsx('block truncate', {
                          'font-medium': selected,
                          'font-normal': !selected,
                        })}
                      >
                        {option?.label ?? option}
                      </span>
                      {selected ? (
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-indigo-600">
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
  currentValue: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({ label: PropTypes.string, value: PropTypes.string }),
  ]),
  onUpdate: PropTypes.func,
};
