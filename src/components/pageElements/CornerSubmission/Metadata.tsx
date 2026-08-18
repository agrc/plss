import { Field, Label as HeadlessLabel } from '@headlessui/react';
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/20/solid';
import { ErrorMessage } from '@hookform/error-message';
import { yupResolver } from '@hookform/resolvers/yup';
import { accuracy, corner, status } from '@ugrc/plss-shared/corner-submission/options';
import { type Metadata as MetadataValues, metadataSchema as schema } from '@ugrc/plss-shared/corner-submission/schema';
import { useEffect } from 'react';
import { Controller, type Resolver, type UseFormHandleSubmit, useForm } from 'react-hook-form';
import { useSubmissionContext } from '../../contexts/SubmissionContext.tsx';
import { Link } from '../../formElements/Buttons.tsx';
import { NumberedForm, NumberedFormSection } from '../../formElements/Form.tsx';
import { Input, Label } from '../../formElements/Inputs.tsx';
import { LimitedTextarea } from '../../formElements/LimitedTextarea.tsx';
import { Select } from '../../formElements/Select.tsx';
import Spacer from '../../formElements/Spacer.tsx';
import { Switch } from '../../formElements/Switch.tsx';
import usePageView from '../../hooks/usePageView.ts';
import ErrorMessageTag from '../../pageElements/ErrorMessage.tsx';
import type { AppAction } from '../../reducers/AppReducer.ts';
import Wizard from './Wizard.tsx';

type MetadataFormValues = Omit<
  MetadataValues,
  'accuracy' | 'collected' | 'corner' | 'description' | 'notes' | 'section' | 'status'
> & {
  accuracy: MetadataValues['accuracy'] | '';
  collected: MetadataValues['collected'] | '';
  corner: MetadataValues['corner'] | '';
  description: MetadataValues['description'] | '';
  notes: MetadataValues['notes'] | '';
  section: MetadataValues['section'] | '';
  status: MetadataValues['status'] | '';
};

const defaults: MetadataFormValues = {
  section: '',
  corner: '',
  notes: '',
  description: '',
  status: '',
  collected: '',
  accuracy: '',
  mrrc: false,
};

const dateFormatter = new Intl.DateTimeFormat('sv-SE');

type MetadataProps = {
  dispatch: (action: AppAction) => void;
};

