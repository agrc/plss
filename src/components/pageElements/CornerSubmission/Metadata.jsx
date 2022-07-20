import { ErrorMessage } from '@hookform/error-message';
import { yupResolver } from '@hookform/resolvers/yup';
import { useStateMachine } from 'little-state-machine';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { LimitedTextarea } from '../../formElements/LimitedTextarea.jsx';
import { Select } from '../../formElements/Select.jsx';
import ErrorMessageTag from '../../pageElements/ErrorMessage.jsx';
import { updateAction } from './CornerSubmission.jsx';
import { accuracy, status } from './Options';
import { metadataSchema as schema } from './Schema';
import Wizard from './Wizard.jsx';

const Metadata = () => {
  let { id } = useParams();
  const { state, actions } = useStateMachine({ updateAction });
  const navigate = useNavigate();
  const { register, control, handleSubmit, reset, formState } = useForm({
    defaultValues: state?.submissions[id],
    resolver: yupResolver(schema),
  });

  const onSubmit = (data) => {
    actions.updateAction(data);
    navigate(`/submission/${id}/coordinates`);
  };

  return (
    <form
      className="inline-grid w-full gap-2"
      onSubmit={handleSubmit(onSubmit)}
    >
      <input type="hidden" value={id} {...register('blmPointId')} />
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
              maxLength={1000}
              field={field}
              errors={formState.errors}
              className="w-full"
            />
          )}
        />
      </div>
      <Wizard back={() => navigate(-1)} next={true} clear={reset} />
    </form>
  );
};

export default Metadata;
