import { useContext, useState, useEffect } from 'react';
import clsx from 'clsx';
import { Controller, useForm } from 'react-hook-form';
import { ErrorMessage } from '@hookform/error-message';
import { yupResolver } from '@hookform/resolvers/yup';
import { Tab } from '@headlessui/react';
import Spacer from '../../formElements/Spacer.jsx';
import { NumberedForm, NumberedFormSection } from '../../formElements/Form.jsx';
import { Button } from '../../formElements/Buttons.jsx';
import { Select } from '../../formElements/Select.jsx';
import ErrorMessageTag from '../ErrorMessage.jsx';
import { SubmissionContext } from '../../contexts/SubmissionContext.jsx';
import {
  geographic,
  grid,
} from '../../../../functions/shared/cornerSubmission/Options.js';
import { coordinatePickerSchema } from '../../../../functions/shared/cornerSubmission/Schema.js';
import Wizard from './Wizard.jsx';
import usePageView from '../../hooks/usePageView.jsx';

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

const CoordinatePicker = () => {
  const meta = 'datum';
  const [state, send] = useContext(SubmissionContext);
  usePageView('screen-submission-datum');

  let { datum } = state.context;
  if (!datum) {
    datum = '';
  }

  const { control, formState, handleSubmit, reset, setFocus } = useForm({
    resolver: yupResolver(coordinatePickerSchema),
    defaultValues: { datum },
  });
  const [selectedTab, setSelectedTab] = useState(defaultTabIndex);

  useEffect(() => {
    setSelectedTab(getOpenTabIndex(datum));
  }, [datum]);

  const onSubmit = (payload) => {
    // requires two send invocations to update context so the NEXT guards have data to work with
    send({ type: 'UPDATE_CONTEXT', meta, payload: payload.datum });
    send({ type: 'NEXT', meta, payload: payload.datum });
  };

  const onReset = () => {
    send({ type: 'RESET', meta, payload: '' });
    reset({ datum: '' });
  };

  useEffect(() => {
    setFocus('datum');
  }, [setFocus]);

  return (
    <>
      <h2 className="text-2xl font-semibold">Location Information</h2>
      <Spacer className="my-4" />
      {state.context.type === 'existing' && (
        <>
          <div className="flex justify-between">
            <p className="italic">
              Coordinates are optional for existing monument uploads
            </p>
            <Button style="secondary" onClick={() => send({ type: 'SKIP' })}>
              Skip
            </Button>
          </div>
          <Spacer className="my-10" />
        </>
      )}
      <NumberedForm onSubmit={handleSubmit(onSubmit)}>
        <NumberedFormSection number={1} title="Coordinate system">
          <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
            <Tab.List className="flex space-x-1 rounded-xl bg-sky-500/20 p-1">
              {Object.keys(formats).map((category) => (
                <Tab
                  key={category}
                  className={({ selected }) =>
                    clsx(
                      'w-full rounded-lg py-2.5 font-medium leading-5',
                      'ring-white ring-opacity-60 ring-offset-2 ring-offset-sky-400 focus:outline-none focus:ring-2',
                      selected
                        ? 'border border-sky-600 bg-sky-500 text-white shadow hover:border-sky-700 hover:bg-sky-600 focus:border-sky-500 focus:ring-sky-600 active:bg-sky-700'
                        : 'text-sky-700 hover:bg-sky-600/20',
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
                    render={({ field }) => (
                      <Select
                        label={false}
                        placeholder="Coordinate System"
                        options={options}
                        required={true}
                        {...field}
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
            back={() => send({ type: 'BACK' })}
            next={true}
            clear={onReset}
          />
        </NumberedFormSection>
      </NumberedForm>
    </>
  );
};

export default CoordinatePicker;
