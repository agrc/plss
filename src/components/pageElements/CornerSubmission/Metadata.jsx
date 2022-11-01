import { useContext } from 'react';
import { ErrorMessage } from '@hookform/error-message';
import { yupResolver } from '@hookform/resolvers/yup';
import { DevTool } from '@hookform/devtools';
import { Controller, useForm } from 'react-hook-form';
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/20/solid';
import { SubmissionContext } from '../../contexts/SubmissionContext.jsx';
import { LimitedTextarea } from '../../formElements/LimitedTextarea.jsx';
import { Select } from '../../formElements/Select.jsx';
import Switch from '../../formElements/Switch.jsx';
import Spacer from '../../formElements/Spacer.jsx';
import { Input, Label } from '../../formElements/Inputs.jsx';
import { NumberedForm, NumberedFormSection } from '../../formElements/Form.jsx';
import ErrorMessageTag from '../../pageElements/ErrorMessage.jsx';
import { accuracy, status, corner } from './Options.mjs';
import { metadataSchema as schema } from './Schema';
import Wizard from './Wizard.jsx';
import { parseBool } from '../../helpers/index.mjs';

const defaults = {
  section: '',
  corner: '',
  notes: '',
  description: '',
  status: '',
  accuracy: '',
  mrrc: false,
};

const Metadata = () => {
  const meta = 'metadata';
  const [state, send] = useContext(SubmissionContext);

  let defaultValues = state.context?.metadata;
  if (!defaultValues) {
    defaultValues = defaults;
  }

  if (typeof defaultValues?.mrrc !== 'boolean') {
    defaultValues.mrrc = false;
  }

  const { register, control, handleSubmit, reset, formState } = useForm({
    resolver: yupResolver(schema),
    defaultValues,
  });

  const onSubmit = (payload) => {
    send({ type: 'NEXT', meta, payload });
  };

  const onReset = () => {
    send({ type: 'RESET', meta, payload: defaults });
    reset(defaults);
  };

  return (
    <>
      <h3 className="text-2xl font-semibold">Monument Metadata</h3>
      <Spacer className="my-4" />
      <NumberedForm onSubmit={handleSubmit(onSubmit)}>
        <DevTool control={control} />
        <NumberedFormSection number={1} title="Section Information">
          <div>
            <Input
              name="section"
              label="Section"
              required={true}
              type="number"
              placeholder="What is the section"
              value={defaultValues.section}
              inputRef={register}
            />
            <ErrorMessage
              errors={formState.errors}
              name="section"
              as={ErrorMessageTag}
            />
          </div>
          <div>
            <Controller
              control={control}
              name="corner"
              render={({ field: { onChange, name } }) => (
                <Select
                  name={name}
                  label="Section Corner"
                  required={true}
                  options={corner}
                  placeholder="What is the section corner"
                  currentValue={defaultValues[name]}
                  onUpdate={onChange}
                />
              )}
            />
            <ErrorMessage
              errors={formState.errors}
              name="corner"
              as={ErrorMessageTag}
            />
          </div>
        </NumberedFormSection>
        <NumberedFormSection number={2} title="Condition">
          <div>
            <Controller
              control={control}
              name="status"
              render={({ field: { onChange, name } }) => (
                <Select
                  name={name}
                  label="Monument Status"
                  required={true}
                  options={status}
                  placeholder="What is the status"
                  currentValue={defaultValues[name]}
                  onUpdate={onChange}
                />
              )}
            />
            <ErrorMessage
              errors={formState.errors}
              name="status"
              as={ErrorMessageTag}
            />
          </div>
        </NumberedFormSection>
        <NumberedFormSection number={3} title="Collection">
          <div>
            <Controller
              control={control}
              name="accuracy"
              render={({ field: { onChange, name } }) => (
                <Select
                  name={name}
                  label="Accuracy"
                  required={true}
                  options={accuracy}
                  placeholder="Choose the accuracy"
                  currentValue={defaultValues[name]}
                  onUpdate={onChange}
                />
              )}
            />
            <ErrorMessage
              errors={formState.errors}
              name="accuracy"
              as={ErrorMessageTag}
            />
          </div>
        </NumberedFormSection>
        <NumberedFormSection number={4} title="MRRC">
          <div>
            <label htmlFor="mrrc" className="font-semibold">
              Associated with a{' '}
              <abbr
                className="cursor-help"
                title="Monument Replacement and Restoration Committee"
              >
                MRRC
              </abbr>{' '}
              Project
            </label>
            <div className="flex justify-between">
              <Controller
                control={control}
                name="mrrc"
                render={({ field: { onChange, name } }) => (
                  <Switch
                    name={name}
                    screenReader="Toggle that this associated with a Monument Replacement and Restoration Committee project?"
                    currentValue={parseBool(defaultValues[name], false)}
                    onUpdate={onChange}
                  />
                )}
              />
              <a
                target="_blank"
                rel="noopener noreferrer"
                href="https://le.utah.gov/xcode/Title63A/Chapter16/63A-16-S509.html"
                className="under flex text-sm font-normal italic text-amber-300 underline visited:text-amber-500 hover:text-white"
              >
                Help
                <ArrowTopRightOnSquareIcon className="align-center not-sr-only ml-1 inline-flex h-5 w-5" />
              </a>
            </div>
            <ErrorMessage
              errors={formState.errors}
              name="mrrc"
              as={ErrorMessageTag}
            />
          </div>
        </NumberedFormSection>
        <NumberedFormSection number={5} title="Description">
          <div>
            <Label
              htmlFor="description"
              className="font-semibold"
              required={true}
            >
              Monument Description
            </Label>
            <Controller
              control={control}
              name="description"
              render={({ field }) => (
                <LimitedTextarea
                  value={defaultValues[field.name]}
                  placeholder="Notes about the monument"
                  rows="5"
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
                  rows="5"
                  maxLength={1000}
                  field={field}
                  errors={formState.errors}
                  className="w-full"
                />
              )}
            />
          </div>
        </NumberedFormSection>
        <NumberedFormSection number={-1}>
          <Wizard next={true} clear={onReset} />
        </NumberedFormSection>
      </NumberedForm>
    </>
  );
};

export default Metadata;
