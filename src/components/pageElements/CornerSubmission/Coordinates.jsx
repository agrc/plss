import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { ErrorMessage } from '@hookform/error-message';
import { yupResolver } from '@hookform/resolvers/yup';
import clsx from 'clsx';
import { useStateMachine } from 'little-state-machine';
import { Controller, useForm } from 'react-hook-form';
import { DevTool } from '@hookform/devtools';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { RadioGroup, Tab } from '@headlessui/react';
import { httpsCallable } from 'firebase/functions';
import { useFunctions } from 'reactfire';
import { Input } from '../../formElements/Inputs.jsx';
import { Select } from '../../formElements/Select.jsx';
import ErrorMessageTag from '../../pageElements/ErrorMessage.jsx';
import {
  updateAction,
  getStateForId,
  getStateValue,
} from './CornerSubmission.jsx';
import {
  adjustment,
  geographic,
  grid,
  height,
  statePlaneZones,
} from './Options.mjs';
import {
  coordinatePickerSchema,
  latitudeSchema,
  longitudeSchema,
  nad83GeographicHeightSchema,
  gridCoordinatesSchema,
} from './Schema';
import Wizard from './Wizard.jsx';
import { keyMap, formatDatum } from '../../helpers/index.mjs';

const formats = { Grid: grid, Geographic: geographic };
const geographicConfiguration = {
  adjustment: ['geographic-nad83'],
};
const gridConfiguration = {
  zone: ['grid-nad83.state-plane', 'grid-nad27'],
  adjustment: [
    'grid-nad83.state-plane',
    'grid-nad83.utm12n',
    'grid-nad83.utm11n',
  ],
};

const getOpenTabIndex = (datum) => {
  if (!datum) {
    return 0;
  }

  if (datum.indexOf('-') < 0) {
    return 0;
  }

  datum = datum.split('-')[0];

  const index = datum === 'grid' ? 0 : 1;

  return index;
};

const getDatumParts = (input) => {
  // format grid-nad83.state-plane | grid-nad27
  const formatted = formatDatum(input);
  let parts = input;
  let zone;

  if (input.indexOf('.') > -1) {
    [parts, zone] = input.split('.');
  }

  const [coordinateType, datum] = parts.split('-');

  return {
    original: input,
    formatted,
    coordinateType,
    datum,
    zone,
  };
};

export const CoordinatePicker = () => {
  let { id } = useParams();
  const navigate = useNavigate();
  const { state, actions } = useStateMachine({ updateAction });
  const { control, handleSubmit, reset, formState } = useForm({
    defaultValues: getStateForId(state, id),
    resolver: yupResolver(coordinatePickerSchema),
  });
  const [selectedTab, setSelectedTab] = useState(0);

  useEffect(() => {
    setSelectedTab(getOpenTabIndex(getStateValue(state, id, 'datum')));
  }, [state, id]);

  const onSubmit = (data) => {
    actions.updateAction(data);
    const [datum, system] = data.datum.split('-');
    navigate(
      `/submission/${id}/coordinates/${datum}/${system}/${
        datum === 'geographic' ? 'northing' : ''
      }`
    );
  };

  return (
    <form
      className="inline-grid w-full gap-2"
      onSubmit={handleSubmit(onSubmit)}
    >
      <span className="font-semibold">Collected coordinate format</span>
      <Tab.Group selectedIndex={selectedTab}>
        <Tab.List className="flex space-x-1 rounded-xl bg-slate-900/20 p-1">
          {Object.keys(formats).map((category) => (
            <Tab
              key={category}
              className={({ selected }) =>
                clsx(
                  'w-full rounded-lg py-2.5 font-medium leading-5',
                  'ring-white ring-opacity-60 ring-offset-2 ring-offset-indigo-400 focus:outline-none focus:ring-2',
                  selected
                    ? 'border border-indigo-600 bg-indigo-500 text-white shadow hover:border-indigo-700 hover:bg-indigo-600 focus:border-indigo-500 focus:ring-indigo-600 active:bg-indigo-700'
                    : 'text-indigo-100 hover:bg-white/[0.12] hover:text-white'
                )
              }
            >
              {category}
            </Tab>
          ))}
        </Tab.List>
        <Tab.Panels className="mt-2">
          {Object.values(formats).map((options, idx) => (
            <Tab.Panel key={idx}>
              <Controller
                control={control}
                name="datum"
                render={({ field: { onChange, name } }) => (
                  <Select
                    name={name}
                    options={options}
                    placeholder="Coordinate System"
                    currentValue={getStateValue(state, id, name)}
                    onUpdate={onChange}
                  />
                )}
              />
              <ErrorMessage
                errors={formState.errors}
                name="datum"
                as={ErrorMessageTag}
              />
            </Tab.Panel>
          ))}
        </Tab.Panels>
      </Tab.Group>
      <Wizard
        back={() => navigate(-1)}
        next={true}
        clear={() => {
          reset({ datum: '' });
        }}
      />
      <DevTool control={control} />
    </form>
  );
};

