import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { httpsCallable } from 'firebase/functions';
import { useUser, useFunctions } from 'reactfire';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { ErrorMessage } from '@hookform/error-message';
import ErrorMessageTag from './ErrorMessage.jsx';
import { profileSchema as schema } from './CornerSubmission/Schema.mjs';
import { Input, Label } from '../formElements/Inputs.jsx';
import Card from '../formElements/Card.jsx';
import { Button } from '../formElements/Buttons.jsx';
import FileUpload from '../formElements/FileUpload.jsx';
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

  const queryClient = useQueryClient();

  const { data: response, status: profileStatus } = useQuery({
    queryKey: ['profile', data.uid],
    enabled: data?.uid?.length > 0,
    queryFn: getProfile,
    placeholderData: {
      data: {
        displayName: data?.displayName ?? '',
        license: '',
      },
    },
    staleTime: Infinity,
  });

  const { control, formState, handleSubmit, register, reset, setFocus } =
    useForm({
      resolver: yupResolver(schema),
      defaultValues,
    });
  const fields = useWatch({ control });

  useEffect(() => {
    setFocus('displayName');
  }, [setFocus]);

  const { mutate, status } = useMutation({
    mutationKey: ['update profile', data.uid],
    mutationFn: (data) => updateProfile(data),
    onSuccess: (response) => {
      reset(response.data);
      queryClient.invalidateQueries({ queryKey: ['profile', data.uid] });
    },
    onError: (error) => {
      console.warn('error', error);
      reset();
    },
  });

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
                label="Name"
                required={true}
                {...register('displayName')}
              />
              <ErrorMessage
                errors={formState.errors}
                name="name"
                as={ErrorMessageTag}
              />
              <Input label="Email" required={true} {...register('email')} />
              <ErrorMessage
                errors={formState.errors}
                name="email"
                as={ErrorMessageTag}
              />
              <Input
                label="Surveyor License"
                required={false}
                {...register('license')}
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
                  <FileUpload
                    defaultFileName={name}
                    path={`submitters/${data.uid}/profile`}
                    contentTypes={[
                      { name: 'PNG', value: 'image/png' },
                      { name: 'JPEG', value: 'image/jpeg' },
                    ]}
                    maxFileSize={5}
                    value={fields[name]}
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
