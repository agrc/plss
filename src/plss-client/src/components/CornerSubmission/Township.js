import { ErrorMessage } from '@hookform/error-message';
import { useStateMachine } from 'little-state-machine';
import { useForm } from 'react-hook-form';
import { useHistory } from 'react-router-dom';
import { Button, Input, Select } from '../FormElements';
import { updateAction } from './CornerSubmission';

const sectionCorner = ['NW', 'N 1/4', 'NE', 'E 1/4', 'SE', 'S 1/4', 'SW', 'W 1/4', 'Center', '1/16', 'Other'];

const Township = () => {
  const { state, actions } = useStateMachine({ updateAction });
  const { push } = useHistory();
  const { register, errors, handleSubmit } = useForm({
    defaultValues: state.newSheet,
  });

  const onSubmit = (data) => {
    actions.updateAction(data);
    push(`/submission/${data.blmPointNumber}/trs`);
  };

  return (
    <form className="inline-grid w-full gap-2" onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label className="font-semibold">Meridian</label>
        <div className="flex justify-center">
          <button className="inline-block px-4 py-2 text-white transition duration-100 ease-in-out bg-indigo-500 border border-transparent rounded-l shadow-sm hover:bg-indigo-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none focus:ring-opacity-50">
            Salt Lake
          </button>
          <button className="inline-block px-4 py-2 text-white transition duration-100 ease-in-out bg-indigo-500 border border-transparent rounded-r shadow-sm hover:bg-indigo-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none focus:ring-opacity-50">
            Uinta Basin
          </button>
        </div>
      </div>
      <div>
        <label htmlFor="township" className="font-semibold">
          Township
        </label>
        <Input name="township" inputRef={register({ required: 'this is a required field' })} />
        <ErrorMessage errors={errors} name="township" as={ErrorMessageTag} />
      </div>
      <div>
        <label htmlFor="range" className="font-semibold">
          Range
        </label>
        <Input name="range" inputRef={register({ required: 'this is a required field' })} />
        <ErrorMessage errors={errors} name="range" as={ErrorMessageTag} />
      </div>
      <div>
        <label htmlFor="section" className="font-semibold">
          Section
        </label>
        <Input name="section" inputRef={register({ required: 'this is a required field' })} />
        <ErrorMessage errors={errors} name="section" as={ErrorMessageTag} />
      </div>
      <div className="mb-6">
        <label htmlFor="sectionCorner" className="font-semibold">
          Section Corner
        </label>
        <Select
          placeholder="Choose the corner"
          name="sectionCorner"
          options={sectionCorner}
          inputRef={register({ required: 'this is a required field' })}
        />
        <ErrorMessage errors={errors} name="sectionCorner" as={ErrorMessageTag} />
      </div>
      <Button type="submit" label="Next" />
    </form>
  );
};

export default Township;
