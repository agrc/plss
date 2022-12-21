import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { contrastColor } from 'contrast-color';
import { CirclePicker } from 'react-color';
import { Controller, useForm } from 'react-hook-form';
import { useImmer } from 'use-immer';
import { httpsCallable } from 'firebase/functions';
import { useFunctions } from 'reactfire';
import { useQueryClient } from '@tanstack/react-query';
import { LimitedTextarea } from '../formElements/LimitedTextarea.jsx';
import { Input } from '../formElements/Inputs.jsx';
import { Button } from '../formElements/Buttons.jsx';

const numberFormatter = new Intl.NumberFormat('en-US');
const dateFormatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'short',
  timeStyle: 'short',
});

export default function AddPoint({
  active,
  color,
  geometry,
  dispatch,
  notes = '',
  photos = [],
}) {
  const functions = useFunctions();
  const addPoint = httpsCallable(functions, 'functions-httpsPostPoint');
  const [images, updateImage] = useImmer(photos);
  const [status, setStatus] = useState('disabled');
  const { control, formState, handleSubmit, register, reset } = useForm();
  const { isSubmitSuccessful } = formState;
  const queryClient = useQueryClient();

  useEffect(() => {
    setStatus(geometry ? 'idle' : 'disabled');
  }, [geometry]);

  // reset after successful form submission
  useEffect(() => {
    if (isSubmitSuccessful) {
      // toast.success('Your message has been sent');
      dispatch({ type: 'add-point/reset', payload: isSubmitSuccessful });
      reset({
        name: `Point (${dateFormatter.format(new Date())})`,
        notes: '',
      });
      queryClient.invalidateQueries('myPoints');
    }
  }, [dispatch, isSubmitSuccessful, reset, queryClient]);

  const addImage = () => {
    updateImage((draft) => {
      draft.push(0);
    });
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

  const savePoint = async (data) => {
    setStatus('loading');
    try {
      await addPoint({
        ...data,
        location: { x: geometry.x, y: geometry.y },
        color: color.hex,
      });
    } catch {
      //TODO! log error
    } finally {
      setStatus('idle');
    }

    return true;
  };

  return (
    <form
      onSubmit={handleSubmit(savePoint)}
      className="mb-10 flex w-full flex-col items-center justify-center"
    >
      <div className="relative flex w-full flex-col gap-4 ">
        <h1 className="text-2xl font-bold">Add a Point</h1>
        <p className="text-sm leading-tight">
          Saving points are available to help you remember points of interest
          when out in the field collecting information.
        </p>
        <section className="mt-3 mb-4 inline-grid gap-3 overflow-x-auto">
          <h2 className="text-lg font-bold">Name the point</h2>
          <Input
            name="name"
            type="text"
            placeholder="Point Name"
            value={`Point (${dateFormatter.format(new Date())})`}
            {...register}
          />
          <h2 className="text-lg font-bold">Pick a point color</h2>
          <div className="flex justify-center">
            <CirclePicker
              onChangeComplete={(color) =>
                dispatch({
                  type: 'add-point/color',
                  payload: color,
                })
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
              />
            )}
          />
          <div>
            <h2 className="mb-2 text-lg font-bold">Place the point</h2>
            <Button
              name="draw-point"
              style={active ? 'secondary' : 'primary'}
              type="button"
              onClick={() => dispatch({ type: 'add-point/activate' })}
            >
              {active ? 'ready' : 'click to draw'}
            </Button>
            {geometry?.x && (
              <>
                <div className="mt-2">Point Coordinates</div>
                <div
                  className="mx-auto flex w-min whitespace-nowrap rounded px-3"
                  style={pointStyle}
                >
                  <span className="text-sm">
                    ({numberFormatter.format(geometry?.x || 0)},{' '}
                    {numberFormatter.format(geometry?.y || 0)})
                  </span>
                </div>
              </>
            )}
          </div>

          <div className="flex flex-row justify-between">
            <h2 className="text-lg font-bold">Photos</h2>
            <button
              type="button"
              className="ripple w-min self-center whitespace-nowrap rounded border border-white bg-transparent px-3 py-1 text-xs uppercase transition hover:bg-sky-300 hover:text-black focus:outline-none"
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
            <Button
              className="ripple inline-block w-min rounded border-2 border-green-500 bg-transparent px-6 py-2 text-center text-xs font-medium uppercase text-white transition hover:bg-green-300 hover:text-black focus:outline-none disabled:cursor-not-allowed disabled:border-red-500 disabled:opacity-50"
              type="submit"
              state={status}
            >
              Save
            </Button>
          </div>
        </section>
      </div>
    </form>
  );
}

AddPoint.propTypes = {
  active: PropTypes.bool,
  color: PropTypes.object,
  geometry: PropTypes.object,
  dispatch: PropTypes.func,
  notes: PropTypes.string,
  photos: PropTypes.array,
};
