import { Fragment, useState, useEffect } from 'react';
import { ErrorMessage } from '@hookform/error-message';
import { yupResolver } from '@hookform/resolvers/yup';
import clsx from 'clsx';
import { useStateMachine } from 'little-state-machine';
import { Controller, useForm } from 'react-hook-form';
import { DevTool } from '@hookform/devtools';
import { useNavigate, useParams } from 'react-router-dom';
import { Listbox, RadioGroup, Tab, Transition } from '@headlessui/react';
import { CheckIcon, SelectorIcon } from '@heroicons/react/solid';
import { Input } from '../../formElements/Inputs.jsx';
import { Select } from '../../formElements/Select.jsx';
import ErrorMessageTag from '../../pageElements/ErrorMessage.jsx';
import { updateAction } from './CornerSubmission.jsx';
import { adjustment, geographic, grid, height } from './Options';
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

const getSelectedOption = (datum) => {
  if (!datum) {
    return '';
  }

  if (datum.indexOf('-') < 0) {
    return '';
  }

  const [type] = datum.split('-');
  let options = geographic;

  if (type === 'grid') {
    options === grid;
  }

  const result = options.find((item) => item.value === datum);

  if (!result) {
    return '';
  }

  return result;
};

export const CoordinatePicker = () => {
  let { id } = useParams();
  const navigate = useNavigate();
  const { state, actions } = useStateMachine({ updateAction });
  const { control, handleSubmit, reset, formState } = useForm({
    defaultValues: state?.submissions[id],
    resolver: yupResolver(coordinatePickerSchema),
  });
  const [selected, setSelected] = useState();
  const [selectedTab, setSelectedTab] = useState(0);

  useEffect(() => {
    setSelected(getSelectedOption(state?.submissions[id]?.datum));
    setSelectedTab(getOpenTabIndex(state?.submissions[id]?.datum));
  }, [state, id]);

  const onSubmit = (data) => {
    actions.updateAction(data);
    navigate(
      `/submission/${id}/coordinates/geographic/${
        data.datum.split('-')[1]
      }/northing`
    );
  };

  return (
    <form
      className="inline-grid w-full gap-2"
      onSubmit={handleSubmit(onSubmit)}
    >
      <span className="font-semibold">Collected coordinate format</span>
      <Tab.Group selectedIndex={selectedTab} onChange={() => setSelected(null)}>
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
                render={({ field: { onChange } }) => (
                  <Listbox
                    value={selected}
                    onChange={(option) => {
                      onChange(option.value);
                      setSelected(option);
                    }}
                  >
                    <div className="relative z-10 mt-1">
                      <Listbox.Button className="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left shadow-md focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
                        <span className="block truncate text-slate-800">
                          {selected?.label ?? 'coordinate system'}
                        </span>
                        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                          <SelectorIcon
                            className="h-5 w-5 text-slate-400"
                            aria-hidden="true"
                          />
                        </span>
                      </Listbox.Button>
                      <Transition
                        as={Fragment}
                        leave="transition ease-in duration-100"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                      >
                        <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                          {options.map((option, id) => (
                            <Listbox.Option
                              key={id}
                              className={({ active }) =>
                                `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                  active
                                    ? 'bg-indigo-100 text-indigo-900'
                                    : 'text-slate-900'
                                }`
                              }
                              value={option}
                            >
                              {({ selected }) => (
                                <>
                                  <span
                                    className={`block truncate ${
                                      selected ? 'font-medium' : 'font-normal'
                                    }`}
                                  >
                                    {option.label}
                                  </span>
                                  {selected ? (
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-indigo-600">
                                      <CheckIcon
                                        className="h-5 w-5"
                                        aria-hidden="true"
                                      />
                                    </span>
                                  ) : null}
                                </>
                              )}
                            </Listbox.Option>
                          ))}
                        </Listbox.Options>
                      </Transition>
                    </div>
                  </Listbox>
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
          setSelected(null);
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
    defaultValues: state?.submissions[id],
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
          {formatDatum(state?.submissions[id]?.datum)}
        </p>
      </div>
      <p className="font-semibold">Latitude</p>
      <div>
        <Input
          value={state.northing?.degrees}
          placeholder="###"
          name="northing.degrees"
          label="Degrees"
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
          value={state.northing?.minutes}
          label="Minutes"
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
          value={state.northing?.seconds}
          label="Seconds"
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
      <Wizard
        back={() => navigate(-1)}
        next={true}
        clear={() =>
          reset({
            'northing.seconds': '',
            'northing.minutes': '',
            'northing.degrees': '',
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
    defaultValues: state?.submissions[id],
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
          {formatDatum(state?.submissions[id]?.datum)}
        </p>
      </div>
      <p className="font-semibold">Longitude</p>
      <div>
        <Input
          value={state.easting?.degrees}
          label="Degrees"
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
          value={state.easting?.minutes}
          label="Minutes"
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
          value={state.easting?.seconds}
          label="Seconds"
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
      <Wizard back={() => navigate(-1)} next={true} clear={reset} />
    </form>
  );
};

export const GeographicHeight = () => {
  const { id, system } = useParams();
  const navigate = useNavigate();
  const { state, actions } = useStateMachine({ updateAction });

  const { control, register, handleSubmit, reset, formState } = useForm({
    defaultValues: state?.submissions[id],
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
      <label htmlFor="height" className="font-semibold">
        Ellipsoid Height
      </label>
      <Input
        value={state?.height}
        label={false}
        name="height"
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
      {/* <Select
            name="unit"
            value={state?.unit}
            placeholder="unit"
            options={}
            inputRef={register}
            className="bg-slate-200"
            right={true}
          /> */}
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
      {system.indexOf('nad83') > -1 && (
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
  const { id } = useParams();
  const { state, actions } = useStateMachine({ updateAction });
  const navigate = useNavigate();
  const { handleSubmit } = useForm({
    defaultValues: state?.submissions[id],
  });

  const onSubmit = (data) => {
    actions.updateAction(data);
    navigate(`/submission/${id}/coordinates/grid`);
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

export const Review = () => {
  const { id } = useParams();
  const { state } = useStateMachine({ updateAction });
  const navigate = useNavigate();

  return (
    <>
      <div>
        {Object.keys(state.newSheet).map((x) => (
          <div className="flex justify-between" key={x}>
            <label className="font-semibold">{x}</label>
            <span>{x in keyMap && keyMap[x](state?.submissions[id][x])}</span>
          </div>
        ))}
      </div>
      <div className="mt-8 flex justify-center">
        <Wizard back={() => navigate(-1)} finish={() => {}} />
      </div>
    </>
  );
};
