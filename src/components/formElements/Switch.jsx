import PropTypes from 'prop-types';
import { Switch } from '@headlessui/react';
import clsx from 'clsx';

function Toggle({
  name,
  currentValue = false,
  onUpdate,
  screenReader = 'Toggle',
  hideLabel,
}) {
  return (
    <div className="inline-flex">
      <Switch
        name={name}
        checked={currentValue}
        onChange={(newValue) => {
          onUpdate(newValue);
        }}
        className="relative mt-1 flex h-[26px] w-[58px] shrink-0 cursor-pointer rounded-full border border-slate-400 bg-white transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75"
      >
        <span className="sr-only">{screenReader}</span>
        <span
          aria-hidden="true"
          className={clsx(
            {
              'translate-x-8 border-sky-800 from-sky-300 to-sky-800':
                currentValue,
              'translate-x-0 border-slate-500 from-white to-slate-300':
                !currentValue,
            },
            'pointer-events-none inline-block h-6 w-6 transform rounded-full border-2 bg-gradient-to-br shadow-lg ring-0 transition duration-200 ease-in-out'
          )}
        />
      </Switch>
      {!hideLabel && (
        <span className="mt-1 self-center pl-2 text-sm text-slate-500">
          {currentValue ? 'Yes' : 'No'}
        </span>
      )}
    </div>
  );
}

export default Toggle;

Toggle.propTypes = {
  currentValue: PropTypes.bool,
  onUpdate: PropTypes.func,
  screenReader: PropTypes.string,
  hideLabel: PropTypes.bool,
  name: PropTypes.string,
};

Toggle.defaultProps = {
  currentValue: false,
  hideLabel: false,
  screenReader: 'Toggle',
};
