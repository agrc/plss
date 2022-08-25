import { useState, useEffect } from 'react';
import { ErrorMessage } from '@hookform/error-message';
import { yupResolver } from '@hookform/resolvers/yup';
import clsx from 'clsx';
import { useStateMachine } from 'little-state-machine';
import { Controller, useForm } from 'react-hook-form';
import { DevTool } from '@hookform/devtools';
import { useNavigate, useParams } from 'react-router-dom';
import { RadioGroup, Tab } from '@headlessui/react';
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
} from './Schema';
import Wizard from './Wizard.jsx';
import { keyMap, formatDatum } from '../../helpers';

const formats = { Grid: grid, Geographic: geographic };

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
      {system?.indexOf('nad83') > -1 && (
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
  });

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
  const { state } = useStateMachine({ updateAction });
  const navigate = useNavigate();

  return (
    <>
      <div>
        {Object.keys(getStateForId(state, id)).map((x) => (
          <div className="flex justify-between" key={x}>
            <label className="font-semibold">{x}</label>
            <span>
              {x in keyMap && keyMap[x](getStateValue(state, id, [x]))}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-8 flex justify-center">
        <Wizard back={() => navigate(-1)} finish={() => {}} />
      </div>
    </>
  );
};
