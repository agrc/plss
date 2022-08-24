import { ErrorMessage } from '@hookform/error-message';
import { yupResolver } from '@hookform/resolvers/yup';
import { DevTool } from '@hookform/devtools';
import { useStateMachine } from 'little-state-machine';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import extractTownshipInformation from './blmPointId.js';
import { LimitedTextarea } from '../../formElements/LimitedTextarea.jsx';
import { Select } from '../../formElements/Select.jsx';
import ErrorMessageTag from '../../pageElements/ErrorMessage.jsx';
import {
  updateAction,
  getStateForId,
  getStateValue,
} from './CornerSubmission.jsx';
import { accuracy, status } from './Options';
import { metadataSchema as schema } from './Schema';
import Wizard from './Wizard.jsx';

const Metadata = () => {
  let { id } = useParams();
  const { state, actions } = useStateMachine({ updateAction });
  const navigate = useNavigate();
  const { register, control, handleSubmit, reset, formState } = useForm({
    defaultValues: getStateForId(state, id),
    resolver: yupResolver(schema),
  });

  const onSubmit = (data) => {
    const townshipInformation = extractTownshipInformation(id);
    data = { ...townshipInformation, ...data };
    actions.updateAction(data);
    navigate(`/submission/${id}/coordinates`);
  };
  const onReset = () => {
    const defaults = {
      blmPointId: id,
      notes: '',
      description: '',
      status: '',
      accuracy: '',
    };

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
        <label htmlFor="monumentStatus" className="font-semibold">
          Monument Status
        </label>
        <Controller
          control={control}
          name="status"
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
          name="status"
          as={ErrorMessageTag}
        />
      </div>
      <div>
        <label htmlFor="accuracy" className="font-semibold">
          Accuracy
        </label>
        <Controller
          control={control}
          name="accuracy"
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
        <label htmlFor="notes" className="font-semibold">
          General Notes
        </label>
        <Controller
          control={control}
          name="notes"
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
