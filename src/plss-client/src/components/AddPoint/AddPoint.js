import { faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { contrastColor } from 'contrast-color';
import * as React from 'react';
import { CirclePicker } from 'react-color';

const numberFormatter = new Intl.NumberFormat('en-US');

export default function AddPoint({ active, color, point, dispatch, notes }) {
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
              className="px-6 font-bold text-white transition duration-100 ease-in-out border-t border-b border-l border-gray-600 rounded-l-lg"
              type="button"
              onClick={() => dispatch({ type: 'add-point/activate' })}
            >
              {active ? 'draw' : 'activate'}
            </button>
            <input
              className="flex-1 px-3 py-2 text-gray-800 bg-white border-t border-b border-r border-gray-500 rounded-r-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none focus:ring-opacity-50"
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

        <LimitedTextArea
          value={notes}
          className="text-xs"
          placeholder="start typing to remember why you are creating this point..."
          limit={450}
          onChange={(event) =>
            dispatch({
              type: 'add-point/notes',
              payload: event.target.value,
            })
          }
        />

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

const LimitedTextArea = ({ placeholder, value, limit, onChange }) => {
  return (
    <div className="flex flex-col">
      <textarea
        value={value}
        maxLength={limit}
        placeholder={placeholder}
        className="block w-full px-3 py-2 text-sm leading-tight text-gray-800 placeholder-gray-400 transition duration-100 ease-in-out bg-white border border-gray-300 rounded shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none focus:ring-opacity-50"
        onChange={onChange}
      ></textarea>
      <span className="self-end text-xs text-gray-400">{limit - value.length} characters left</span>
    </div>
  );
};
