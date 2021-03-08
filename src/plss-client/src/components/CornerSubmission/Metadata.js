import { DevTool } from '@hookform/devtools';
import { ErrorMessage } from '@hookform/error-message';
import { yupResolver } from '@hookform/resolvers/yup';
import { useStateMachine } from 'little-state-machine';
import { useForm } from 'react-hook-form';
import { useHistory } from 'react-router-dom';
import { LimitedTextarea, Select } from '../FormElements';
import ErrorMessageTag from '../FormElements/ErrorMessage';
import { updateAction } from './CornerSubmission';
import { accuracy, status } from './Options';
import { metadataSchema } from './Schema';
import Wizard from './Wizard';

let renderCount = 0;

const Metadata = () => {
  renderCount++;
  const { state, actions } = useStateMachine({ updateAction });
  const { push } = useHistory();
  const { register, errors, control, handleSubmit, reset, formState } = useForm({
    defaultValues: state.newSheet,
    resolver: yupResolver(metadataSchema),
  });

  const { touched } = formState;

  const onSubmit = (data) => {
    actions.updateAction(data);
    push(`/${data.blmPointNumber}/coordinates`);
  };

  console.log(`metadata::render-count:${renderCount}`);

  return (
    <form className="inline-grid w-full gap-2" onSubmit={handleSubmit(onSubmit)}>
      <DevTool control={control} />
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
        <ErrorMessage errors={errors} name="status" as={ErrorMessageTag} />
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
        <ErrorMessage errors={errors} name="accuracy" as={ErrorMessageTag} />
      </div>
      <div>
        <label htmlFor="description" className="font-semibold">
          Monument Description
        </label>
        <LimitedTextarea
          value={state.description}
          placeholder="Location information, terrain, general findings, monument condition, etc."
          name="description"
          rows="5"
          limit={500}
          inputRef={register}
          touched={touched?.description}
        />
        <ErrorMessage errors={errors} name="description" as={ErrorMessageTag} />
      </div>
      <div>
        <label htmlFor="notes" className="font-semibold">
          General Notes
        </label>
        <LimitedTextarea
          value={state.notes}
          placeholder="Information about the method used to locate the monument (GPS, traditional survey instrument); type of GPS receiver; if TURN GPS network was used; if two hour OPUS solution was taken; weather conditions; etc."
          name="notes"
          rows="5"
          limit={500}
          inputRef={register}
          touched={touched?.notes}
        />
        <ErrorMessage errors={errors} name="notes" as={ErrorMessageTag} />
      </div>
      <Wizard next={true} clear={reset} />
    </form>
  );
};

export default Metadata;
