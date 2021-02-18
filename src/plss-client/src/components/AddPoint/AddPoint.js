import { faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import clsx from 'clsx';
import { contrastColor } from 'contrast-color';
import * as React from 'react';
import { CirclePicker } from 'react-color';

const numberFormatter = new Intl.NumberFormat('en-US');

export default function AddPoint({ active, color, point, dispatch }) {
  const classes = clsx([], {
    'bg-gray-500': !active,
  });

  const inactiveStyle = {
    color: color.hex,
    backgroundColor: '#111',
  };
  const style = {
    color: contrastColor({ bgColor: color.hex }),
    backgroundColor: color.hex,
  };
  const pointStyle = {
    color: color.hex,
    backgroundColor: contrastColor({ bgColor: color.hex, fgLightColor: '#F3F4F6', fgDarkColor: '#4B5563' }),
  };

  return (
    <>
      <h1 className="text-2xl font-bold">Add Point</h1>
      <section className="inline-grid gap-3 mt-3">
        <div>
          <div className="flex w-full">
            <button
              style={active ? style : inactiveStyle}
              className="px-6 font-bold text-white border-t border-b border-l border-gray-600 rounded-l-lg"
              type="button"
              onClick={() => dispatch({ type: 'add-point/activate' })}
            >
              {active ? 'draw' : 'activate'}
            </button>
            <input
              className="flex-1 p-3 text-gray-800 bg-white border-t border-b border-r border-gray-500 rounded-r-lg"
              type="text"
              placeholder="Point Name"
            />
          </div>
          <div
            className="flex items-center justify-center px-3 mx-auto rounded whitespace-nowrap w-min"
            style={pointStyle}
          >
            <FontAwesomeIcon icon={faMapMarkerAlt}></FontAwesomeIcon>
            <span className="pl-5 text-sm">
              ({numberFormatter.format(point?.x || 0)}, {numberFormatter.format(point?.y || 0)})
            </span>
          </div>
        </div>
        <h2 className="text-lg font-bold">Color</h2>
        <div className="flex justify-center">
          <CirclePicker
            onChangeComplete={(color) => dispatch({ type: 'add-point/color', payload: color })}
          ></CirclePicker>
        </div>
        <h2 className="text-lg font-bold">Notes</h2>
        <h2 className="text-lg font-bold">Photos</h2>
        <div className="flex items-end justify-center">
          <button
            className="inline-block px-6 py-2 text-xs font-medium leading-6 text-center text-white uppercase transition bg-transparent border-2 border-green-500 rounded disabled:border-red-500 disabled:cursor-not-allowed disabled:opacity-50 w-min ripple hover:bg-green-300 hover:text-black focus:outline-none"
            type="button"
            disabled={!point}
          >
            Save
          </button>
        </div>
      </section>
    </>
  );
}
