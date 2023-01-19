import { useContext, useEffect } from 'react';
import { ErrorMessage } from '@hookform/error-message';
import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, useForm } from 'react-hook-form';
import { Input } from '../../formElements/Inputs.jsx';
import { Select } from '../../formElements/Select.jsx';
import Spacer from '../../formElements/Spacer.jsx';
import { NumberedForm, NumberedFormSection } from '../../formElements/Form.jsx';
import ErrorMessageTag from '../../pageElements/ErrorMessage.jsx';
import { SubmissionContext } from '../../contexts/SubmissionContext.jsx';
import { units, statePlaneZones, verticalDatums } from './Options.mjs';
import { gridCoordinatesSchema } from './Schema.mjs';
import Wizard from './Wizard.jsx';
import { formatDatum } from '../../helpers/index.mjs';
import usePageView from '../../hooks/usePageView.jsx';

const defaults = {
  zone: '',
  unit: '',
  northing: '',
  easting: '',
  elevation: '',
  verticalDatum: '',
};

const GridCoordinates = () => {
  const meta = 'grid';
  const [state, send] = useContext(SubmissionContext);
  usePageView('screen-submission-grid-coordinates');

  let defaultValues = state.context.grid;
  if (!defaultValues) {
    defaultValues = defaults;
  }

  const { control, formState, handleSubmit, register, reset, setFocus } =
    useForm({
      resolver: yupResolver(gridCoordinatesSchema),
      defaultValues,
    });

  useEffect(() => {
    setFocus('zone');
  }, [setFocus]);

  useEffect(() => {
    if (state.matches('form.entering alternate grid coordinates')) {
      send('SET_COORDINATES');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (
      state.matches('form.entering alternate grid coordinates') &&
      state.matches('projecting.done')
    ) {
      reset({ ...state.context?.grid });
    }
  }, [state, reset]);

  const onSubmit = (payload) => {
    send({ type: 'NEXT', meta, payload });
  };

  const onReset = () => {
    send({ type: 'RESET', meta, payload: defaults });
    reset(defaults);
  };

  return (
    <>
      <h2 className="text-2xl font-semibold">Location Information</h2>
      <p className="text-sm leading-none">
        Grid coordinates for {formatDatum(state.context.datum)}
      </p>
      <Spacer className="my-4" />
      {state.matches('projecting.rejected') && (
        <div>Error calculating state plane coordinates</div>
      )}
      {state.matches('form.entering alternate grid coordinates') &&
      !state.matches('projecting.done') ? (
        <div>Projecting Grid Coordinates...</div>
      ) : (
        <NumberedForm onSubmit={handleSubmit(onSubmit)}>
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
              <ErrorMessage
                errors={formState.errors}
                name="zone"
                as={ErrorMessageTag}
              />
            </div>
            <div>
              <Controller
                control={control}
                name="unit"
                render={({ field }) => (
                  <Select
                    label="Units"
                    placeholder="What are the units"
                    options={units}
                    required={true}
                    {...field}
                  />
                )}
              />
              <ErrorMessage
                errors={formState.errors}
                name="unit"
                as={ErrorMessageTag}
              />
            </div>
          </NumberedFormSection>
          <NumberedFormSection number={3} title="Location">
            <div>
              <Input
                label="Northing"
                type="number"
                step="0.001"
                required={true}
                {...register('northing')}
              />
              <ErrorMessage
                errors={formState.errors}
                name="northing"
                as={ErrorMessageTag}
              />
            </div>
            <div>
              <Input
                label="Easting"
                type="number"
                step="0.001"
                required={true}
                {...register('easting')}
              />
              <ErrorMessage
                errors={formState.errors}
                name="easting"
                as={ErrorMessageTag}
              />
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
              <ErrorMessage
                errors={formState.errors}
                name="verticalDatum"
                as={ErrorMessageTag}
              />
            </div>
            <div>
              <Input
                type="number"
                label="Elevation"
                step="0.001"
                required={false}
                {...register('elevation')}
              />
              <ErrorMessage
                errors={formState.errors}
                name="elevation"
                as={ErrorMessageTag}
              />
            </div>
          </NumberedFormSection>
          <NumberedFormSection number={0}>
            <Wizard back={() => send('BACK')} next={true} clear={onReset} />
          </NumberedFormSection>
        </NumberedForm>
      )}
    </>
  );
};

export default GridCoordinates;
