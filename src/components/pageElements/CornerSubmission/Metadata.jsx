import { ErrorMessage } from '@hookform/error-message';
import { yupResolver } from '@hookform/resolvers/yup';
import { DevTool } from '@hookform/devtools';
import { useStateMachine } from 'little-state-machine';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/20/solid';
import { LimitedTextarea } from '../../formElements/LimitedTextarea.jsx';
import { Select } from '../../formElements/Select.jsx';
import Switch from '../../formElements/Switch.jsx';
import { Input } from '../../formElements/Inputs.jsx';
import ErrorMessageTag from '../../pageElements/ErrorMessage.jsx';
import {
  updateAction,
  getStateForId,
  getStateValue,
} from './CornerSubmission.jsx';
import { accuracy, status, corner } from './Options.mjs';
import { metadataSchema as schema } from './Schema';
import Wizard from './Wizard.jsx';
import { parseBool } from '../../helpers/index.mjs';
const defaults = {
  metadata: {
    section: '',
    corner: '',
    notes: '',
    description: '',
    status: '',
    accuracy: '',
    mrrc: '',
  },
};
const Metadata = () => {
  let { id } = useParams();
  const { state, actions } = useStateMachine({ updateAction });
  const navigate = useNavigate();

  let defaultValues = getStateForId(state, id);
  if (!defaultValues?.metadata) {
    defaultValues = defaults;
  }
  if (typeof defaultValues?.metadata.mrrc !== 'boolean') {
    defaultValues.metadata.mrrc = false;
  }

  const { register, control, handleSubmit, reset, formState } = useForm({
    defaultValues,
    resolver: yupResolver(schema),
  });

  const onSubmit = (data) => {
    actions.updateAction(data);
    navigate(`/submission/${id}/coordinates`);
  };
  const onReset = () => {
    actions.updateAction(defaults);
    reset(defaults);
  };

  return (
    <form
      className="inline-grid w-full gap-2"
      onSubmit={handleSubmit(onSubmit)}
    >
      <DevTool control={control} />
      <input type="hidden" value={id} {...register('blmPointId')} />
      <div>
        <label htmlFor="metadata.section" className="font-semibold">
          Section
        </label>
        <Input
          name="metadata.section"
          label={false}
          type="number"
          placeholder="What is the section"
          value={getStateValue(state, id, 'metadata.section')}
          inputRef={register}
        />
        <ErrorMessage
          errors={formState.errors}
          name="metadata.section"
          as={ErrorMessageTag}
        />
      </div>
      <div>
        <label htmlFor="metadata.corner" className="font-semibold">
          Section Corner
        </label>
        <Controller
          control={control}
          name="metadata.corner"
          render={({ field: { onChange, name } }) => (
            <Select
              name={name}
              options={corner}
              placeholder="What is the section corner"
              currentValue={getStateValue(state, id, name)}
              onUpdate={onChange}
            />
          )}
        />
        <ErrorMessage
          errors={formState.errors}
          name="metadata.corner"
          as={ErrorMessageTag}
        />
      </div>
      <div>
        <label htmlFor="metadata.status" className="font-semibold">
          Monument Status
        </label>
        <Controller
          control={control}
          name="metadata.status"
          render={({ field: { onChange, name } }) => (
            <Select
              name={name}
              options={status}
              placeholder="What is the status"
              currentValue={getStateValue(state, id, name)}
              onUpdate={onChange}
            />
          )}
        />
        <ErrorMessage
          errors={formState.errors}
          name="metadata.status"
          as={ErrorMessageTag}
        />
      </div>
      <div>
        <label htmlFor="metadata.accuracy" className="font-semibold">
          Accuracy
        </label>
        <Controller
          control={control}
          name="metadata.accuracy"
          render={({ field: { onChange, name } }) => (
            <Select
              name={name}
              options={accuracy}
              placeholder="Choose the accuracy"
              currentValue={getStateValue(state, id, name)}
              onUpdate={onChange}
            />
          )}
        />
        <ErrorMessage
          errors={formState.errors}
          name="metadata.accuracy"
          as={ErrorMessageTag}
        />
      </div>
      <div>
        <label htmlFor="metadata.accuracy" className="font-semibold">
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
            name="metadata.mrrc"
            render={({ field: { onChange, name } }) => (
              <Switch
                name={name}
                screenReader="Toggle that this associated with a Monument Replacement and Restoration Committee project?"
                currentValue={parseBool(getStateValue(state, id, name), false)}
                onUpdate={onChange}
              />
            )}
          />
          <a
            target="_blank"
            rel="noreferer noopener noreferer noreferrer"
            href="https://le.utah.gov/xcode/Title63A/Chapter16/63A-16-S509.html"
            className="under flex text-sm font-normal italic text-amber-300 underline visited:text-amber-500 hover:text-white"
          >
            Help
            <ArrowTopRightOnSquareIcon className="align-center not-sr-only ml-1 inline-flex h-5 w-5" />
          </a>
        </div>
        <ErrorMessage
          errors={formState.errors}
          name="metadata.mrrc"
          as={ErrorMessageTag}
        />
      </div>
      <div>
        <label htmlFor="metadata.description" className="font-semibold">
          Monument Description
        </label>
        <Controller
          control={control}
          name="metadata.description"
          render={({ field }) => (
            <LimitedTextarea
              value={getStateValue(state, id, field.name)}
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
      <div>
        <label htmlFor="metadata.notes" className="font-semibold">
          General Notes
        </label>
        <Controller
          control={control}
          name="metadata.notes"
          render={({ field }) => (
            <LimitedTextarea
              value={getStateValue(state, id, field.name)}
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
      <Wizard back={() => navigate(-1)} next={true} clear={onReset} />
    </form>
  );
};

export default Metadata;
