import { useState } from 'react';
import PropTypes from 'prop-types';
import { Switch } from '@headlessui/react';
import clsx from 'clsx';

const switchCss =
  'relative mt-1 flex h-[32px] w-[64px] shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2  focus-visible:ring-white focus-visible:ring-opacity-75';
const ringCss =
  'pointer-events-none inline-block h-[28px] w-[28px] transform rounded-full bg-indigo-600 shadow-lg ring-0 transition duration-200 ease-in-out';

function Toggle({
  name,
  currentValue = false,
  onUpdate,
  screenReader = 'Toggle',
}) {
  const [value, setValue] = useState(currentValue);

  return (
    <div className="inline-flex">
      <Switch
        name={name}
        checked={value}
        onChange={(newValue) => {
          setValue(newValue);
          onUpdate(newValue);
        }}
        className={clsx(
          {
            'bg-indigo-200': value,
            'bg-white': !value,
          },
          switchCss
        )}
      >
        <span className="sr-only">{screenReader}</span>
        <span
          aria-hidden="true"
          className={clsx(
            {
              'translate-x-8': value,
              'translate-x-0': !value,
            },
            ringCss
          )}
        />
      </Switch>
      <span className="mt-1 self-center pl-2 text-sm text-slate-300">
        {value ? 'Yes' : 'No'}
      </span>
    </div>
  );
}

export default Toggle;

Toggle.propTypes = {
  currentValue: PropTypes.bool,
  onUpdate: PropTypes.func,
  screenReader: PropTypes.string,
  name: PropTypes.string,
};

Toggle.defaultProps = {
  currentValue: false,
  screenReader: 'Toggle',
};
