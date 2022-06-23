import PropTypes from 'prop-types';
import { contrastColor } from 'contrast-color';
import { CirclePicker } from 'react-color';
import { Controller, useForm } from 'react-hook-form';
import { useImmer } from 'use-immer';
import { LimitedTextarea } from '../formElements/LimitedTextarea.jsx';

const numberFormatter = new Intl.NumberFormat('en-US');

export default function AddPoint({
  active,
  color,
  point,
  dispatch,
  notes = '',
  photos = [],
}) {
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
    color: contrastColor.call({}, { bgColor: color.hex }),
    backgroundColor: color.hex,
  };
  const pointStyle = {
    color: color.hex,
    backgroundColor: contrastColor.call(
      {},
      {
        bgColor: color.hex,
        fgLightColor: '#F3F4F6',
        fgDarkColor: '#4B5563',
      }
    ),
  };

  const { control, formState } = useForm({});

  return (
    <>
      <h1 className="text-2xl font-bold">Add Point</h1>
      <section className="mt-3 mb-4 inline-grid gap-3 overflow-x-auto">
        <div>
          <div className="flex">
            <button
              style={active ? style : inactiveStyle}
              className="rounded-l-lg border-t border-b border-l border-slate-600 px-6 font-bold text-white transition duration-100 ease-in-out focus:outline-none"
              type="button"
              onClick={() => dispatch({ type: 'add-point/activate' })}
            >
              {active ? 'draw' : 'activate'}
            </button>
            <input
              className="w-full flex-1 rounded-r-lg border-t border-b border-r border-slate-500 bg-white px-3 py-2 text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
              type="text"
              placeholder="Point Name"
            />
          </div>
          <div
            className="mx-auto flex w-min items-center justify-center whitespace-nowrap rounded px-3"
            style={pointStyle}
          >
            <span className="pl-5 text-sm">
              ({numberFormatter.format(point?.x || 0)},{' '}
              {numberFormatter.format(point?.y || 0)})
            </span>
          </div>
        </div>
        <h2 className="text-lg font-bold">Color</h2>
        <div className="flex justify-center">
          <CirclePicker
            onChangeComplete={(color) =>
              dispatch({ type: 'add-point/color', payload: color })
            }
          ></CirclePicker>
        </div>
        <h2 className="text-lg font-bold">Notes</h2>
        <Controller
          control={control}
          name="notes"
          render={({ field }) => (
            <LimitedTextarea
              value={notes}
              placeholder="start typing to remember why you are creating this point..."
              rows="5"
              maxLength={450}
              field={field}
              className="w-full text-xs"
              errors={formState.errors}
              onChange={(event) =>
                dispatch({
                  type: 'add-point/notes',
                  payload: event.target.value,
                })
              }
            />
          )}
        />

        <div className="flex flex-row justify-between">
          <h2 className="text-lg font-bold">Photos</h2>
          <button
            type="button"
            className="ripple w-min self-center whitespace-nowrap rounded border border-white bg-transparent px-3 py-1 text-xs uppercase transition hover:bg-indigo-300 hover:text-black focus:outline-none"
            onClick={addImage}
          >
            + Add
          </button>
        </div>

        <div className="flex flex-wrap justify-evenly gap-3 self-center">
          {images.map((_, key) => (
            <div
              key={key}
              className="h-20 w-20 rounded border border-slate-800 bg-slate-400"
            ></div>
          ))}
        </div>
        <div className="flex items-end justify-center">
          <button
            className="ripple inline-block w-min rounded border-2 border-green-500 bg-transparent px-6 py-2 text-center text-xs font-medium uppercase text-white transition hover:bg-green-300 hover:text-black focus:outline-none disabled:cursor-not-allowed disabled:border-red-500 disabled:opacity-50"
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

AddPoint.propTypes = {
  active: PropTypes.bool,
  color: PropTypes.object,
  point: PropTypes.object,
  dispatch: PropTypes.func,
  notes: PropTypes.string,
  photos: PropTypes.array,
};
