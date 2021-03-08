import { DevTool } from '@hookform/devtools';
import { ErrorMessage } from '@hookform/error-message';
import { yupResolver } from '@hookform/resolvers/yup';
import clsx from 'clsx';
import { useStateMachine } from 'little-state-machine';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { useHistory, useParams } from 'react-router-dom';
import { Input, Select } from '../FormElements';
import ErrorMessageTag from '../FormElements/ErrorMessage';
import { updateAction } from './CornerSubmission';
import { accuracy, adjustment, geographic, grid, status } from './Options';
import { coordinatePickerSchema, latitudeSchema, longitudeSchema, nad83GeographicHeightSchema } from './Schema';
import Wizard from './Wizard';

export const CoordinatePicker = () => {
  const { push, goBack } = useHistory();
  const { state, actions } = useStateMachine({ updateAction });
  const { register, errors, control, handleSubmit, reset, formState } = useForm({
    defaultValues: state.newSheet,
    resolver: yupResolver(coordinatePickerSchema),
  });
  const { touched } = formState;
  const [active, setActive] = React.useState(state.newSheet?.datum?.split('-')[0] ?? 'grid');

  const onSubmit = (data) => {
    actions.updateAction(data);
    push(`/${data.blmPointNumber}/coordinates/geographic/${data.datum.split('-')[1]}/northing`);
  };

  const getClasses = (left, active) =>
    clsx(
      'inline-block px-4 py-2 transition duration-100 ease-in-out border border-transparent shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none focus:ring-opacity-50',
      { 'rounded-l': left },
      { 'rounded-r': !left },
      { 'text-white bg-gray-500 hover:bg-indigo-600': !active },
      { 'text-white bg-indigo-500 hover:text-white hover:bg-indigo-600': active }
    );

  return (
    <form className="inline-grid w-full gap-2" onSubmit={handleSubmit(onSubmit)}>
      <DevTool control={control} />
      <label className="font-semibold">Collected coordinate format</label>
      <div className="flex justify-center mb-6">
        <button
          name="grid"
          type="button"
          className={getClasses(true, active === 'grid')}
          onClick={() => setActive('grid')}
        >
          Grid
        </button>
        <button
          name="geographic"
          type="button"
          className={getClasses(false, active === 'geographic')}
          onClick={() => setActive('geographic')}
        >
          Geographic
        </button>
      </div>
      <div>
        {active ? (
          <>
            <Select
              name="datum"
              value={state.datum}
              placeholder={`Choose the ${active === 'grid' ? 'datum' : 'coordinate system'}`}
              options={active === 'grid' ? grid : geographic}
              inputRef={register}
              touched={touched?.datum}
            />
            <ErrorMessage errors={errors} name="datum" as={ErrorMessageTag} />
          </>
        ) : null}
      </div>
      <Wizard back={() => goBack()} next={true} clear={reset} />
    </form>
  );
};

