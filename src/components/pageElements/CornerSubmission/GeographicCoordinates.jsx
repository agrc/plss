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

const defaults = {
  seconds: '',
  minutes: '',
  degrees: '',
};

export const Latitude = () => {
  const meta = 'geographic';
  const [state, send] = useContext(SubmissionContext);

  let defaultValues = {
    northing: state.context?.geographic?.northing ?? defaults,
  };

  const { register, handleSubmit, reset, formState } = useForm({
    resolver: yupResolver(latitudeSchema),
    defaultValues,
  });

  useEffect(() => {
    if (state.matches('form.entering alternate latitude')) {
      send('SET_COORDINATES');
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
      <h3 className="text-2xl font-semibold">Location Information</h3>
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
                value={defaultValues.degrees}
                type="number"
                name="northing.degrees"
                label="Degrees"
                placeholder="###"
                min={0}
                max={42}
                required={true}
                inputRef={register}
              />
              <ErrorMessage
                errors={formState.errors}
                name="northing.degrees"
                as={ErrorMessageTag}
              />
            </div>
            <div>
              <Input
                value={defaultValues.minutes}
                type="number"
                name="northing.minutes"
                label="Minutes"
                placeholder="##"
                min={0}
                max={59}
                required={true}
                inputRef={register}
              />
              <ErrorMessage
                errors={formState.errors}
                name="northing.minutes"
                as={ErrorMessageTag}
              />
            </div>
            <div>
              <Input
                value={defaultValues.seconds}
                type="number"
                name="northing.seconds"
                label="Seconds"
                placeholder="##.00000"
                step="0.00001"
                min={0}
                max={59.99999}
                required={true}
                inputRef={register}
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
                send('RESTART');
                send('BACK');
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

  let defaultValues = {
    easting: state.context?.geographic?.easting ?? defaults,
  };

  const { register, handleSubmit, reset, formState } = useForm({
    resolver: yupResolver(longitudeSchema),
    defaultValues,
  });

  const onSubmit = (payload) => {
    send({ type: 'NEXT', meta, payload });
  };

  const onReset = () => {
    send({ type: 'RESET', meta, payload: { easting: defaults } });
    reset({ easting: defaults });
  };

  return (
    <>
      <h3 className="text-2xl font-semibold">Location Information</h3>
      <p className="text-sm leading-none">
        Geographic Easting for {formatDatum(state.context.datum)}
      </p>
      <Spacer className="my-4" />
      <NumberedForm onSubmit={handleSubmit(onSubmit)}>
        <NumberedFormSection number={3} title="Longitude">
          <div>
            <Input
              value={defaultValues.degrees}
              type="number"
              name="easting.degrees"
              label="Degrees"
              placeholder="###"
              min={0}
              max={59}
              required={true}
              inputRef={register}
            />
            <ErrorMessage
              errors={formState.errors}
              name="easting.degrees"
              as={ErrorMessageTag}
            />
          </div>
          <div>
            <Input
              value={defaultValues.minutes}
              type="number"
              label="Minutes"
              name="easting.minutes"
              placeholder="##"
              min={0}
              max={59}
              required={true}
              inputRef={register}
            />
            <ErrorMessage
              errors={formState.errors}
              name="easting.minutes"
              as={ErrorMessageTag}
            />
          </div>
          <div>
            <Input
              value={defaultValues.seconds}
              type="number"
              name="easting.seconds"
              label="Seconds"
              placeholder="##.00000"
              step="0.000001"
              min={0}
              max={59.99999}
              required={true}
              inputRef={register}
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
          <Wizard back={() => send('BACK')} next={true} clear={onReset} />
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

  const { control, register, handleSubmit, reset, formState } = useForm({
    resolver: yupResolver(geographicHeightSchema),
    defaultValues,
  });

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
      <h3 className="text-2xl font-semibold">Location Information</h3>
      <p className="text-sm leading-none">
        Geographic height for {formatDatum(state.context.datum)}
      </p>
      <Spacer className="my-4" />
      <NumberedForm onSubmit={handleSubmit(onSubmit)}>
        <NumberedFormSection number={4} title="Ellipsoid Height">
          <Input
            value={defaultValues.elevation}
            label={false}
            required={true}
            name="elevation"
            inputRef={register}
          />
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
                          : 'text-sky-700 hover:bg-sky-600/20'
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
          <Wizard back={() => send('BACK')} next={true} clear={onReset} />
        </NumberedFormSection>
      </NumberedForm>
    </>
  );
};
