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
import Spacer from '../../formElements/Spacer.jsx';
import { NumberedForm, NumberedFormSection } from '../../formElements/Form.jsx';
import ErrorMessageTag from '../../pageElements/ErrorMessage.jsx';
import {
  updateAction,
  getStateForId,
  getStateValue,
} from './CornerSubmission.jsx';
import {
  geographic,
  grid,
  units,
  statePlaneZones,
  verticalDatums,
} from './Options.mjs';
import {
  coordinatePickerSchema,
  latitudeSchema,
  longitudeSchema,
  geographicHeightSchema,
  gridCoordinatesSchema,
} from './Schema';
import Wizard from './Wizard.jsx';
import { keyMap, formatDatum } from '../../helpers/index.mjs';

const formats = { Geographic: geographic, Grid: grid };

const defaultTabIndex = 0;

const getOpenTabIndex = (datum) => {
  if (!datum) {
    return defaultTabIndex;
  }

  if (datum.indexOf('-') < 0) {
    return defaultTabIndex;
  }

  datum = datum.split('-')[0];

  const index = datum === 'grid' ? 1 : 0;

  return index;
};

export const CoordinatePicker = () => {
  let { id } = useParams();
  const navigate = useNavigate();
  const { state, actions } = useStateMachine({ updateAction });
  const { control, handleSubmit, reset, formState } = useForm({
    defaultValues: getStateForId(state, id),
    resolver: yupResolver(coordinatePickerSchema),
  });
  const [selectedTab, setSelectedTab] = useState(defaultTabIndex);

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
    <>
      <h3 className="text-2xl font-semibold">Location Information</h3>
      <Spacer className="my-4" />
      <NumberedForm onSubmit={handleSubmit(onSubmit)}>
        <NumberedFormSection number={1} title="Coordinate system">
          <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
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
            <Tab.Panels>
              {Object.values(formats).map((options, idx) => (
                <Tab.Panel key={idx}>
                  <Controller
                    control={control}
                    name="datum"
                    render={({ field: { onChange, name } }) => (
                      <Select
                        name={name}
                        label={false}
                        options={options}
                        placeholder="Coordinate System"
                        currentValue={getStateValue(state, id, name)}
                        onUpdate={onChange}
                        required={true}
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
        </NumberedFormSection>
        <NumberedFormSection number={0}>
          <Wizard
            back={() => navigate(-1)}
            next={true}
            clear={() => {
              reset({ datum: '' });
            }}
          />
        </NumberedFormSection>
        <DevTool control={control} />
      </NumberedForm>
    </>
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
    data.grid = null;
    actions.updateAction(data);
    navigate(`/submission/${id}/coordinates/geographic/${system}/easting`);
  };

  return (
    <>
      <h3 className="text-2xl font-semibold">Location Information</h3>
      <p className="text-sm leading-none">
        Geographic Northing for {formatDatum(getStateValue(state, id, 'datum'))}
      </p>
      <Spacer className="my-4" />
      <NumberedForm onSubmit={handleSubmit(onSubmit)}>
        <NumberedFormSection number={2} title="Latitude">
          <div>
            <Input
              value={getStateValue(state, id, 'degrees')}
              placeholder="###"
              name="geographic.northing.degrees"
              label="Degrees"
              required={true}
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
              required={true}
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
              required={true}
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
        </NumberedFormSection>
        <NumberedFormSection number={0}>
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
        </NumberedFormSection>
      </NumberedForm>
    </>
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
    data.grid = null;
    actions.updateAction(data);
    navigate(`/submission/${id}/coordinates/geographic/${system}/height`);
  };

  return (
    <>
      <h3 className="text-2xl font-semibold">Location Information</h3>
      <p className="text-sm leading-none">
        Geographic Easting for {formatDatum(getStateValue(state, id, 'datum'))}
      </p>
      <Spacer className="my-4" />
      <NumberedForm onSubmit={handleSubmit(onSubmit)}>
        <NumberedFormSection number={3} title="Longitude">
          <div>
            <Input
              value={getStateValue(state, id, 'degrees')}
              label="Degrees"
              required={true}
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
              required={true}
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
              required={true}
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
        </NumberedFormSection>
        <NumberedFormSection number={0}>
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
        </NumberedFormSection>
      </NumberedForm>
    </>
  );
};

const geographicHeightDefaults = {
  geographic: {
    elevation: '',
    units: 'm',
  },
};
export const GeographicHeight = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, actions } = useStateMachine({ updateAction });

  let defaultValues = getStateForId(state, id);
  if (!defaultValues?.geographic) {
    defaultValues = geographicHeightDefaults;
  }
  if (!defaultValues?.geographic.unit) {
    defaultValues.geographic.unit = 'm';
  }

  const selectedUnit = units.find(
    (x) => x.value === defaultValues.geographic.unit
  );

  const { control, register, handleSubmit, reset, formState } = useForm({
    defaultValues,
    resolver: yupResolver(geographicHeightSchema),
  });

  const [selected, setSelected] = useState(selectedUnit);

  const onSubmit = (data) => {
    data.grid = null;
    actions.updateAction(data);
    if (defaultValues?.existing?.pdf) {
      navigate(`/submission/${id}/review`);

      return;
    }

    navigate(`/submission/${id}/images`);
  };

  return (
    <>
      <h3 className="text-2xl font-semibold">Location Information</h3>
      <p className="text-sm leading-none">
        Geographic height for {formatDatum(getStateValue(state, id, 'datum'))}
      </p>
      <Spacer className="my-4" />
      <NumberedForm onSubmit={handleSubmit(onSubmit)}>
        <NumberedFormSection number={4} title="Ellipsoid Height">
          <DevTool control={control} />
          <Input
            value={getStateValue(state, id, 'elevation')}
            label={false}
            required={true}
            name="geographic.elevation"
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
            name="geographic.elevation"
            as={ErrorMessageTag}
          />
          <ErrorMessage
            errors={formState.errors}
            name="geographic.unit"
            as={ErrorMessageTag}
          />
        </NumberedFormSection>
        <NumberedFormSection number={0}>
          <Wizard back={() => navigate(-1)} next={true} clear={reset} />
        </NumberedFormSection>
      </NumberedForm>
    </>
  );
};

const gridDefaults = {
  grid: {
    'grid.zone': '',
    'grid.unit': '',
    'grid.northing': '',
    'grid.easting': '',
    'grid.elevation': '',
    'grid.verticalDatum': '',
  },
};

export const GridCoordinates = () => {
  const { id } = useParams();
  const { state, actions } = useStateMachine({ updateAction });
  const navigate = useNavigate();

  let defaultValues = getStateForId(state, id);
  const { control, register, handleSubmit, reset, formState } = useForm({
    defaultValues,
    resolver: yupResolver(gridCoordinatesSchema),
  });

  const onSubmit = (data) => {
    data.geographic = null;
    actions.updateAction(data);
    if (defaultValues?.existing?.pdf) {
      navigate(`/submission/${id}/review`);

      return;
    }
    navigate(`/submission/${id}/images`);
  };

  return (
    <>
      <h3 className="text-2xl font-semibold">Location Information</h3>
      <p className="text-sm leading-none">
        Grid coordinates for {formatDatum(getStateValue(state, id, 'datum'))}
      </p>
      <Spacer className="my-4" />
      <NumberedForm onSubmit={handleSubmit(onSubmit)}>
        <NumberedFormSection number={2} title="Zone and units">
          <div>
            <Controller
              control={control}
              name="grid.zone"
              render={({ field: { onChange, name } }) => (
                <Select
                  name={name}
                  options={statePlaneZones}
                  label="State Plane Zone"
                  required={true}
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
          <div>
            <Controller
              control={control}
              name="grid.unit"
              render={({ field: { onChange, name } }) => (
                <Select
                  name={name}
                  options={units}
                  label="Horizontal units"
                  required={true}
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
        </NumberedFormSection>
        <NumberedFormSection number={3} title="Location">
          <div>
            <Input
              value={getStateValue(state, id, 'northing')}
              type="number"
              label="Northing"
              required={true}
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
            <Input
              value={getStateValue(state, id, 'easting')}
              type="number"
              label="Easting"
              required={true}
              name="grid.easting"
              inputRef={register}
            />
            <ErrorMessage
              errors={formState.errors}
              name="grid.easting"
              as={ErrorMessageTag}
            />
          </div>
        </NumberedFormSection>
        <NumberedFormSection number={4} title="Elevation">
          <div>
            <Controller
              control={control}
              name="grid.verticalDatum"
              render={({ field: { onChange, name } }) => (
                <Select
                  name={name}
                  options={verticalDatums}
                  label="Vertical datum"
                  required={false}
                  placeholder="What is the vertical datum"
                  currentValue={getStateValue(state, id, name)}
                  onUpdate={onChange}
                />
              )}
            />
            <ErrorMessage
              errors={formState.errors}
              name="grid.verticalDatum"
              as={ErrorMessageTag}
            />
          </div>
          <div>
            <Input
              value={getStateValue(state, id, 'grid.elevation')}
              type="number"
              label="Elevation"
              required={false}
              name="grid.elevation"
              inputRef={register}
            />
            <ErrorMessage
              errors={formState.errors}
              name="grid.elevation"
              as={ErrorMessageTag}
            />
          </div>
        </NumberedFormSection>
        <NumberedFormSection number={0}>
          <Wizard
            back={() => navigate(-1)}
            next={true}
            clear={() => reset(gridDefaults)}
          />
        </NumberedFormSection>
      </NumberedForm>
    </>
  );
};

export const Review = () => {
  const { id, existing } = useParams();
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

  console.log('existing', existing);

  return (
    <>
      <div className="grid gap-2">
        {existing !== 'existing' && (
          <MetadataReview blmPointId={data.blmPointId} {...data.metadata} />
        )}
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
  const [type] = datum.split('-');

  return (
    <>
      <div className="flex justify-between">
        <span className="font-semibold">Datum</span>
        <span>{formatDatum(datum)}</span>
      </div>
      {type === 'grid' && <GridCoordinateReview grid={grid} />}
      {type === 'geographic' && (
        <GeographicCoordinateReview geographic={geographic} />
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
    elevation: PropTypes.number,
    unit: PropTypes.string,
  }),
};

const GridCoordinateReview = ({ grid }) => (
  <>
    <div className="flex justify-between">
      <span className="font-semibold">Zone</span>
      <span>{keyMap.zone(grid?.zone)}</span>
    </div>
    <div className="flex justify-between">
      <span className="font-semibold">Unit</span>
      <span>{keyMap.unit(grid?.unit)}</span>
    </div>
    <div className="flex justify-between">
      <span className="font-semibold">Coordinates</span>
      <span>{`${grid?.northing}, ${grid?.easting}`}</span>
    </div>
    {grid?.elevation && (
      <div className="flex justify-between">
        <span className="font-semibold">{grid?.verticalDatum} Elevation</span>
        <span>{grid?.elevation}</span>
      </div>
    )}
  </>
);
GridCoordinateReview.propTypes = {
  grid: PropTypes.shape({
    zone: PropTypes.string,
    northing: PropTypes.number,
    easting: PropTypes.number,
    elevation: PropTypes.number,
    unit: PropTypes.string,
    verticalDatum: PropTypes.string,
  }),
};

const GeographicCoordinateReview = ({ geographic }) => (
  <>
    <div className="flex justify-between">
      <span className="font-semibold">Coordinates</span>
      <span>{`${geographic?.northing?.degrees}° ${geographic?.northing?.minutes}' ${geographic?.northing?.seconds}", `}</span>
      <span>{`${geographic?.easting?.degrees}° ${geographic?.easting?.minutes}' ${geographic?.easting?.seconds}"`}</span>
    </div>
    <div className="flex justify-between">
      <span className="font-semibold">Ellipsoid Height</span>
      <span>{`${geographic?.elevation} ${keyMap.unit(geographic?.unit)}`}</span>
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
    elevation: PropTypes.number,
    unit: PropTypes.string,
  }),
};
