import { useState } from 'react';
import { DevTool } from '@hookform/devtools';
import { ErrorMessage } from '@hookform/error-message';
import { yupResolver } from '@hookform/resolvers/yup';
import clsx from 'clsx';
import { useStateMachine } from 'little-state-machine';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { Input } from '../../formElements/Inputs.jsx';
import { Select } from '../../formElements/Select.jsx';
import ErrorMessageTag from '../../pageElements/ErrorMessage.jsx';
import { updateAction } from './CornerSubmission.jsx';
import { accuracy, adjustment, geographic, grid, status } from './Options';
import {
  coordinatePickerSchema,
  latitudeSchema,
  longitudeSchema,
  nad83GeographicHeightSchema,
} from './Schema';
import Wizard from './Wizard.jsx';

export const CoordinatePicker = () => {
  const navigate = useNavigate();
  const { state, actions } = useStateMachine({ updateAction });
  const { register, control, handleSubmit, reset, formState } = useForm({
    defaultValues: state.newSheet,
    resolver: yupResolver(coordinatePickerSchema),
  });
  const { touchedFields } = formState;
  const [active, setActive] = useState(
    state.newSheet?.datum?.split('-')[0] ?? 'grid'
  );

  const onSubmit = (data) => {
    actions.updateAction(data);
    navigate(
      `/submission/${data.blmPointId}/coordinates/geographic/${
        data.datum.split('-')[1]
      }/northing`
    );
  };

  const getClasses = (left, active) =>
    clsx(
      'inline-block px-4 py-2 transition duration-100 ease-in-out border border-transparent shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none focus:ring-opacity-50',
      { 'rounded-l': left },
      { 'rounded-r': !left },
      { 'text-white bg-slate-500 hover:bg-indigo-600': !active },
      {
        'text-white bg-indigo-500 hover:text-white hover:bg-indigo-600': active,
      }
    );

  return (
    <form
      className="inline-grid w-full gap-2"
      onSubmit={handleSubmit(onSubmit)}
    >
      <DevTool control={control} />
      <span className="font-semibold">Collected coordinate format</span>
      <div className="mb-6 flex justify-center">
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
              placeholder={`Choose the ${
                active === 'grid' ? 'datum' : 'coordinate system'
              }`}
              options={active === 'grid' ? grid : geographic}
              inputRef={register}
              touched={touchedFields?.datum}
            />
            <ErrorMessage
              errors={formState.errors}
              name="datum"
              as={ErrorMessageTag}
            />
          </>
        ) : null}
      </div>
      <Wizard back={() => navigate(-1)} next={true} clear={reset} />
    </form>
  );
};

export const Latitude = () => {
  const { state, actions } = useStateMachine({ updateAction });
  const navigate = useNavigate();
  const { register, control, handleSubmit, reset, formState } = useForm({
    defaultValues: state.newSheet,
    resolver: yupResolver(latitudeSchema),
  });

  const { touchedFields } = formState;
  const { system } = useParams();

  const onSubmit = (data) => {
    actions.updateAction(data);
    navigate(
      `/submission/${data.blmPointId}/coordinates/geographic/${system}/easting`
    );
  };

  return (
    <form
      className="inline-grid w-full gap-2"
      onSubmit={handleSubmit(onSubmit)}
    >
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
        <Input
          value={state.northing?.degrees}
          placeholder="###"
          name="northing.degrees"
          label="Degrees"
          inputRef={register}
          touched={touchedFields?.northing?.degrees}
        />
        <ErrorMessage
          errors={formState.errors}
          name="northing.degrees"
          as={ErrorMessageTag}
        />
      </div>
      <div>
        <Input
          value={state.northing?.minutes}
          label="Minutes"
          placeholder="##"
          name="northing.minutes"
          inputRef={register}
          touched={touchedFields?.northing?.minutes}
        />
        <ErrorMessage
          errors={formState.errors}
          name="northing.minutes"
          as={ErrorMessageTag}
        />
      </div>
      <div>
        <Input
          value={state.northing?.seconds}
          label="Seconds"
          placeholder="##.00000"
          name="northing.seconds"
          inputRef={register}
          touched={touchedFields?.northing?.seconds}
        />
        <p className="text-sm text-slate-300">5 Decimals ##.#####</p>
        <ErrorMessage
          errors={formState.errors}
          name="northing.seconds"
          as={ErrorMessageTag}
        />
      </div>
      <Wizard back={() => navigate(-1)} next={true} clear={reset} />
    </form>
  );
};

export const Longitude = () => {
  const navigate = useNavigate();
  const { state, actions } = useStateMachine({ updateAction });
  const { register, control, handleSubmit, reset, formState } = useForm({
    defaultValues: state.newSheet,
    resolver: yupResolver(longitudeSchema),
  });

  const { touchedFields } = formState;
  const { system } = useParams();

  const onSubmit = (data) => {
    actions.updateAction(data);
    navigate(
      `/submission/${data.blmPointId}/coordinates/geographic/${system}/height`
    );
  };

  return (
    <form
      className="inline-grid w-full gap-2"
      onSubmit={handleSubmit(onSubmit)}
    >
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
        <Input
          value={state.easting?.degrees}
          label="Degrees"
          placeholder="###"
          name="easting.degrees"
          inputRef={register}
          touched={touchedFields?.easting?.degrees}
        />
        <ErrorMessage
          errors={formState.errors}
          name="easting.degrees"
          as={ErrorMessageTag}
        />
      </div>
      <div>
        <Input
          value={state.easting?.minutes}
          label="Minutes"
          placeholder="##"
          name="easting.minutes"
          inputRef={register}
          touched={touchedFields?.easting?.minutes}
        />
        <ErrorMessage
          errors={formState.errors}
          name="easting.minutes"
          as={ErrorMessageTag}
        />
      </div>
      <div>
        <Input
          value={state.easting?.seconds}
          label="Seconds"
          placeholder="##.00000"
          name="easting.seconds"
          inputRef={register}
          touched={touchedFields?.easting?.seconds}
        />
        <p className="text-sm text-slate-300">5 Decimals ##.#####</p>
        <ErrorMessage
          errors={formState.errors}
          name="easting.seconds"
          as={ErrorMessageTag}
        />
      </div>
      <Wizard back={() => navigate(-1)} next={true} clear={reset} />
    </form>
  );
};