export const Latitude = () => {
  const { id, system } = useParams();
  const { state, actions } = useStateMachine({ updateAction });
  const navigate = useNavigate();
  const { register, handleSubmit, reset, formState } = useForm({
    defaultValues: getStateForId(state, id),
    resolver: yupResolver(latitudeSchema),
  });

  const onSubmit = (data) => {
    actions.updateAction(data);
    navigate(`/submission/${id}/coordinates/geographic/${system}/easting`);
  };

  return (
    <form
      className="inline-grid w-full gap-2"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div>
        <h3 className="text-2xl font-semibold">Geographic Easting</h3>
        <p className="text-sm leading-none">
          {formatDatum(getStateValue(state, id, 'datum'))}
        </p>
      </div>
      <p className="font-semibold">Latitude</p>
      <div>
        <Input
          value={getStateValue(state, id, 'degrees')}
          placeholder="###"
          name="geographic.northing.degrees"
          label="Degrees"
          inputRef={register}
        />
        <ErrorMessage
          errors={formState.errors}
          name="geographic.northing.degrees"
          as={ErrorMessageTag}
        />
      </div>
      <div>
        <Input
          value={getStateValue(state, id, 'minutes')}
          label="Minutes"
          placeholder="##"
          name="geographic.northing.minutes"
          inputRef={register}
        />
        <ErrorMessage
          errors={formState.errors}
          name="geographic.northing.minutes"
          as={ErrorMessageTag}
        />
      </div>
      <div>
        <Input
          value={getStateValue(state, id, 'seconds')}
          label="Seconds"
          placeholder="##.00000"
          name="geographic.northing.seconds"
          inputRef={register}
        />
        <p className="text-sm text-slate-300">5 Decimals ##.#####</p>
        <ErrorMessage
          errors={formState.errors}
          name="geographic.northing.seconds"
          as={ErrorMessageTag}
        />
      </div>
      <Wizard
        back={() => navigate(-1)}
        next={true}
        clear={() =>
          reset({
            'geographic.northing.seconds': '',
            'geographic.northing.minutes': '',
            'geographic.northing.degrees': '',
          })
        }
      />
    </form>
  );
};

export const Longitude = () => {
  const { id, system } = useParams();
  const navigate = useNavigate();
  const { state, actions } = useStateMachine({ updateAction });
  const { register, handleSubmit, reset, formState } = useForm({
    defaultValues: getStateForId(state, id),
    resolver: yupResolver(longitudeSchema),
  });

  const onSubmit = (data) => {
    actions.updateAction(data);
    navigate(`/submission/${id}/coordinates/geographic/${system}/height`);
  };

  return (
    <form
      className="inline-grid w-full gap-2"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div>
        <h3 className="text-2xl font-semibold">Geographic Northing</h3>
        <p className="text-sm leading-none">
          {formatDatum(getStateValue(state, id, 'datum'))}
        </p>
      </div>
      <p className="font-semibold">Longitude</p>
      <div>
        <Input
          value={getStateValue(state, id, 'degrees')}
          label="Degrees"
          placeholder="###"
          name="geographic.easting.degrees"
          inputRef={register}
        />
        <ErrorMessage
          errors={formState.errors}
          name="geographic.easting.degrees"
          as={ErrorMessageTag}
        />
      </div>
      <div>
        <Input
          value={getStateValue(state, id, 'minutes')}
          label="Minutes"
          placeholder="##"
          name="geographic.easting.minutes"
          inputRef={register}
        />
        <ErrorMessage
          errors={formState.errors}
          name="geographic.easting.minutes"
          as={ErrorMessageTag}
        />
      </div>
      <div>
        <Input
          value={getStateValue(state, id, 'seconds')}
          label="Seconds"
          placeholder="##.00000"
          name="geographic.easting.seconds"
          inputRef={register}
        />
        <p className="text-sm text-slate-300">5 Decimals ##.#####</p>
        <ErrorMessage
          errors={formState.errors}
          name="geographic.easting.seconds"
          as={ErrorMessageTag}
        />
      </div>
      <Wizard
        back={() => navigate(-1)}
        next={true}
        clear={() => {
          reset({
            'geographic.easting.seconds': '',
            'geographic.easting.minutes': '',
            'geographic.easting.degrees': '',
          });
        }}
      />
    </form>
  );
};

