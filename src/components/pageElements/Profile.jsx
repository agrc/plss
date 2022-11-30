import { useUser } from 'reactfire';
import Card from '../formElements/Card.jsx';
import { Input, Label } from '../formElements/Inputs.jsx';
import { ErrorMessage } from '@hookform/error-message';
import ErrorMessageTag from './ErrorMessage.jsx';
import { useForm } from 'react-hook-form';
import { Button } from '../formElements/Buttons.jsx';

const defaults = {
  name: '',
  email: '',
  license: '',
  seal: '',
};

export default function Profile() {
  const { data: user } = useUser();

  const { email, displayName } = user;
  defaults.name = displayName;
  defaults.email = email;

  const { register, formState } = useForm({
    defaultValues: defaults,
  });

  return (
    <div className="mt-5">
      <form action="#" method="POST">
        <Card>
          <h1 className="mb-4 text-2xl font-bold">My Profile</h1>
          <div className="space-y-6 bg-white px-4">
            <Input
              name="name"
              label="Name"
              required={true}
              value={defaults.name}
              inputRef={register}
            />
            <ErrorMessage
              errors={formState.errors}
              name="name"
              as={ErrorMessageTag}
            />
            <Input
              name="email"
              label="Email"
              required={true}
              value={defaults.email}
              inputRef={register}
            />
            <ErrorMessage
              errors={formState.errors}
              name="email"
              as={ErrorMessageTag}
            />
            <Input
              name="license"
              label="Surveyor License"
              required={false}
              value={defaults.license}
              inputRef={register}
            />
            <ErrorMessage
              errors={formState.errors}
              name="license"
              as={ErrorMessageTag}
            />
            <div>
              <Label className="font-semibold">Surveyor Seal Image</Label>
              <div className="flex items-center p-2">
                <span className="mr-2 inline-block h-20 w-20 overflow-hidden rounded-full bg-slate-100">
                  <svg
                    className="h-full w-full text-slate-300"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </span>
                <Button type="button" style="alternate">
                  Change
                </Button>
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="submit">Save</Button>
          </div>
        </Card>
      </form>
    </div>
  );
}