export const Latitude = () => {
  const { state, actions } = useStateMachine({ updateAction });
  const { push, goBack } = useHistory();
  const { register, errors, control, handleSubmit, reset, formState } = useForm({
    defaultValues: state.newSheet,
    resolver: yupResolver(latitudeSchema),
  });

  const { touched } = formState;
  const { system } = useParams();

  const onSubmit = (data) => {
    actions.updateAction(data);
    push(`/${data.blmPointNumber}/coordinates/geographic/${system}/easting`);
  };

  return (
    <form className="inline-grid w-full gap-2" onSubmit={handleSubmit(onSubmit)}>
      <DevTool control={control} />
      <label className="font-semibold" htmlFor="geographic">
        Geographic Coordinates {system}
      </label>
      <div>
        <label htmlFor="northing.direction" className="font-semibold">
          Latitude
        </label>
      </div>
      <div>
        <label htmlFor="northing.degrees" className="font-semibold">
          Degrees
        </label>
        <Input
          value={state.northing?.degrees}
          placeholder="###"
          name="northing.degrees"
          inputRef={register}
          touched={touched?.northing?.degrees}
        />
        <ErrorMessage errors={errors} name="northing.degrees" as={ErrorMessageTag} />
      </div>
      <div>
        <label htmlFor="northing.minutes" className="font-semibold">
          Minutes
        </label>
        <Input
          value={state.northing?.minutes}
          placeholder="##"
          name="northing.minutes"
          inputRef={register}
          touched={touched?.northing?.minutes}
        />
        <ErrorMessage errors={errors} name="northing.minutes" as={ErrorMessageTag} />
      </div>
      <div>
        <label htmlFor="northing.seconds" className="font-semibold">
          Seconds
        </label>
        <Input
          value={state.northing?.seconds}
          placeholder="##.00000"
          name="northing.seconds"
          inputRef={register}
          touched={touched?.northing?.seconds}
        />
        <p class="text-sm text-gray-300">5 Decimals ##.#####</p>
        <ErrorMessage errors={errors} name="northing.seconds" as={ErrorMessageTag} />
      </div>
      <Wizard back={() => goBack()} next={true} clear={reset} />
    </form>
  );
};

export const Longitude = () => {
  const { push, goBack } = useHistory();
  const { state, actions } = useStateMachine({ updateAction });
  const { register, errors, control, handleSubmit, reset, formState } = useForm({
    defaultValues: state.newSheet,
    resolver: yupResolver(longitudeSchema),
  });

  const { touched } = formState;
  const { system } = useParams();

  const onSubmit = (data) => {
    actions.updateAction(data);
    push(`/${data.blmPointNumber}/coordinates/geographic/${system}/height`);
  };

  return (
    <form className="inline-grid w-full gap-2" onSubmit={handleSubmit(onSubmit)}>
      <DevTool control={control} />
      <label className="font-semibold" htmlFor="geographic">
        Geographic northings {system}
      </label>
      <div>
        <label htmlFor="easting.direction" className="font-semibold">
          Longitude
        </label>
      </div>
      <div>
        <label htmlFor="easting.degrees" className="font-semibold">
          Degrees
        </label>
        <Input
          value={state.easting?.degrees}
          placeholder="###"
          name="easting.degrees"
          inputRef={register}
          touched={touched?.easting?.degrees}
        />
        <ErrorMessage errors={errors} name="easting.degrees" as={ErrorMessageTag} />
      </div>
      <div>
        <label htmlFor="easting.minutes" className="font-semibold">
          Minutes
        </label>
        <Input
          value={state.easting?.minutes}
          placeholder="##"
          name="easting.minutes"
          inputRef={register}
          touched={touched?.easting?.minutes}
        />
        <ErrorMessage errors={errors} name="easting.minutes" as={ErrorMessageTag} />
      </div>
      <div>
        <label htmlFor="easting.seconds" className="font-semibold">
          Seconds
        </label>
        <Input
          value={state.easting?.seconds}
          placeholder="##.00000"
          name="easting.seconds"
          inputRef={register}
          touched={touched?.easting?.seconds}
        />
        <p class="text-sm text-gray-300">5 Decimals ##.#####</p>
        <ErrorMessage errors={errors} name="easting.seconds" as={ErrorMessageTag} />
      </div>
      <Wizard back={() => goBack()} next={true} clear={reset} />
    </form>
  );
};

