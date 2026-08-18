import { ErrorMessage } from '@hookform/error-message';
import { yupResolver } from '@hookform/resolvers/yup';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { type Profile as SubmissionProfile, profileSchema as schema } from '@ugrc/plss-shared/corner-submission/schema';
import { useFirebaseAuth } from '@ugrc/utah-design-system/contexts/FirebaseAuthProvider';
import { useFirebaseFunctions } from '@ugrc/utah-design-system/contexts/FirebaseFunctionsProvider';
import { httpsCallable } from 'firebase/functions';
import { type Dispatch, useEffect } from 'react';
import { Controller, type Resolver, type UseFormHandleSubmit, useForm, useWatch } from 'react-hook-form';
import { Button } from '../formElements/Buttons.tsx';
import Card from '../formElements/Card.tsx';
import FileUpload from '../formElements/FileUpload.tsx';
import { Input, Label } from '../formElements/Inputs.tsx';
import Note from '../formElements/Note.tsx';
import usePageView from '../hooks/usePageView.ts';
import type { AppAction } from '../reducers/AppReducer.ts';
import ErrorMessageTag from './ErrorMessage.tsx';

type ProfileFormValues = Omit<SubmissionProfile, 'license' | 'seal'> & {
  license: string;
  seal: string;
};

type SavedProfile = {
  displayName: string;
  email: string;
  license: string | null;
  seal: string | null;
};

type ProfileProps = {
  dispatch?: Dispatch<AppAction | undefined>;
};

const defaultValues: ProfileFormValues = {
  displayName: '',
  email: '',
  license: '',
  seal: '',
};

const toFormValues = (profile: Partial<SubmissionProfile> | SavedProfile): ProfileFormValues => ({
  displayName: profile.displayName ?? '',
  email: profile.email ?? '',
  license: profile.license ?? '',
  seal: profile.seal ?? '',
});

export default function Profile({ dispatch }: ProfileProps) {
  const { functions } = useFirebaseFunctions();
  const { currentUser } = useFirebaseAuth();
  const uid = currentUser?.uid;

  const getProfile = httpsCallable<undefined, Partial<SubmissionProfile>>(functions, 'getProfile');
  const updateProfile = httpsCallable<ProfileFormValues, SavedProfile>(functions, 'postProfile');

  const queryClient = useQueryClient();

  usePageView('screen-edit-profile');

  const { data: response, status: profileStatus } = useQuery({
    queryKey: ['profile', uid],
    enabled: currentUser !== undefined,
    queryFn: () => getProfile(),
    placeholderData: {
      data: {
        displayName: currentUser?.displayName ?? '',
        license: '',
      },
    },
    staleTime: Infinity,
  });

  const { control, formState, handleSubmit, register, reset, setFocus } = useForm<ProfileFormValues>({
    resolver: yupResolver(schema) as Resolver<ProfileFormValues>,
    defaultValues,
  });
  const typedHandleSubmit = handleSubmit as UseFormHandleSubmit<ProfileFormValues>;
  const fields = useWatch({ control });

  useEffect(() => {
    setFocus('displayName');
  }, [setFocus]);

  const { mutate, status } = useMutation({
    mutationKey: ['update profile', uid],
    mutationFn: (data: ProfileFormValues) => updateProfile(data),
    onSuccess: (response) => {
      reset(toFormValues(response.data));
      queryClient.invalidateQueries({ queryKey: ['profile', uid] });
    },
    onError: (error) => {
      console.warn('error', error);
      reset();
    },
  });

  useEffect(() => {
    if (profileStatus === 'success' && response) {
      reset(toFormValues(response.data));
    }
  }, [profileStatus, reset, response]);

  const onSubmit = (payload: ProfileFormValues) => {
    mutate(payload);
  };

  return (
    <div className="mt-5">
      <form onSubmit={typedHandleSubmit(onSubmit)}>
        <Card>
          <h2 className="mb-4 text-2xl font-bold">Personal Information</h2>
          {profileStatus === 'pending' ? (
            <p>Loading...</p>
          ) : (
            <>
              <Input label="Name" required={true} {...register('displayName')} />
              <ErrorMessage errors={formState.errors} name="displayName" as={ErrorMessageTag} />
              <Input label="Email" required={true} {...register('email')} />
              <ErrorMessage errors={formState.errors} name="email" as={ErrorMessageTag} />
              <Input label="Surveyor License" required={false} {...register('license')} />
              <ErrorMessage errors={formState.errors} name="license" as={ErrorMessageTag} />
              <Label htmlFor="seal" className="font-semibold">
                Surveyor Seal Image
              </Label>
              <Controller
                name="seal"
                control={control}
                render={({ field: { onChange, name } }) => (
                  <FileUpload
                    id="seal"
                    defaultFileName={name}
                    path={`submitters/${uid ?? ''}/profile`}
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
              <ErrorMessage errors={formState.errors} name="seal" as={ErrorMessageTag} />
              <Note>
                Your surveyor license and seal will be displayed publicly on monument record sheets. No other personal
                information will be shared or made public.
              </Note>
              <div className="mt-4 flex justify-between">
                <Button
                  type="button"
                  style="secondary"
                  onClick={() => dispatch?.({ type: 'menu/toggle', payload: 'login' })}
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
