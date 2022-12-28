import { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { Switch } from '@headlessui/react';
import clsx from 'clsx';

const Toggle = forwardRef(
  (
    {
      name,
      value = false,
      onChange,
      screenReader = 'Toggle',
      hideLabel,
      yesValue = 'Yes',
      noValue = 'No',
    },
    ref
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
          className="relative mt-1 flex h-[26px] w-[58px] shrink-0 cursor-pointer rounded-full border border-slate-400 bg-white transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75"
        >
          <span className="sr-only">{screenReader}</span>
          <span
            aria-hidden="true"
            className={clsx(
              {
                'translate-x-8 border-sky-800 from-sky-300 to-sky-800': value,
                'translate-x-0 border-slate-500 from-white to-slate-300':
                  !value,
              },
              'pointer-events-none inline-block h-6 w-6 transform rounded-full border-2 bg-gradient-to-br shadow-lg ring-0 transition duration-200 ease-in-out'
            )}
          />
        </Switch>
        {!hideLabel && (
          <span className="mt-1 self-center pl-2 text-sm text-slate-500">
            {value ? yesValue : noValue}
          </span>
        )}
      </div>
    );
  }
);
export { Toggle as Switch };
Toggle.displayName = 'Toggle';
Toggle.propTypes = {
  value: PropTypes.bool,
  onChange: PropTypes.func,
  screenReader: PropTypes.string,
  hideLabel: PropTypes.bool,
  name: PropTypes.string,
  yesValue: PropTypes.string,
  noValue: PropTypes.string,
};

Toggle.defaultProps = {
  value: false,
  hideLabel: false,
  screenReader: 'Toggle',
};
