import { faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { contrastColor } from 'contrast-color';
import * as React from 'react';
import { CirclePicker } from 'react-color';
import { useImmer } from 'use-immer';
import { LimitedTextarea } from '../FormElements';

const numberFormatter = new Intl.NumberFormat('en-US');

export default function AddPoint({ active, color, point, dispatch, notes, photos = [] }) {
  const [images, updateImage] = useImmer(photos);
  const addImage = () => {
    updateImage((draft) => {
      draft.push(0);
    });
  };

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
      <section className="inline-grid gap-3 mt-3 mb-4 overflow-x-auto">
        <div>
          <div className="flex">
            <button
              style={active ? style : inactiveStyle}
              className="px-6 font-bold text-white transition duration-100 ease-in-out border-t border-b border-l border-gray-600 rounded-l-lg focus:outline-none"
              type="button"
              onClick={() => dispatch({ type: 'add-point/activate' })}
            >
              {active ? 'draw' : 'activate'}
            </button>
            <input
              className="flex-1 w-full px-3 py-2 text-gray-800 bg-white border-t border-b border-r border-gray-500 rounded-r-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none focus:ring-opacity-50"
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

        <LimitedTextarea
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

        <div className="flex flex-row justify-between">
          <h2 className="text-lg font-bold">Photos</h2>
          <button
            type="button"
            className="self-center px-3 py-1 text-xs uppercase transition bg-transparent border border-white rounded w-min ripple hover:bg-indigo-300 hover:text-black focus:outline-none whitespace-nowrap"
            onClick={addImage}
          >
            + Add
          </button>
        </div>

        <div className="flex flex-wrap self-center gap-3 justify-evenly">
          {images.map((_, key) => (
            <div key={key} className="w-20 h-20 bg-gray-400 border border-gray-800 rounded"></div>
          ))}
        </div>
        <div className="flex items-end justify-center">
          <button
            className="inline-block px-6 py-2 text-xs font-medium text-center text-white uppercase transition bg-transparent border-2 border-green-500 rounded disabled:border-red-500 disabled:cursor-not-allowed disabled:opacity-50 w-min ripple hover:bg-green-300 hover:text-black focus:outline-none"
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
