import { useContext, useState } from 'react';
import { ErrorMessage } from '@hookform/error-message';
import { yupResolver } from '@hookform/resolvers/yup';
import clsx from 'clsx';
import { Controller, useForm } from 'react-hook-form';
import { DevTool } from '@hookform/devtools';
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
    northing: state.context?.geographic?.northing ?? {},
  };

  if (!defaultValues?.northing) {
    defaultValues = { northing: defaults };
  }

  const { register, handleSubmit, reset, formState } = useForm({
    resolver: yupResolver(latitudeSchema),
    defaultValues,
  });

  if (state.matches('form.entering alternate latitude')) {
    send('SET_COORDINATES');
  }

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
      {!state.matches('projecting.done') ? (
        <div>Projecting Grid Coordinates...</div>
      ) : (
        <NumberedForm onSubmit={handleSubmit(onSubmit)}>
          <NumberedFormSection number={2} title="Latitude">
            <div>
              <Input
                value={defaultValues.degrees}
                placeholder="###"
                name="northing.degrees"
                label="Degrees"
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
                label="Minutes"
                required={true}
                placeholder="##"
                name="northing.minutes"
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
                label="Seconds"
                required={true}
                placeholder="##.00000"
                name="northing.seconds"
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

  let defaultValues = state.context?.geographic?.easting;

  if (!defaultValues) {
    defaultValues = defaults;
  }

  const { register, handleSubmit, reset, formState } = useForm({
    defaultValues,
    resolver: yupResolver(longitudeSchema),
  });

  const onSubmit = (payload) => {
    send({ type: 'NEXT', meta, payload });
  };

  const onReset = () => {
    send({ type: 'RESET', meta, payload: defaults });
    reset(defaults);
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
              label="Degrees"
              required={true}
              placeholder="###"
              name="easting.degrees"
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
              label="Minutes"
              required={true}
              placeholder="##"
              name="easting.minutes"
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
              label="Seconds"
              required={true}
              placeholder="##.00000"
              name="easting.seconds"
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
  units: 'm',
};

export const GeographicHeight = () => {
  const meta = 'geographic';
  const [state, send] = useContext(SubmissionContext);

  let defaultValues = state.context?.geographic;
  if (!defaultValues) {
    defaultValues = geographicHeightDefaults;
  }
  if (!defaultValues.unit) {
    defaultValues.unit = 'm';
  }

  const selectedUnit = units.find((x) => x.value === defaultValues.unit);

  const { control, register, handleSubmit, reset, formState } = useForm({
    defaultValues: geographicHeightDefaults,
    resolver: yupResolver(geographicHeightSchema),
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
          <DevTool control={control} />
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
                className="flex space-x-1 rounded-xl bg-slate-900/20 p-1"
                value={selected}
                onChange={(option) => {
                  onChange(option.value);
                  setSelected(option);
                }}
              >
                <RadioGroup.Label className="sr-only">
                  Elevation unit
                </RadioGroup.Label>
                {units
                  .filter((x) => x.value !== 'ft.survey')
                  .map((option) => (
                    <RadioGroup.Option
                      key={option.value}
                      value={option}
                      className={({ checked }) =>
                        clsx(
                          'flex h-10 w-full cursor-pointer items-center justify-center rounded-lg px-1.5 text-center font-medium leading-5',
                          'ring-white ring-opacity-60 ring-offset-2 ring-offset-indigo-400 focus:outline-none focus:ring-2',
                          checked
                            ? 'border border-indigo-600 bg-indigo-500 text-white shadow hover:border-indigo-700 hover:bg-indigo-600 focus:border-indigo-500 focus:ring-indigo-600 active:bg-indigo-700'
                            : 'text-indigo-100 hover:bg-white/[0.12] hover:text-white'
                        )
                      }
                    >
                      {({ checked }) => (
                        <div className="text-sm">
                          <RadioGroup.Label
                            as="p"
                            className={`font-medium ${
                              checked ? 'text-white' : 'text-indigo-100'
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
