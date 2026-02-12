import { Switch } from '@headlessui/react';
import { clsx } from 'clsx';
import { forwardRef } from 'react';

/**
 * @typedef {Object} ToggleProps
 * @property {string} [name] - The name of the form field
 * @property {boolean} [value=false] - The current checked state
 * @property {function(boolean): void} [onChange] - Callback when the value changes
 * @property {string} [screenReader='Toggle'] - Screen reader text
 * @property {boolean} [hideLabel=false] - Whether to hide the yes/no label
 * @property {string} [yesValue='Yes'] - Text to display when checked
 * @property {string} [noValue='No'] - Text to display when unchecked
 */

/**
 * Toggle switch component
 * @type {React.ForwardRefExoticComponent<ToggleProps & React.RefAttributes<any>>}
 */
const Toggle = forwardRef(
  (
    { name, value = false, onChange, screenReader = 'Toggle', hideLabel = false, yesValue = 'Yes', noValue = 'No' },
    ref,
  ) => {
    return (
      <div className="inline-flex">
        <Switch
          name={name}
          ref={ref}
          checked={value}
          onChange={(newValue) => {
            onChange(newValue);
          }}
          className="relative mt-1 flex h-6.5 w-14.5 shrink-0 cursor-pointer rounded-full border border-slate-400 bg-white transition-colors duration-200 ease-in-out focus:outline-hidden focus-visible:ring-2 focus-visible:ring-white/75"
        >
          <span className="sr-only">{screenReader}</span>
          <span
            aria-hidden="true"
            className={clsx(
              {
                'translate-x-8 border-sky-800 from-sky-300 to-sky-800': value,
                'translate-x-0 border-slate-500 from-white to-slate-300': !value,
              },
              'pointer-events-none inline-block h-6 w-6 transform rounded-full border-2 bg-linear-to-br shadow-lg ring-0 transition duration-200 ease-in-out',
            )}
          />
        </Switch>
        {!hideLabel && (
          <span className="mt-1 self-center pl-2 text-sm text-slate-500">{value ? yesValue : noValue}</span>
        )}
      </div>
    );
  },
);
export { Toggle as Switch };
Toggle.displayName = 'Toggle';