export const GeographicHeight = () => {
  const { id, system } = useParams();
  const navigate = useNavigate();
  const { state, actions } = useStateMachine({ updateAction });

  const { control, register, handleSubmit, reset, formState } = useForm({
    defaultValues: getStateForId(state, id),
    resolver: yupResolver(nad83GeographicHeightSchema),
  });

  const [selected, setSelected] = useState(height[0]);
  const datum = getStateValue(state, id, 'datum');

  const onSubmit = (data) => {
    actions.updateAction(data);
    navigate(`/submission/${id}/review`);
  };

  return (
    <form
      className="inline-grid w-full gap-2"
      onSubmit={handleSubmit(onSubmit)}
    >
      <input type="hidden" name="system" value={system} />
      <label htmlFor="geographic.height" className="font-semibold">
        Ellipsoid Height
      </label>
      <Input
        value={getStateValue(state, id, 'height')}
        label={false}
        name="geographic.height"
        inputRef={register}
      />
      <Controller
        control={control}
        name="geographic.unit"
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
            {height.map((option) => (
              <RadioGroup.Option
                key={option.value}
                value={option}
                className={({ checked }) =>
                  clsx(
                    'flex w-full cursor-pointer items-center justify-center rounded-lg px-1.5 text-center font-medium leading-5',
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
        name="geographic.height"
        as={ErrorMessageTag}
      />
      <ErrorMessage
        errors={formState.errors}
        name="geographic.unit"
        as={ErrorMessageTag}
      />
      {gridConfiguration.adjustment.includes(datum) && (
        <div>
          <label htmlFor="geographic.adjustment" className="font-semibold">
            NGS Adjustment
          </label>
          <Controller
            control={control}
            name="geographic.adjustment"
            render={({ field: { onChange, name } }) => (
              <Select
                name={name}
                options={adjustment}
                placeholder="Select the year"
                currentValue={getStateValue(state, id, 'adjustment')}
                onUpdate={onChange}
              />
            )}
          />
          <ErrorMessage
            errors={formState.errors}
            name="geographic.adjustment"
            as={ErrorMessageTag}
          />
        </div>
      )}

      <Wizard back={() => navigate(-1)} next={true} clear={reset} />
    </form>
  );
};

export const GridCoordinates = () => {
  const { id } = useParams();
  const { state, actions } = useStateMachine({ updateAction });
  const navigate = useNavigate();
  const { control, register, handleSubmit, reset, formState } = useForm({
    defaultValues: getStateForId(state, id),
    resolver: yupResolver(gridCoordinatesSchema),
  });

  const datum = getStateValue(state, id, 'datum');

  const onSubmit = (data) => {
    actions.updateAction(data);
    navigate(`/submission/${id}/review`);
  };

  return (
    <form
      className="inline-grid w-full gap-2"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div>
        <h3 className="text-2xl font-semibold">Grid Coordinates</h3>
        <p className="text-sm leading-none">
          {formatDatum(getStateValue(state, id, 'datum'))}
        </p>
      </div>
      {gridConfiguration.zone.includes(datum) && (
        <div>
          <label htmlFor="grid.zone" className="font-semibold">
            State plane zone
          </label>
          <Controller
            control={control}
            name="grid.zone"
            render={({ field: { onChange, name } }) => (
              <Select
                name={name}
                options={statePlaneZones}
                placeholder="What is the zone"
                currentValue={getStateValue(state, id, name)}
                onUpdate={onChange}
              />
            )}
          />
          <ErrorMessage
            errors={formState.errors}
            name="grid.zone"
            as={ErrorMessageTag}
          />
        </div>
      )}
      <div>
        <label htmlFor="grid.unit" className="font-semibold">
          Horizontal units
        </label>
        <Controller
          control={control}
          name="grid.unit"
          render={({ field: { onChange, name } }) => (
            <Select
              name={name}
              options={height}
              placeholder="What are the units"
              currentValue={getStateValue(state, id, name)}
              onUpdate={onChange}
            />
          )}
        />
        <ErrorMessage
          errors={formState.errors}
          name="grid.unit"
          as={ErrorMessageTag}
        />
      </div>
      {gridConfiguration.adjustment.includes(datum) && (
        <div>
          <label htmlFor="grid.adjustment" className="font-semibold">
            NGS Adjustment
          </label>
          <Controller
            control={control}
            name="grid.adjustment"
            render={({ field: { onChange, name } }) => (
              <Select
                name={name}
                options={adjustment}
                placeholder="What is the zone"
                currentValue={getStateValue(state, id, name)}
                onUpdate={onChange}
              />
            )}
          />
          <ErrorMessage
            errors={formState.errors}
            name="grid.adjustment"
            as={ErrorMessageTag}
          />
        </div>
      )}
      <div>
        <label htmlFor="grid.northing" className="font-semibold">
          Northing
        </label>
        <Input
          value={getStateValue(state, id, 'northing')}
          type="number"
          label={false}
          name="grid.northing"
          inputRef={register}
        />
        <ErrorMessage
          errors={formState.errors}
          name="grid.northing"
          as={ErrorMessageTag}
        />
      </div>
      <div>
        <label htmlFor="grid.easting" className="font-semibold">
          Easting
        </label>
        <Input
          value={getStateValue(state, id, 'easting')}
          type="number"
          label={false}
          name="grid.easting"
          inputRef={register}
        />
        <ErrorMessage
          errors={formState.errors}
          name="grid.easting"
          as={ErrorMessageTag}
        />
      </div>
      <div>
        <label htmlFor="grid.elevation" className="font-semibold">
          NAVD88 elevation
        </label>
        <Input
          value={getStateValue(state, id, 'grid.elevation')}
          type="number"
          label={false}
          name="grid.elevation"
          inputRef={register}
        />
        <ErrorMessage
          errors={formState.errors}
          name="grid.elevation"
          as={ErrorMessageTag}
        />
      </div>
      <Wizard
        back={() => navigate(-1)}
        next={true}
        clear={() =>
          reset({
            'grid.zone': '',
            'grid.adjustment': '',
            'grid.unit': '',
            'grid.northing': '',
            'grid.easting': '',
            'grid.elevation': '',
          })
        }
      />
    </form>
  );
};

export const Review = () => {
  const { id } = useParams();
  const { state, actions } = useStateMachine({ updateAction });
  const navigate = useNavigate();
  const data = getStateForId(state, id);
  const functions = useFunctions();
  const saveCorner = httpsCallable(functions, 'functions-httpsPostCorner');
  const { mutate } = useMutation(
    ['save-corner', id],
    (data) => saveCorner(data),
    {
      onSuccess: (response) => {
        console.log('success', response);
        delete state[id];
        actions.updateAction(state);
        navigate('/', { replace: true });
      },
      onError: (error) => {
        console.log('error', error);
      },
    }
  );

  return (
    <>
      <div className="grid gap-2">
        <MetadataReview blmPointId={data.blmPointId} {...data.metadata} />
        <CoordinateReview
          datum={data.datum}
          grid={data.grid}
          geographic={data.geographic}
        />
      </div>
      <div className="mt-8 flex justify-center">
        <Wizard
          back={() => navigate(-1)}
          finish={async () => {
            await mutate(data);
          }}
        />
      </div>
    </>
  );
};

const MetadataReview = ({
  blmPointId,
  status,
  notes,
  description,
  accuracy,
}) => {
  return (
    <>
      <div className="mb-4 flex flex-col text-center">
        <h2 className="text-xl font-bold uppercase">Corner submission for</h2>
        <p className="text-lg font-bold">{blmPointId}</p>
      </div>
      <div className="flex flex-col">
        <span className="font-semibold">Monument Status</span>
        <span className="ml-4">{keyMap.status(status)}</span>
      </div>
      <div className="flex flex-col">
        <span className="font-semibold">Accuracy</span>
        <span className="ml-4">{keyMap.accuracy(accuracy)}</span>
      </div>
      <div className="flex flex-col">
        <span className="font-semibold">Monument Description</span>
        <span className="ml-4">{description}</span>
      </div>
      <div className="flex flex-col">
        <span className="font-semibold">General Notes</span>
        <span className="ml-4">{notes}</span>
      </div>
    </>
  );
};
MetadataReview.propTypes = {
  blmPointId: PropTypes.string,
  status: PropTypes.string,
  notes: PropTypes.string,
  description: PropTypes.string,
  accuracy: PropTypes.string,
};

const CoordinateReview = ({ datum, grid, geographic }) => {
  const parts = getDatumParts(datum);

  return (
    <>
      <div className="flex justify-between">
        <span className="font-semibold">Datum</span>
        <span>{parts.formatted}</span>
      </div>
      {parts.coordinateType === 'grid' && (
        <GridCoordinateReview grid={grid} datum={parts} />
      )}
      {parts.coordinateType === 'geographic' && (
        <GeographicCoordinateReview geographic={geographic} datum={parts} />
      )}
    </>
  );
};
CoordinateReview.propTypes = {
  datum: PropTypes.string.isRequired,
  grid: PropTypes.shape({
    zone: PropTypes.string,
    northing: PropTypes.number,
    easting: PropTypes.number,
    elevation: PropTypes.number,
    unit: PropTypes.string,
    adjustment: PropTypes.string,
  }),
  geographic: PropTypes.shape({
    northing: PropTypes.shape({
      degrees: PropTypes.number,
      minutes: PropTypes.number,
      seconds: PropTypes.number,
    }),
    easting: PropTypes.shape({
      degrees: PropTypes.number,
      minutes: PropTypes.number,
      seconds: PropTypes.number,
    }),
    height: PropTypes.number,
    unit: PropTypes.string,
    adjustment: PropTypes.string,
  }),
};

const GridCoordinateReview = ({ grid, datum }) => (
  <>
    {gridConfiguration.zone.includes(datum.original) && (
      <div className="flex justify-between">
        <span className="font-semibold">Zone</span>
        <span>{keyMap.zone(grid?.zone)}</span>
      </div>
    )}
    {gridConfiguration.adjustment.includes(datum.original) && (
      <div className="flex justify-between">
        <span className="font-semibold">Adjustment</span>
        <span>{keyMap.adjustment(grid?.adjustment)}</span>
      </div>
    )}
    <div className="flex justify-between">
      <span className="font-semibold">Unit</span>
      <span>{keyMap.unit(grid?.unit)}</span>
    </div>
    <div className="flex justify-between">
      <span className="font-semibold">Coordinates</span>
      <span>{`${grid?.northing}, ${grid?.easting}`}</span>
    </div>
    <div className="flex justify-between">
      <span className="font-semibold">NAVD88 Elevation</span>
      <span>{grid?.elevation}</span>
    </div>
  </>
);
GridCoordinateReview.propTypes = {
  grid: PropTypes.shape({
    zone: PropTypes.string,
    northing: PropTypes.number,
    easting: PropTypes.number,
    elevation: PropTypes.number,
    unit: PropTypes.string,
    adjustment: PropTypes.string,
  }),
  datum: PropTypes.object.isRequired,
};

const GeographicCoordinateReview = ({ geographic, datum }) => (
  <>
    {geographicConfiguration.adjustment.includes(datum.original) && (
      <div className="flex justify-between">
        <span className="font-semibold">Adjustment</span>
        <span>{keyMap.adjustment(geographic?.adjustment)}</span>
      </div>
    )}
    <div className="flex justify-between">
      <span className="font-semibold">Coordinates</span>
      <span>{`${geographic?.northing?.degrees}° ${geographic?.northing?.minutes}' ${geographic?.northing?.seconds}", `}</span>
      <span>{`${geographic?.easting?.degrees}° ${geographic?.easting?.minutes}' ${geographic?.easting?.seconds}"`}</span>
    </div>
    <div className="flex justify-between">
      <span className="font-semibold">Vertical Units</span>
      <span>{keyMap.unit(geographic?.unit)}</span>
    </div>
    <div className="flex justify-between">
      <span className="font-semibold">Ellipsoid Height</span>
      <span>{geographic?.height}</span>
    </div>
  </>
);
GeographicCoordinateReview.propTypes = {
  geographic: PropTypes.shape({
    northing: PropTypes.shape({
      degrees: PropTypes.number,
      minutes: PropTypes.number,
      seconds: PropTypes.number,
    }),
    easting: PropTypes.shape({
      degrees: PropTypes.number,
      minutes: PropTypes.number,
      seconds: PropTypes.number,
    }),
    height: PropTypes.number,
    unit: PropTypes.string,
    adjustment: PropTypes.string,
  }),
  datum: PropTypes.object.isRequired,
};
