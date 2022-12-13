import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { httpsCallable } from 'firebase/functions';
import { useUser, useFunctions } from 'reactfire';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { ErrorMessage } from '@hookform/error-message';
import ErrorMessageTag from './ErrorMessage.jsx';
import { profileSchema as schema } from './CornerSubmission/Schema.mjs';
import { Input, Label } from '../formElements/Inputs.jsx';
import Card from '../formElements/Card.jsx';
import { Button } from '../formElements/Buttons.jsx';
import { ImageUpload } from '../formElements/ImageUpload.jsx';
import Note from '../formElements/Note.jsx';

const defaultValues = {
  displayName: '',
  email: '',
  license: '',
  seal: '',
};

export default function Profile({ dispatch }) {
  const functions = useFunctions();
  const { data } = useUser();

  const getProfile = httpsCallable(functions, 'functions-httpsGetProfile');
  const updateProfile = httpsCallable(functions, 'functions-httpsPostProfile');

  const { data: response, status: profileStatus } = useQuery(
    ['profile', data?.uid],
    getProfile,
    {
      enabled: data?.uid?.length > 0,
    }
  );

  const { control, formState, handleSubmit, register, reset } = useForm({
    resolver: yupResolver(schema),
    defaultValues,
  });
  const fields = useWatch({ control });

  const { mutate, status } = useMutation(
    ['update profile', data.uid],
    (data) => updateProfile(data),
    {
      onSuccess: (response) => {
        reset(response.data);
      },
      onError: (error) => {
        console.warn('error', error);
        reset();
      },
    }
  );

  useEffect(() => {
    if (profileStatus === 'success') {
      reset(response.data);
    }
  }, [profileStatus, reset, response]);

  const onSubmit = (payload) => {
    mutate(payload);
  };

  return (
    <div className="mt-5">
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <h1 className="mb-4 text-2xl font-bold">Personal Information</h1>
          {profileStatus === 'loading' ? (
            <p>Loading...</p>
          ) : (
            <>
              <Input
                name="displayName"
                label="Name"
                required={true}
                value={fields[name]}
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
                value={fields[name]}
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
                value={fields[name]}
                inputRef={register}
              />
              <ErrorMessage
                errors={formState.errors}
                name="license"
                as={ErrorMessageTag}
              />
              <Label htmlFor="seal" className="font-semibold">
                Surveyor Seal Image
              </Label>
              <Controller
                name="seal"
                control={control}
                render={({ field: { onChange, name } }) => (
                  <ImageUpload
                    defaultFileName={name}
                    value={fields[name]}
                    path={`submitters/${data.uid}/profile`}
                    onChange={onChange}
                  />
                )}
              />
              <ErrorMessage
                errors={formState.errors}
                name="seal"
                as={ErrorMessageTag}
              />
              <Note>
                Your surveyor license and seal will be displayed publicly on
                monument record sheets. No other personal information will be
                shared or made public.
              </Note>
              <div className="mt-4 flex justify-between">
                <Button
                  type="button"
                  style="secondary"
                  onClick={() =>
                    dispatch({ type: 'menu/toggle', payload: 'login' })
                  }
                >
                  Back
                </Button>
                <Button type="submit" state={status}>
                  Save
                </Button>
              </div>
            </>
          )}
        </Card>
      </form>
    </div>
  );
}
Profile.propTypes = {
  dispatch: PropTypes.func,
};
