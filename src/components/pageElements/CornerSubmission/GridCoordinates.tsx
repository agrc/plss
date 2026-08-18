import { ErrorMessage } from '@hookform/error-message';
import { yupResolver } from '@hookform/resolvers/yup';
import { formatDatum } from '@ugrc/plss-shared';
import { statePlaneZones, units, verticalDatums } from '@ugrc/plss-shared/corner-submission/options';
import { type GridCoordinates as GridCoordinateValues, gridCoordinatesSchema } from '@ugrc/plss-shared/corner-submission/schema';
import { useEffect } from 'react';
import { Controller, type Resolver, type UseFormHandleSubmit, useForm } from 'react-hook-form';
import { useSubmissionContext } from '../../contexts/SubmissionContext.tsx';
import { Button } from '../../formElements/Buttons.tsx';
import { NumberedForm, NumberedFormSection } from '../../formElements/Form.tsx';
import { Input } from '../../formElements/Inputs.tsx';
import { Select } from '../../formElements/Select.tsx';
import Spacer from '../../formElements/Spacer.tsx';
import usePageView from '../../hooks/usePageView.ts';
import ErrorMessageTag from '../../pageElements/ErrorMessage.tsx';
import Wizard from './Wizard.tsx';

type GridFormValues = Omit<GridCoordinateValues, 'easting' | 'elevation' | 'northing' | 'unit' | 'verticalDatum' | 'zone'> & {
  easting: GridCoordinateValues['easting'] | '';
  elevation: GridCoordinateValues['elevation'] | '';
  northing: GridCoordinateValues['northing'] | '';
  unit: GridCoordinateValues['unit'] | '';
  verticalDatum: GridCoordinateValues['verticalDatum'] | '';
  zone: GridCoordinateValues['zone'] | '';
};

const defaults: GridFormValues = {
  zone: '',
  unit: '',
  northing: '',
  easting: '',
  elevation: '',
  verticalDatum: '',
};

const GridCoordinates = () => {
  const meta = 'grid';
  const [state, send] = useSubmissionContext();
  usePageView('screen-submission-grid-coordinates');

  const savedGrid = state.context.grid as Partial<GridFormValues> | undefined;
  const defaultValues: GridFormValues = { ...defaults, ...savedGrid };

  const { control, formState, handleSubmit, register, reset, setFocus } = useForm<GridFormValues>({
    resolver: yupResolver(gridCoordinatesSchema) as Resolver<GridFormValues>,
    defaultValues,
  });
  const typedHandleSubmit = handleSubmit as UseFormHandleSubmit<GridFormValues>;

  useEffect(() => {
    setFocus('zone');
  }, [setFocus]);

  useEffect(() => {
    if (state.matches({ form: 'entering alternate grid coordinates' })) {
      send({ type: 'SET_COORDINATES' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (state.matches({ form: 'entering alternate grid coordinates' }) && state.matches({ projecting: 'done' })) {
      reset({ ...defaults, ...(state.context.grid as Partial<GridFormValues>) });
    }
  }, [state, reset]);

  const onSubmit = (payload: GridFormValues) => {
    send({ type: 'NEXT', meta, payload });
  };

  const onReset = () => {
    send({ type: 'RESET', meta, payload: defaults });
    reset(defaults);
  };

  return (
    <>
      <h2 className="text-2xl font-semibold">Location Information</h2>
      <p className="text-sm leading-none">Grid coordinates for {formatDatum(state.context.datum)}</p>
      <Spacer className="my-4" />
      {state.matches({ projecting: 'rejected' }) && (
        <>
          <div>Error calculating state plane coordinates</div>
          <Button onClick={() => send({ type: 'BACK' })}>Try again</Button>
        </>
      )}
      {state.matches({ form: 'entering alternate grid coordinates' }) && !state.matches({ projecting: 'done' }) ? (
        <div>Projecting Grid Coordinates...</div>
      ) : (
        <NumberedForm onSubmit={typedHandleSubmit(onSubmit)}>
          <NumberedFormSection number={2} title="Zone and units">
            <div>
              <Controller
                control={control}
                name="zone"
                render={({ field }) => (
                  <Select
                    label="State Plane Zone"
                    placeholder="What is the zone"
                    options={statePlaneZones}
                    required={true}
                    {...field}
                  />
                )}
              />
              <ErrorMessage errors={formState.errors} name="zone" as={ErrorMessageTag} />
            </div>
            <div>
              <Controller
                control={control}
                name="unit"
                render={({ field }) => (
                  <Select label="Units" placeholder="What are the units" options={units} required={true} {...field} />
                )}
              />
              <ErrorMessage errors={formState.errors} name="unit" as={ErrorMessageTag} />
            </div>
          </NumberedFormSection>
          <NumberedFormSection number={3} title="Location">
            <div>
              <Input label="Northing" type="number" step="0.001" required={true} {...register('northing')} />
              <ErrorMessage errors={formState.errors} name="northing" as={ErrorMessageTag} />
            </div>
            <div>
              <Input label="Easting" type="number" step="0.001" required={true} {...register('easting')} />
              <ErrorMessage errors={formState.errors} name="easting" as={ErrorMessageTag} />
            </div>
          </NumberedFormSection>
          <NumberedFormSection number={4} title="Elevation">
            <div>
              <Controller
                control={control}
                name="verticalDatum"
                render={({ field }) => (
                  <Select
                    label="Vertical datum"
                    placeholder="What is the vertical datum"
                    options={verticalDatums}
                    required={false}
                    {...field}
                  />
                )}
              />
              <ErrorMessage errors={formState.errors} name="verticalDatum" as={ErrorMessageTag} />
            </div>
            <div>
              <Input type="number" label="Elevation" step="0.001" required={false} {...register('elevation')} />
              <ErrorMessage errors={formState.errors} name="elevation" as={ErrorMessageTag} />
            </div>
          </NumberedFormSection>
          <NumberedFormSection number={0} title={undefined}>
            <Wizard back={() => send({ type: 'BACK' })} next={true} clear={onReset} />
          </NumberedFormSection>
        </NumberedForm>
      )}
    </>
  );
};

export default GridCoordinates;
