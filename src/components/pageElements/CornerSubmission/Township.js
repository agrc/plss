import { ErrorMessage } from '@hookform/error-message';
import { useStateMachine } from 'little-state-machine';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../formElements/Buttons.jsx';
import { Input } from '../../formElements/Inputs.jsx';
import { Select } from '../../formElements/Select.jsx';
import { updateAction } from './CornerSubmission.jsx';
import { ErrorMessageTag } from '../../pageElements/ErrorMessage.jsx';

const sectionCorner = [
  'NW',
  'N 1/4',
  'NE',
  'E 1/4',
  'SE',
  'S 1/4',
  'SW',
  'W 1/4',
  'Center',
  '1/16',
  'Other',
];

const Township = () => {
  const { state, actions } = useStateMachine({ updateAction });
  const navigate = useNavigate();
  const { register, errors, handleSubmit } = useForm({
    defaultValues: state.newSheet,
  });

  const onSubmit = (data) => {
    actions.updateAction(data);
    navigate(`/submission/${data.blmPointNumber}/trs`);
  };

  return (
    <form
      className="inline-grid w-full gap-2"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div>
        <span className="font-semibold">Meridian</span>
        <div className="flex justify-center">
          <button className="inline-block rounded-l border border-transparent bg-indigo-500 px-4 py-2 text-white shadow-sm transition duration-100 ease-in-out hover:bg-indigo-600 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50">
            Salt Lake
          </button>
          <button className="inline-block rounded-r border border-transparent bg-indigo-500 px-4 py-2 text-white shadow-sm transition duration-100 ease-in-out hover:bg-indigo-600 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50">
            Uinta Basin
          </button>
        </div>
      </div>
      <div>
        <label htmlFor="township" className="font-semibold">
          Township
        </label>
        <Input
          name="township"
          inputRef={register({ required: 'this is a required field' })}
        />
        <ErrorMessage errors={errors} name="township" as={ErrorMessageTag} />
      </div>
      <div>
        <label htmlFor="range" className="font-semibold">
          Range
        </label>
        <Input
          name="range"
          inputRef={register({ required: 'this is a required field' })}
        />
        <ErrorMessage errors={errors} name="range" as={ErrorMessageTag} />
      </div>
      <div>
        <label htmlFor="section" className="font-semibold">
          Section
        </label>
        <Input
          name="section"
          inputRef={register({ required: 'this is a required field' })}
        />
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
        <ErrorMessage
          errors={errors}
          name="sectionCorner"
          as={ErrorMessageTag}
        />
      </div>
      <Button type="submit">Next</Button>
    </form>
  );
};

export default Township;
