import { useContext, useEffect, useState } from 'react';
import { ErrorMessage } from '@hookform/error-message';
import { yupResolver } from '@hookform/resolvers/yup';
import clsx from 'clsx';
import { Controller, useForm } from 'react-hook-form';
import { RadioGroup } from '@headlessui/react';
import { Input } from '../../formElements/Inputs.jsx';
import Spacer from '../../formElements/Spacer.jsx';
import { NumberedForm, NumberedFormSection } from '../../formElements/Form.jsx';
import ErrorMessageTag from '../ErrorMessage.jsx';
import { SubmissionContext } from '../../contexts/SubmissionContext.jsx';
import { units } from './Options.mjs';
import {
  latitudeSchema,
  longitudeSchema,
  geographicHeightSchema,
} from './Schema.mjs';
import Wizard from './Wizard.jsx';
import { formatDatum } from '../../helpers/index.mjs';
import usePageView from '../../hooks/usePageView.jsx';

const defaults = {
  seconds: '',
  minutes: '',
  degrees: '',
};

export const Latitude = () => {
  const meta = 'geographic';
  const [state, send] = useContext(SubmissionContext);
  usePageView('screen-geographic-coordinates-latitude');

  let defaultValues = {
    northing: state.context?.geographic?.northing ?? defaults,
  };

  const { formState, handleSubmit, register, reset, setFocus } = useForm({
    resolver: yupResolver(latitudeSchema),
    defaultValues,
  });

  useEffect(() => {
    setFocus('northing.degrees');
  }, [setFocus]);

  useEffect(() => {
    if (state.matches('form.entering alternate latitude')) {
      send({ type: 'SET_COORDINATES' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (
      state.matches('form.entering alternate latitude') &&
      state.matches('projecting.done')
    ) {
      reset({ northing: state.context?.geographic?.northing });
    }
  }, [state, reset]);

  const onSubmit = (payload) => {
    send({ type: 'NEXT', meta, payload });
  };

  const onReset = () => {
    send({ type: 'RESET', meta, payload: { northing: defaults } });
    reset({ northing: defaults });
  };

  return (
    <>
      <h2 className="text-2xl font-semibold">Location Information</h2>
      <p className="text-sm leading-none">
        Geographic Northing for {formatDatum(state.context.datum)}
      </p>
      <Spacer className="my-4" />
      {state.matches('form.entering alternate latitude') &&
      !state.matches('projecting.done') ? (
        <div>Projecting Grid Coordinates...</div>
      ) : (
        <NumberedForm onSubmit={handleSubmit(onSubmit)}>
          <NumberedFormSection number={2} title="Latitude">
            <div>
              <Input
                label="Degrees"
                placeholder="##"
                type="number"
                min="36"
                max="42"
                required={true}
                {...register('northing.degrees')}
              />
              <ErrorMessage
                errors={formState.errors}
                name="northing.degrees"
                as={ErrorMessageTag}
              />
            </div>
            <div>
              <Input
                label="Minutes"
                placeholder="##"
                type="number"
                min="0"
                max="59"
                required={true}
                {...register('northing.minutes')}
              />
              <ErrorMessage
                errors={formState.errors}
                name="northing.minutes"
                as={ErrorMessageTag}
              />
            </div>
            <div>
              <Input
                label="Seconds"
                placeholder="##.00000"
                type="number"
                step="0.00001"
                min="0"
                max="59.99999"
                required={true}
                {...register('northing.seconds')}
              />
              <p className="text-sm text-slate-300">5 Decimals ##.#####</p>
              <ErrorMessage
                errors={formState.errors}
                name="northing.seconds"
                as={ErrorMessageTag}
              />
            </div>
          </NumberedFormSection>
          <NumberedFormSection number={0}>
            <Wizard
              back={() => {
                send({ type: 'RESTART' });
                send({ type: 'BACK' });
              }}
              next={true}
              clear={onReset}
            />
          </NumberedFormSection>
        </NumberedForm>
      )}
    </>
  );
};

export const Longitude = () => {
  const meta = 'geographic';
  const [state, send] = useContext(SubmissionContext);
  usePageView('screen-geographic-coordinates-longitude');

  let defaultValues = {
    easting: state.context?.geographic?.easting ?? defaults,
  };

  const { formState, handleSubmit, register, reset, setFocus } = useForm({
    resolver: yupResolver(longitudeSchema),
    defaultValues,
  });

  useEffect(() => {
    setFocus('easting.degrees');
  }, [setFocus]);

  const onSubmit = (payload) => {
    send({ type: 'NEXT', meta, payload });
  };

  const onReset = () => {
    send({ type: 'RESET', meta, payload: { easting: defaults } });
    reset({ easting: defaults });
  };

  return (
    <>
      <h2 className="text-2xl font-semibold">Location Information</h2>
      <p className="text-sm leading-none">
        Geographic Easting for {formatDatum(state.context.datum)}
      </p>
      <Spacer className="my-4" />
      <NumberedForm onSubmit={handleSubmit(onSubmit)}>
        <NumberedFormSection number={3} title="Longitude">
          <div>
            <Input
              label="Degrees"
              placeholder="###"
              type="number"
              min="109"
              max="114"
              required={true}
              {...register('easting.degrees')}
            />
            <ErrorMessage
              errors={formState.errors}
              name="easting.degrees"
              as={ErrorMessageTag}
            />
          </div>
          <div>
            <Input
              label="Minutes"
              placeholder="##"
              type="number"
              min="0"
              max="59"
              required={true}
              {...register('easting.minutes')}
            />
            <ErrorMessage
              errors={formState.errors}
              name="easting.minutes"
              as={ErrorMessageTag}
            />
          </div>
          <div>
            <Input
              label="Seconds"
              placeholder="##.00000"
              type="number"
              step="0.000001"
              min="0"
              max="59.99999"
              required={true}
              {...register('easting.seconds')}
            />
            <p className="text-sm text-slate-300">5 Decimals ##.#####</p>
            <ErrorMessage
              errors={formState.errors}
              name="easting.seconds"
              as={ErrorMessageTag}
            />
          </div>
        </NumberedFormSection>
        <NumberedFormSection number={0}>
          <Wizard
            back={() => send({ type: 'BACK' })}
            next={true}
            clear={onReset}
          />
        </NumberedFormSection>
      </NumberedForm>
    </>
  );
};

const geographicHeightDefaults = {
  elevation: '',
  unit: 'm',
};

export const GeographicHeight = () => {
  const meta = 'geographic';
  const [state, send] = useContext(SubmissionContext);
  usePageView('screen-geographic-coordinates-height');

  let geographic = state.context?.geographic;

  let defaultValues = {
    unit: geographic.unit,
    elevation: geographic.elevation,
  };

  if (!defaultValues.unit) {
    defaultValues = geographicHeightDefaults;
  }
  if (!defaultValues.unit) {
    defaultValues.unit = 'm';
  }

  const selectedUnit = units.find((x) => x.value === defaultValues.unit);

  const { control, formState, handleSubmit, register, reset, setFocus } =
    useForm({
      resolver: yupResolver(geographicHeightSchema),
      defaultValues,
    });

  useEffect(() => {
    setFocus('elevation');
  }, [setFocus]);

  const [selected, setSelected] = useState(selectedUnit);

  const onSubmit = (payload) => {
    send({ type: 'NEXT', meta, payload });
  };

  const onReset = () => {
    send({ type: 'RESET', meta, payload: geographicHeightDefaults });
    reset(geographicHeightDefaults);
  };

  return (
    <>
      <h2 className="text-2xl font-semibold">Location Information</h2>
      <p className="text-sm leading-none">
        Geographic height for {formatDatum(state.context.datum)}
      </p>
      <Spacer className="my-4" />
      <NumberedForm onSubmit={handleSubmit(onSubmit)}>
        <NumberedFormSection number={4} title="Ellipsoid Height">
          <Input label={false} required={true} {...register('elevation')} />
          <Controller
            control={control}
            name="unit"
            render={({ field: { onChange } }) => (
              <RadioGroup
                className="flex space-x-1 rounded-xl bg-sky-500/20 p-1"
                value={selected}
                onChange={(option) => {
                  onChange(option.value);
                  setSelected(option);
                }}
              >
                <RadioGroup.Label className="sr-only">
                  Elevation unit
                </RadioGroup.Label>
                {units.map((option) => (
                  <RadioGroup.Option
                    key={option.value}
                    value={option}
                    className={({ checked }) =>
                      clsx(
                        'flex h-10 w-full cursor-pointer items-center justify-center rounded-lg px-1.5 text-center font-medium leading-5',
                        'ring-white ring-opacity-60 ring-offset-2 ring-offset-sky-400 focus:outline-none focus:ring-2',
                        checked
                          ? 'border border-sky-600 bg-sky-500 text-white shadow hover:border-sky-700 hover:bg-sky-600 focus:border-sky-500 focus:ring-sky-600 active:bg-sky-700'
                          : 'text-sky-700 hover:bg-sky-600/20',
                      )
                    }
                  >
                    {({ checked }) => (
                      <div className="text-sm">
                        <RadioGroup.Label
                          as="p"
                          className={`font-medium ${
                            checked ? 'text-white' : 'text-sky-700'
                          }`}
                        >
                          {option.label}
                        </RadioGroup.Label>
                      </div>
                    )}
                  </RadioGroup.Option>
                ))}
              </RadioGroup>
            )}
          />
          <ErrorMessage
            errors={formState.errors}
            name="elevation"
            as={ErrorMessageTag}
          />
          <ErrorMessage
            errors={formState.errors}
            name="unit"
            as={ErrorMessageTag}
          />
        </NumberedFormSection>
        <NumberedFormSection number={0}>
          <Wizard
            back={() => send({ type: 'BACK' })}
            next={true}
            clear={onReset}
          />
        </NumberedFormSection>
      </NumberedForm>
    </>
  );
};
