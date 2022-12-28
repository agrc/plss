import { useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import { ErrorMessage } from '@hookform/error-message';
import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, useForm } from 'react-hook-form';
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/20/solid';
import { SubmissionContext } from '../../contexts/SubmissionContext.jsx';
import { LimitedTextarea } from '../../formElements/LimitedTextarea.jsx';
import { Select } from '../../formElements/Select.jsx';
import { Switch } from '../../formElements/Switch.jsx';
import Spacer from '../../formElements/Spacer.jsx';
import { Input, Label } from '../../formElements/Inputs.jsx';
import { Link } from '../../formElements/Buttons.jsx';
import { NumberedForm, NumberedFormSection } from '../../formElements/Form.jsx';
import ErrorMessageTag from '../../pageElements/ErrorMessage.jsx';
import { accuracy, status, corner } from './Options.mjs';
import { metadataSchema as schema } from './Schema';
import Wizard from './Wizard.jsx';

const defaults = {
  section: '',
  corner: '',
  notes: '',
  description: '',
  status: '',
  accuracy: '',
  mrrc: false,
};

const Metadata = ({ dispatch }) => {
  const meta = 'metadata';
  const [state, send] = useContext(SubmissionContext);

  let defaultValues = state.context?.metadata;
  if (!defaultValues) {
    defaultValues = defaults;
  }

  if (typeof defaultValues?.mrrc !== 'boolean') {
    defaultValues.mrrc = false;
  }

  const { control, formState, handleSubmit, register, reset, setFocus } =
    useForm({
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

  useEffect(() => {
    setFocus('section');
  }, [setFocus]);

  return (
    <>
      <h3 className="text-2xl font-semibold">Monument Metadata</h3>
      <Spacer className="my-4" />
      <NumberedForm onSubmit={handleSubmit(onSubmit)}>
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
                  placeholder="Describe the monument"
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
        <NumberedFormSection number={0}>
          <Wizard
            next={true}
            back={() => dispatch({ type: 'menu/toggle', payload: 'identify' })}
            clear={onReset}
          />
        </NumberedFormSection>
      </NumberedForm>
    </>
  );
};

export default Metadata;

Metadata.propTypes = {
  dispatch: PropTypes.func.isRequired,
};
