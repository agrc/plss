import { DevTool } from '@hookform/devtools';
import { ErrorMessage } from '@hookform/error-message';
import { yupResolver } from '@hookform/resolvers/yup';
import { useStateMachine } from 'little-state-machine';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { LimitedTextarea } from '../../formElements/LimitedTextarea.jsx';
import { Select } from '../../formElements/Select.jsx';
import ErrorMessageTag from '../../pageElements/ErrorMessage.jsx';
import { updateAction } from './CornerSubmission.jsx';
import { accuracy, status } from './Options';
import { metadataSchema } from './Schema';
import Wizard from './Wizard.jsx';

const Metadata = () => {
  const { state, actions } = useStateMachine({ updateAction });
  const navigate = useNavigate();
  const { register, control, handleSubmit, reset, formState } = useForm({
    defaultValues: state.newSheet,
    resolver: yupResolver(metadataSchema),
  });

  const { touched } = formState;

  const onSubmit = (data) => {
    actions.updateAction(data);
    navigate(`/submission/${data.blmPointId}/coordinates`);
  };

  return (
    <form
      className="inline-grid w-full gap-2"
      onSubmit={handleSubmit(onSubmit)}
    >
      <DevTool control={control} />
      <input
        type="hidden"
        value={state.newSheet.blmPointId}
        {...register('blmPointId')}
      />
      <div>
        <label htmlFor="monumentStatus" className="font-semibold">
          Monument Status
        </label>
        <Select
          value={state.status}
          placeholder="What is the status"
          name="status"
          options={status}
          inputRef={register}
          touched={touched?.status}
        />
        <ErrorMessage
          errors={formState.errors}
          name="status"
          as={ErrorMessageTag}
        />
      </div>
      <div>
        <label htmlFor="accuracy" className="font-semibold">
          Accuracy
        </label>
        <Select
          value={state.accuracy}
          placeholder="Choose the accuracy"
          name="accuracy"
          options={accuracy}
          inputRef={register}
          touched={touched?.accuracy}
        />
        <ErrorMessage
          errors={formState.errors}
          name="accuracy"
          as={ErrorMessageTag}
        />
      </div>
      <div>
        <label htmlFor="description" className="font-semibold">
          Monument Description
        </label>
        <Controller
          control={control}
          name="description"
          render={({ field }) => (
            <LimitedTextarea
              value={state.description}
              placeholder="Location information, terrain, general findings, monument condition, etc."
              rows="5"
              maxLength={500}
              field={field}
              errors={formState.errors}
              className="w-full"
            />
          )}
        />
      </div>
      <div>
        <label htmlFor="notes" className="font-semibold">
          General Notes
        </label>
        <Controller
          control={control}
          name="notes"
          render={({ field }) => (
            <LimitedTextarea
              value={state.notes}
              placeholder="Information about the method used to locate the monument (GPS, traditional survey instrument); type of GPS receiver; if TURN GPS network was used; if two hour OPUS solution was taken; weather conditions; etc."
              rows="5"
              maxLength={500}
              field={field}
              errors={formState.errors}
              className="w-full"
            />
          )}
        />
      </div>
      <Wizard next={true} clear={reset} />
    </form>
  );
};

export default Metadata;
