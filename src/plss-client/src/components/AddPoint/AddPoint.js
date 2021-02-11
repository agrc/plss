import { faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as React from 'react';
import { CirclePicker } from 'react-color';

export default function AddPoint() {
  const [color, setColor] = React.useState({ hex: '#fff' });

  return (
    <>
      <h1 className="text-2xl font-bold">Add Point</h1>
      <section className="inline-grid gap-3 mt-3">
        <div className="flex w-full">
          <button
            style={{ color: color.hex }}
            className="px-6 text-white bg-gray-500 border-t border-b border-l border-gray-600 rounded-l-lg"
            type="button"
          >
            Activate point
          </button>
          <input
            className="flex-1 p-3 text-gray-800 bg-white border-t border-b border-r border-gray-500 rounded-r-lg"
            type="text"
            placeholder="Point 1"
          />
        </div>
        <div className="flex items-center justify-center w-full" style={{ color: color.hex }}>
          <FontAwesomeIcon icon={faMapMarkerAlt}></FontAwesomeIcon>
          <span className="pl-5 text-xl">(0,0)</span>
        </div>
        <h2 className="text-lg font-bold">Color</h2>
        <div className="flex justify-center">
          <CirclePicker onChangeComplete={(color) => setColor(color)}></CirclePicker>
        </div>
        <h2 className="text-lg font-bold">Notes</h2>
        <h2 className="text-lg font-bold">Photos</h2>
        <div className="flex items-end justify-center">
          <button
            className="inline-block px-6 py-2 text-xs font-medium leading-6 text-center text-white uppercase transition bg-transparent border-2 border-green-500 rounded w-min ripple hover:bg-green-300 hover:text-black focus:outline-none"
            type="button"
          >
            Save
          </button>
        </div>
      </section>
    </>
  );
}