export const GeographicHeight = () => {
  const { push, goBack } = useHistory();
  const { state, actions } = useStateMachine({ updateAction });

  const { system } = useParams();

  const { register, errors, control, handleSubmit, reset, formState } = useForm({
    defaultValues: state.newSheet,
    resolver: yupResolver(nad83GeographicHeightSchema),
  });
  const { touched } = formState;

  const onSubmit = (data) => {
    actions.updateAction(data);
    push(`/${data.blmPointNumber}/review`);
  };

  return (
    <form className="inline-grid w-full gap-2" onSubmit={handleSubmit(onSubmit)}>
      <DevTool control={control} />
      <div>
        <label htmlFor="height" className="font-semibold">
          Ellipsoid Height
        </label>
        <div className="flex">
          <Input value={state?.height} name="height" inputRef={register} left={true} touched={touched?.height} />
          <Select
            name="unit"
            value={state?.unit}
            placeholder="unit"
            options={[
              { label: 'Meters', value: 'm' },
              { label: 'US Survey Feet', value: 'ft.survey' },
              { label: 'International Feet', value: 'ft' },
            ]}
            inputRef={register}
            className="bg-gray-200"
            right={true}
            touched={touched?.unit}
          />
        </div>
        <ErrorMessage errors={errors} name="height" as={ErrorMessageTag} />
        <ErrorMessage errors={errors} name="unit" as={ErrorMessageTag} />
      </div>
      {system === 'nad83' && (
        <div>
          <label htmlFor="adjustment" className="font-semibold">
            NGS Adjustment
          </label>
          <Select
            value={state.adjustment}
            placeholder="Select the year"
            name="adjustment"
            options={adjustment}
            inputRef={register}
            touched={touched?.adjustment}
          />
          <ErrorMessage errors={errors} name="adjustment" as={ErrorMessageTag} />
        </div>
      )}

      <Wizard back={() => goBack()} next={true} clear={reset} />
    </form>
  );
};

export const GridCoordinates = () => {
  const { state, actions } = useStateMachine({ updateAction });
  const { push } = useHistory();
  const { register, errors, handleSubmit, formState } = useForm({
    defaultValues: state.newSheet,
  });
  const { touched } = formState;

  const onSubmit = (data) => {
    actions.updateAction(data);
    push(`/${data.blmPointNumber}/coordinates/grid`);
  };

  return (
    <form className="inline-grid w-full gap-2" onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label className="font-semibold" htmlFor="grid">
          Grid Coordinates
        </label>
      </div>
      <div class="row">
        <div class="col-sm-6 form-group">
          <label for="Grid.Zone" className="font-semibold">
            State Plane Zone
          </label>
          <select class="form-control" name="Grid.Zone" data-required="true">
            <option>North Zone</option>
            <option>Central Zone</option>
            <option>South Zone</option>
          </select>
        </div>
        <div class="col-sm-6 form-group">
          <label for="Grid.HorizontalUnits" className="font-semibold">
            Horizontal Units
          </label>
          <select class="form-control" name="Grid.HorizontalUnits" data-required="true">
            <option>US Survey Feet</option>
            <option>International Feet</option>
            <option selected="selected">Meters</option>
          </select>
        </div>
      </div>
      <div class="row">
        <div class="col-sm-4 form-group">
          <label for="Grid.Northing" className="font-semibold">
            Northing
          </label>
          <input type="text" class="form-control" name="Grid.Northing" data-required="true" />
        </div>
        <div class="col-sm-4 form-group">
          <label for="Grid.Easting" className="font-semibold">
            Easting
          </label>
          <input type="text" class="form-control" name="Grid.Easting" data-required="true" />
        </div>
        <div class="col-sm-4 form-group">
          <label for="Grid.Elevation" className="font-semibold">
            NAVD88 Elevation
          </label>
          <input type="text" class="form-control" name="Grid.Elevation" data-required="true" />
        </div>
      </div>
    </form>
  );
};

const reverseLookup = (options, value) => options.filter((item) => item.value === value)[0].label;
const keyMap = {
  status: (value) => reverseLookup(status, value),
  accuracy: (value) => reverseLookup(accuracy, value),
  description: (value) => value,
  notes: (value) => value,
};

export const Review = () => {
  const { push, goBack } = useHistory();
  const { state, actions } = useStateMachine({ updateAction });

  const { id } = useParams();

  return (
    <div>
      {Object.keys(state.newSheet).map((x) => (
        <div className="flex justify-between" key={x}>
          <label className="font-semibold">{x}</label>
          <span>{x in keyMap && keyMap[x](state.newSheet[x])}</span>
        </div>
      ))}
    </div>
  );
};
