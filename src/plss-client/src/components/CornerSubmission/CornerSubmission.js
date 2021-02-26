import { useForm } from 'react-hook-form';
import { Button, Input, Select } from '../FormElements';

const CornerSubmission = () => {
  const { handleSubmit, register, errors } = useForm();
  const onSubmit = (data) => console.log(data);
  const user = {
    name: 'Test Person',
    license: 1123123,
  };

  const pointId = 'UT260020S0080E0_500420';

  return (
    <>
      <p className="p-3 mb-4 text-justify text-indigo-300 bg-gray-800 rounded-lg">
        This monument record information will be reviewed by the county surveyor under stewardship of this corner to
        satisfy the requirements of state code 17-23-17-7a.
      </p>
      <form className="inline-grid gap-2" reValidateMode="onChange" onSubmit={handleSubmit(onSubmit)}>
        <div className="flex justify-between">
          <label className="font-semibold">Submitted By</label>
          <span>{user.name}</span>
        </div>
        <div className="flex justify-between">
          <label className="font-semibold">Surveyor License</label>
          <span>{user.license}</span>
        </div>
        <span className="inline-block w-2/3 h-1 mx-auto my-4 bg-gray-500 rounded"></span>
        <div>
          <label for="blmPointNumber" className="font-semibold">
            BLM Point Number
          </label>
          <Input
            name="blmPointNumber"
            defaultValue={pointId}
            inputRef={register({ required: 'this is a required field' })}
          />
          {errors.blmPointNumber && <span className="text-red-500">{errors.blmPointNumber.message}</span>}
        </div>
        <div>
          <label for="county" className="control-label">
            County
          </label>
          <Select
            inputRef={register({ required: 'this is a required field' })}
            name="county"
            placeholder="Select a county"
            options={[
              'Beaver',
              'Box Elder',
              'Cache',
              'Carbon',
              'Daggett',
              'Davis',
              'Duchesne',
              'Emery',
              'Garfield',
              'Grand',
              'Iron',
              'Juab',
              'Kane',
              'Millard',
              'Morgan',
              'Piute',
              'Rich',
              'Salt Lake',
              'San Juan',
              'Sanpete',
              'Sevier',
              'Summit',
              'Tooele',
              'Uintah',
              'Utah',
              'Wasatch',
              'Washington',
              'Wayne',
              'Weber',
            ]}
          />
          {errors.county && <span className="text-red-500">{errors.county.message}</span>}
        </div>
        <div className="mb-6">
          <label for="accuracy" className="control-label">
            Accuracy
          </label>
          <Select
            placeholder="Choose the accuracy"
            name="accuracy"
            options={['Survey Grade (+/-) 0.03m', 'Mapping Grade (+/-) 3m', 'Recreational Grade (+/-) 30m']}
            inputRef={register({ required: 'this is a required field' })}
          />

          {errors.accuracy && <span className="text-red-500">{errors.accuracy.message}</span>}
        </div>
        <Button type="submit">Submit</Button>
      </form>
    </>
  );
};

export default CornerSubmission;
