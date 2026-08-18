import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';
import { ErrorMessage } from '@hookform/error-message';
import { yupResolver } from '@hookform/resolvers/yup';
import { geographic, grid } from '@ugrc/plss-shared/corner-submission/options';
import {
  type CoordinatePicker as CoordinatePickerValues,
  coordinatePickerSchema,
} from '@ugrc/plss-shared/corner-submission/schema';
import { clsx } from 'clsx';
import { useEffect, useState } from 'react';
import { Controller, type Resolver, type UseFormHandleSubmit, useForm } from 'react-hook-form';
import { useSubmissionContext } from '../../contexts/SubmissionContext.tsx';
import { NumberedForm, NumberedFormSection } from '../../formElements/Form.tsx';
import { Select } from '../../formElements/Select.tsx';
import Spacer from '../../formElements/Spacer.tsx';
import usePageView from '../../hooks/usePageView.ts';
import ErrorMessageTag from '../ErrorMessage.tsx';
import Wizard from './Wizard.tsx';

const formats = { Geographic: geographic, Grid: grid };

const defaultTabIndex = 0;
type DatumFormValues = { datum: CoordinatePickerValues['datum'] | '' };

const getOpenTabIndex = (datum: string) => {
  if (!datum) {
    return defaultTabIndex;
  }

  if (datum.indexOf('-') < 0) {
    return defaultTabIndex;
  }

  const datumType = datum.split('-')[0] ?? '';

  const index = datumType === 'grid' ? 1 : 0;

  return index;
};

const CoordinatePicker = () => {
  const meta = 'datum';
  const [state, send] = useSubmissionContext();
  usePageView('screen-submission-datum');

  let { datum } = state.context;
  if (!datum) {
    datum = '';
  }

  const { control, formState, handleSubmit, reset, setFocus } = useForm<DatumFormValues>({
    resolver: yupResolver(coordinatePickerSchema) as Resolver<DatumFormValues>,
    defaultValues: { datum: datum as DatumFormValues['datum'] },
  });
  const typedHandleSubmit = handleSubmit as UseFormHandleSubmit<DatumFormValues>;
  const [selectedTab, setSelectedTab] = useState(defaultTabIndex);

  useEffect(() => {
    setSelectedTab(getOpenTabIndex(datum));
  }, [datum]);

  const onSubmit = (payload: DatumFormValues) => {
    // requires two send invocations to update context so the NEXT guards have data to work with
    if (!payload.datum) {
      return;
    }

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
      <NumberedForm onSubmit={typedHandleSubmit(onSubmit)}>
        <NumberedFormSection number={1} title="Coordinate system">
          <TabGroup selectedIndex={selectedTab} onChange={setSelectedTab}>
            <TabList className="flex space-x-1 rounded-xl bg-sky-500/20 p-1">
              {Object.keys(formats).map((category) => (
                <Tab
                  key={category}
                  className={({ selected }) =>
                    clsx(
                      'w-full rounded-lg py-2.5 leading-5 font-medium',
                      'ring-white/60 ring-offset-2 ring-offset-sky-400 focus:ring-2 focus:outline-hidden',
                      selected
                        ? 'border border-sky-600 bg-sky-500 text-white shadow-sm hover:border-sky-700 hover:bg-sky-600 focus:border-sky-500 focus:ring-sky-600 active:bg-sky-700'
                        : 'text-sky-700 hover:bg-sky-600/20',
                    )
                  }
                >
                  {category}
                </Tab>
              ))}
            </TabList>
            <TabPanels>
              {Object.values(formats).map((options, idx) => (
                <TabPanel key={idx}>
                  <Controller
                    control={control}
                    name="datum"
                    render={({ field }) => (
                      <Select
                        label={false}
                        placeholder="Coordinate System"
                        options={[...options]}
                        required={true}
                        {...field}
                      />
                    )}
                  />
                  <ErrorMessage errors={formState.errors} name="datum" as={ErrorMessageTag} />
                </TabPanel>
              ))}
            </TabPanels>
          </TabGroup>
        </NumberedFormSection>
        <NumberedFormSection number={0} title={undefined}>
          <Wizard back={() => send({ type: 'BACK' })} next={true} clear={onReset} />
        </NumberedFormSection>
      </NumberedForm>
    </>
  );
};

export default CoordinatePicker;
