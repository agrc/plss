import { Label, Radio, RadioGroup } from '@headlessui/react';
import { ErrorMessage } from '@hookform/error-message';
import { yupResolver } from '@hookform/resolvers/yup';
import { formatDatum } from '@ugrc/plss-shared';
import { units } from '@ugrc/plss-shared/corner-submission/options';
import {
  type GeographicHeight as GeographicHeightValues,
  type Latitude as LatitudeValues,
  type Longitude as LongitudeValues,
  geographicHeightSchema,
  latitudeSchema,
  longitudeSchema,
} from '@ugrc/plss-shared/corner-submission/schema';
import { clsx } from 'clsx';
import { useEffect, useState } from 'react';
import { Controller, type Resolver, type UseFormHandleSubmit, useForm } from 'react-hook-form';
import { useSubmissionContext } from '../../contexts/SubmissionContext.tsx';
import { NumberedForm, NumberedFormSection } from '../../formElements/Form.tsx';
import { Input } from '../../formElements/Inputs.tsx';
import Spacer from '../../formElements/Spacer.tsx';
import usePageView from '../../hooks/usePageView.ts';
import ErrorMessageTag from '../ErrorMessage.tsx';
import Wizard from './Wizard.tsx';

type DmsInput = {
  degrees: number | '';
  minutes: number | '';
  seconds: number | '';
};
type LatitudeFormValues = { northing: DmsInput };
type LongitudeFormValues = { easting: DmsInput };
type GeographicHeightFormValues = {
  elevation: GeographicHeightValues['elevation'] | '';
  unit: GeographicHeightValues['unit'] | '';
};

const defaults: DmsInput = {
  seconds: '',
  minutes: '',
  degrees: '',
};