const Metadata = ({ dispatch }: MetadataProps) => {
  const meta = 'metadata';
  const [state, send] = useSubmissionContext();
  usePageView('screen-submission-metadata');

  const savedMetadata = state.context.metadata as Partial<MetadataFormValues> | undefined;
  const defaultValues: MetadataFormValues = {
    ...defaults,
    ...savedMetadata,
    mrrc: typeof savedMetadata?.mrrc === 'boolean' ? savedMetadata.mrrc : false,
  };

  const { control, formState, handleSubmit, register, reset, setFocus } = useForm<MetadataFormValues>({
    resolver: yupResolver(schema) as Resolver<MetadataFormValues>,
    defaultValues,
  });
  const typedHandleSubmit = handleSubmit as UseFormHandleSubmit<MetadataFormValues>;

  const onSubmit = (payload: MetadataFormValues) => {
    if (!(payload.collected instanceof Date)) {
      return;
    }

    send({ type: 'NEXT', meta, payload: { ...payload, collected: dateFormatter.format(payload.collected) } });
  };

  const onReset = () => {
    send({ type: 'RESET', meta, payload: defaults });
    reset(defaults);
  };

  useEffect(() => {
    setFocus('section');
  }, [setFocus]);

  return (
    <>
      <h2 className="text-2xl font-semibold">Monument Metadata</h2>
      <Spacer className="my-4" />
      <NumberedForm onSubmit={typedHandleSubmit(onSubmit)}>
        <NumberedFormSection number={1} title="Section Information">
          <div>
            <Input
              label="Section"
              placeholder="What is the section"
              type="number"
              min="1"
              max="36"
              required={true}
              {...register('section')}
            />
            <ErrorMessage errors={formState.errors} name="section" as={ErrorMessageTag} />
          </div>
          <div>
            <Controller
              control={control}
              name="corner"
              render={({ field }) => (
                <Select
                  label="Section Corner"
                  placeholder="What is the section corner"
                  options={corner}
                  required={true}
                  {...field}
                />
              )}
            />
            <ErrorMessage errors={formState.errors} name="corner" as={ErrorMessageTag} />
          </div>
        </NumberedFormSection>
        <NumberedFormSection number={2} title="Condition">
          <div>
            <Controller
              control={control}
              name="status"
              render={({ field }) => (
                <Select
                  label="Monument Status"
                  placeholder="What is the status"
                  options={status}
                  required={true}
                  {...field}
                />
              )}
            />
            <ErrorMessage errors={formState.errors} name="status" as={ErrorMessageTag} />
          </div>
        </NumberedFormSection>
        <NumberedFormSection number={3} title="Collection">
          <div>
            <Input
              label="Collection Date"
              placeholder="Date monument was surveyed"
              type="date"
              required={true}
              {...register('collected')}
            ></Input>
            <ErrorMessage errors={formState.errors} name="collected" as={ErrorMessageTag} />
          </div>
          <div>
            <Controller
              control={control}
              name="accuracy"
              render={({ field }) => (
                <Select
                  label="Accuracy"
                  placeholder="Choose the accuracy"
                  options={accuracy}
                  required={true}
                  {...field}
                />
              )}
            />
            <ErrorMessage errors={formState.errors} name="accuracy" as={ErrorMessageTag} />
          </div>
        </NumberedFormSection>
        <NumberedFormSection number={4} title="MRRC">
          <div>
            <div className="font-semibold">
              Associated with a{' '}
              <abbr className="cursor-help" title="Monument Replacement and Restoration Committee">
                MRRC
              </abbr>{' '}
              Project
            </div>
            <Field>
              <HeadlessLabel className="sr-only">MRRC Project</HeadlessLabel>
              <div className="flex justify-between">
                <Controller
                  control={control}
                  name="mrrc"
                  render={({ field }) => (
                    <Switch
                      screenReader="Toggle that this associated with a Monument Replacement and Restoration Committee project?"
                      {...field}
                    />
                  )}
                />
                <Link
                  target="_blank"
                  rel="noopener noreferrer"
                  href="https://le.utah.gov/xcode/Title63A/Chapter16/63A-16-S509.html"
                >
                  Help
                  <ArrowTopRightOnSquareIcon className="align-center not-sr-only ml-1 inline-flex h-5 w-5" />
                </Link>
              </div>
            </Field>
            <ErrorMessage errors={formState.errors} name="mrrc" as={ErrorMessageTag} />
          </div>
        </NumberedFormSection>
        <NumberedFormSection number={5} title="Description">
          <div>
            <Label htmlFor="description" className="font-semibold" required={true}>
              Monument Description
            </Label>
            <Controller
              control={control}
              name="description"
              render={({ field }) => (
                <LimitedTextarea
                  value={defaultValues[field.name]}
                  placeholder="Describe the monument"
                  rows={5}
                  maxLength={1000}
                  field={field}
                  errors={formState.errors}
                  className="w-full"
                />
              )}
            />
          </div>
          <div className="mb-6">
            <Label htmlFor="notes" className="font-semibold" required={true}>
              General Notes
            </Label>
            <Controller
              control={control}
              name="notes"
              render={({ field }) => (
                <LimitedTextarea
                  value={defaultValues[field.name]}
                  placeholder="Information about the method used to locate the monument (GPS, traditional survey instrument); type of GPS receiver; if TURN GPS network was used; if two hour OPUS solution was taken; weather conditions; etc."
                  rows={5}
                  maxLength={1000}
                  field={field}
                  errors={formState.errors}
                  className="w-full"
                />
              )}
            />
          </div>
        </NumberedFormSection>
        <NumberedFormSection number={0} title={undefined}>
          <Wizard next={true} back={() => dispatch({ type: 'menu/toggle', payload: 'identify' })} clear={onReset} />
        </NumberedFormSection>
      </NumberedForm>
    </>
  );
};

export default Metadata;