export const GeographicHeight = () => {
  const navigate = useNavigate();
  const { state, actions } = useStateMachine({ updateAction });

  const { system } = useParams();

  const { register, control, handleSubmit, reset, formState } = useForm({
    defaultValues: state.newSheet,
    resolver: yupResolver(nad83GeographicHeightSchema),
  });
  const { touchedFields } = formState;

  const onSubmit = (data) => {
    actions.updateAction(data);
    navigate(`/submission/${data.blmPointId}/review`);
  };

  return (
    <form
      className="inline-grid w-full gap-2"
      onSubmit={handleSubmit(onSubmit)}
    >
      <input type="hidden" name="system" value={system} />
      <DevTool control={control} />
      <div>
        <label htmlFor="height" className="font-semibold">
          Ellipsoid Height
        </label>
        <div className="flex">
          <Input
            value={state?.height}
            label={false}
            name="height"
            inputRef={register}
            left={true}
            touched={touchedFields?.height}
          />
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
            className="bg-slate-200"
            right={true}
            touched={touchedFields?.unit}
          />
        </div>
        <ErrorMessage
          errors={formState.errors}
          name="height"
          as={ErrorMessageTag}
        />
        <ErrorMessage
          errors={formState.errors}
          name="unit"
          as={ErrorMessageTag}
        />
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
            touched={touchedFields?.adjustment}
          />
          <ErrorMessage
            errors={formState.errors}
            name="adjustment"
            as={ErrorMessageTag}
          />
        </div>
      )}

      <Wizard back={() => navigate(-1)} next={true} clear={reset} />
    </form>
  );
};

export const GridCoordinates = () => {
  const { state, actions } = useStateMachine({ updateAction });
  const navigate = useNavigate();
  const { handleSubmit } = useForm({
    defaultValues: state.newSheet,
  });

  const onSubmit = (data) => {
    actions.updateAction(data);
    navigate(`/submission/${data.blmPointId}/coordinates/grid`);
  };

  return (
    <form
      className="inline-grid w-full gap-2"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div>
        <label className="font-semibold" htmlFor="grid">
          Grid Coordinates
        </label>
      </div>
      <div className="row">
        <div className="col-sm-6 form-group">
          <label htmlFor="Grid.Zone" className="font-semibold">
            State Plane Zone
          </label>
          <select
            className="form-control"
            name="Grid.Zone"
            data-required="true"
          >
            <option>North Zone</option>
            <option>Central Zone</option>
            <option>South Zone</option>
          </select>
        </div>
        <div className="col-sm-6 form-group">
          <label htmlFor="Grid.HorizontalUnits" className="font-semibold">
            Horizontal Units
          </label>
          <select
            className="form-control"
            name="Grid.HorizontalUnits"
            data-required="true"
          >
            <option>US Survey Feet</option>
            <option>International Feet</option>
            <option selected="selected">Meters</option>
          </select>
        </div>
      </div>
      <div className="row">
        <div className="col-sm-4 form-group">
          <label htmlFor="Grid.Northing" className="font-semibold">
            Northing
          </label>
          <input
            type="text"
            className="form-control"
            name="Grid.Northing"
            data-required="true"
          />
        </div>
        <div className="col-sm-4 form-group">
          <label htmlFor="Grid.Easting" className="font-semibold">
            Easting
          </label>
          <input
            type="text"
            className="form-control"
            name="Grid.Easting"
            data-required="true"
          />
        </div>
        <div className="col-sm-4 form-group">
          <label htmlFor="Grid.Elevation" className="font-semibold">
            NAVD88 Elevation
          </label>
          <input
            type="text"
            className="form-control"
            name="Grid.Elevation"
            data-required="true"
          />
        </div>
      </div>
    </form>
  );
};

const formatDegrees = (dms) =>
  `${dms.degrees}° ${dms.minutes}' ${dms.seconds}"`;
const formatDatum = (value) => {
  const [datum] = value.split('-');
  let options = grid;
  if (datum === 'geographic') {
    options = geographic;
  }

  return reverseLookup(options, value);
};
const reverseLookup = (options, value) =>
  options.filter((item) => item.value === value)[0].label;
const keyMap = {
  status: (value) => reverseLookup(status, value),
  accuracy: (value) => reverseLookup(accuracy, value),
  description: (value) => value,
  notes: (value) => value,
  datum: (value) => formatDatum(value),
  northing: (value) => formatDegrees(value),
  easting: (value) => formatDegrees(value),
  unit: (value) => value,
  adjustment: (value) => reverseLookup(adjustment, value),
  height: (value) => value,
};

export const Review = () => {
  const { state } = useStateMachine({ updateAction });
  const navigate = useNavigate();

  return (
    <>
      <div>
        {Object.keys(state.newSheet).map((x) => (
          <div className="flex justify-between" key={x}>
            <label className="font-semibold">{x}</label>
            <span>{x in keyMap && keyMap[x](state.newSheet[x])}</span>
          </div>
        ))}
      </div>
      <div className="mt-8 flex justify-center">
        <Wizard back={() => navigate(-1)} finish={() => {}} />
      </div>
    </>
  );
};