export const Latitude = () => {
  const meta = 'geographic';
  const [state, send] = useSubmissionContext();
  usePageView('screen-geographic-coordinates-latitude');

  const defaultValues: LatitudeFormValues = {
    northing: (state.context.geographic?.northing as LatitudeValues['northing']) ?? defaults,
  };

  const { formState, handleSubmit, register, reset, setFocus } = useForm<LatitudeFormValues>({
    resolver: yupResolver(latitudeSchema) as Resolver<LatitudeFormValues>,
    defaultValues,
  });
  const typedHandleSubmit = handleSubmit as UseFormHandleSubmit<LatitudeFormValues>;

  useEffect(() => {
    setFocus('northing.degrees');
  }, [setFocus]);

  useEffect(() => {
    if (state.matches({ form: 'entering alternate latitude' })) {
      send({ type: 'SET_COORDINATES' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (state.matches({ form: 'entering alternate latitude' }) && state.matches({ projecting: 'done' })) {
      reset({ northing: state.context?.geographic?.northing });
    }
  }, [state, reset]);

  const onSubmit = (payload: LatitudeFormValues) => {
    send({ type: 'NEXT', meta, payload });
  };

  const onReset = () => {
    send({ type: 'RESET', meta, payload: { northing: defaults } });
    reset({ northing: defaults });
  };

  return (
    <>
      <h2 className="text-2xl font-semibold">Location Information</h2>
      <p className="text-sm leading-none">Geographic Northing for {formatDatum(state.context.datum)}</p>
      <Spacer className="my-4" />
      {state.matches({ form: 'entering alternate latitude' }) && !state.matches({ projecting: 'done' }) ? (
        <div>Projecting Grid Coordinates...</div>
      ) : (
        <NumberedForm onSubmit={typedHandleSubmit(onSubmit)}>
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
              <ErrorMessage errors={formState.errors} name="northing.degrees" as={ErrorMessageTag} />
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
              <ErrorMessage errors={formState.errors} name="northing.minutes" as={ErrorMessageTag} />
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
              <ErrorMessage errors={formState.errors} name="northing.seconds" as={ErrorMessageTag} />
            </div>
          </NumberedFormSection>
          <NumberedFormSection number={0} title={undefined}>
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
  const [state, send] = useSubmissionContext();
  usePageView('screen-geographic-coordinates-longitude');

  const defaultValues: LongitudeFormValues = {
    easting: (state.context.geographic?.easting as LongitudeValues['easting']) ?? defaults,
  };

  const { formState, handleSubmit, register, reset, setFocus } = useForm<LongitudeFormValues>({
    resolver: yupResolver(longitudeSchema) as Resolver<LongitudeFormValues>,
    defaultValues,
  });
  const typedHandleSubmit = handleSubmit as UseFormHandleSubmit<LongitudeFormValues>;

  useEffect(() => {
    setFocus('easting.degrees');
  }, [setFocus]);

  const onSubmit = (payload: LongitudeFormValues) => {
    send({ type: 'NEXT', meta, payload });
  };

  const onReset = () => {
    send({ type: 'RESET', meta, payload: { easting: defaults } });
    reset({ easting: defaults });
  };

  return (
    <>
      <h2 className="text-2xl font-semibold">Location Information</h2>
      <p className="text-sm leading-none">Geographic Easting for {formatDatum(state.context.datum)}</p>
      <Spacer className="my-4" />
      <NumberedForm onSubmit={typedHandleSubmit(onSubmit)}>
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
            <ErrorMessage errors={formState.errors} name="easting.degrees" as={ErrorMessageTag} />
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
            <ErrorMessage errors={formState.errors} name="easting.minutes" as={ErrorMessageTag} />
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
            <ErrorMessage errors={formState.errors} name="easting.seconds" as={ErrorMessageTag} />
          </div>
        </NumberedFormSection>
        <NumberedFormSection number={0} title={undefined}>
          <Wizard back={() => send({ type: 'BACK' })} next={true} clear={onReset} />
        </NumberedFormSection>
      </NumberedForm>
    </>
  );
};

const geographicHeightDefaults: GeographicHeightFormValues = {
  elevation: '',
  unit: 'm',
};

export const GeographicHeight = () => {
  const meta = 'geographic';
  const [state, send] = useSubmissionContext();
  usePageView('screen-geographic-coordinates-height');

  const geographic = state.context.geographic;
  const defaultValues: GeographicHeightFormValues = {
    unit: geographic?.unit as GeographicHeightFormValues['unit'],
    elevation: geographic?.elevation ?? '',
  };
  if (!defaultValues.unit) {
    defaultValues.unit = 'm';
  }

  const selectedUnit = units.find((x) => x.value === defaultValues.unit);

  const { control, formState, handleSubmit, register, reset, setFocus } = useForm<GeographicHeightFormValues>({
    resolver: yupResolver(geographicHeightSchema) as Resolver<GeographicHeightFormValues>,
    defaultValues,
  });
  const typedHandleSubmit = handleSubmit as UseFormHandleSubmit<GeographicHeightFormValues>;

  useEffect(() => {
    setFocus('elevation');
  }, [setFocus]);

  const [selected, setSelected] = useState(selectedUnit);

  const onSubmit = (payload: GeographicHeightFormValues) => {
    send({ type: 'NEXT', meta, payload });
  };

  const onReset = () => {
    send({ type: 'RESET', meta, payload: geographicHeightDefaults });
    reset(geographicHeightDefaults);
  };

  return (
    <>
      <h2 className="text-2xl font-semibold">Location Information</h2>
      <p className="text-sm leading-none">Geographic height for {formatDatum(state.context.datum)}</p>
      <Spacer className="my-4" />
      <NumberedForm onSubmit={typedHandleSubmit(onSubmit)}>
        <NumberedFormSection number={4} title="Ellipsoid Height">
          <label htmlFor="elevation" className="sr-only">
            Ellipsoid Height
          </label>
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
                <Label className="sr-only">Elevation unit</Label>
                {units.map((option) => (
                  <Radio
                    key={option.value}
                    value={option}
                    className={({ checked }) =>
                      clsx(
                        'flex h-10 w-full cursor-pointer items-center justify-center rounded-lg px-1.5 text-center leading-5 font-medium',
                        'ring-white/60 ring-offset-2 ring-offset-sky-400 focus:ring-2 focus:outline-hidden',
                        checked
                          ? 'border border-sky-600 bg-sky-500 text-white shadow-sm hover:border-sky-700 hover:bg-sky-600 focus:border-sky-500 focus:ring-sky-600 active:bg-sky-700'
                          : 'text-sky-700 hover:bg-sky-600/20',
                      )
                    }
                  >
                    {({ checked }) => (
                      <div className="text-sm">
                        <Label as="p" className={`font-medium ${checked ? 'text-white' : 'text-sky-700'}`}>
                          {option.label}
                        </Label>
                      </div>
                    )}
                  </Radio>
                ))}
              </RadioGroup>
            )}
          />
          <ErrorMessage errors={formState.errors} name="elevation" as={ErrorMessageTag} />
          <ErrorMessage errors={formState.errors} name="unit" as={ErrorMessageTag} />
        </NumberedFormSection>
        <NumberedFormSection number={0} title={undefined}>
          <Wizard back={() => send({ type: 'BACK' })} next={true} clear={onReset} />
        </NumberedFormSection>
      </NumberedForm>
    </>
  );
};
