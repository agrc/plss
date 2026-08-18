import { ErrorMessage } from '@hookform/error-message';
import { yupResolver } from '@hookform/resolvers/yup';
import { type Images as ImagesValues, imagesSchema as schema } from '@ugrc/plss-shared/corner-submission/schema';
import { useFirebaseAuth } from '@ugrc/utah-design-system/contexts/FirebaseAuthProvider';
import { Fragment, useState } from 'react';
import { Controller, type Resolver, type UseFormHandleSubmit, useForm, useWatch } from 'react-hook-form';
import { useSubmissionContext } from '../../contexts/SubmissionContext.tsx';
import { Button } from '../../formElements/Buttons.tsx';
import FileUpload from '../../formElements/FileUpload.tsx';
import { NumberedForm, NumberedFormSection } from '../../formElements/Form.tsx';
import Spacer from '../../formElements/Spacer.tsx';
import usePageView from '../../hooks/usePageView.ts';
import ErrorMessageTag from '../../pageElements/ErrorMessage.tsx';
import Wizard from './Wizard.tsx';

const limit = 10;
const extraFields = [
  'extra1',
  'extra2',
  'extra3',
  'extra4',
  'extra5',
  'extra6',
  'extra7',
  'extra8',
  'extra9',
  'extra10',
] as const;

type ImagesFormValues = {
  [Key in keyof ImagesValues]: ImagesValues[Key] | '';
};

const defaults: ImagesFormValues = {
  map: '',
  monument: '',
  closeUp: '',
  extra1: '',
  extra2: '',
  extra3: '',
  extra4: '',
  extra5: '',
  extra6: '',
  extra7: '',
  extra8: '',
  extra9: '',
  extra10: '',
};

export default function MonumentImages() {
  const { currentUser } = useFirebaseAuth();
  const [state, send] = useSubmissionContext();
  usePageView('screen-submission-images');

  const savedImages = state.context.images as Partial<ImagesFormValues> | undefined;
  const defaultValues: ImagesFormValues = { ...defaults, ...savedImages };

  const [extraPageCount, setExtraPageCount] = useState(() => {
    return extraFields.reduce((largestExtraPage, field, index) => {
      return defaultValues[field] ? index + 1 : largestExtraPage;
    }, 1);
  });

  const { handleSubmit, control, formState } = useForm<ImagesFormValues>({
    resolver: yupResolver(schema) as Resolver<ImagesFormValues>,
    defaultValues,
  });
  const typedHandleSubmit = handleSubmit as UseFormHandleSubmit<ImagesFormValues>;

  const fields = useWatch({ control });

  const onSubmit = (payload: ImagesFormValues) => {
    send({ type: 'NEXT', meta: 'images', payload });
  };

  return (
    <>
      <h2 className="text-2xl font-semibold">Monument Images</h2>
      <p className="text-sm leading-none">
        All image/files are optional.
        <br />
        Acceptable file types are jpg, png, plus pdf for the Extra Pages.
      </p>
      <Spacer className="my-4" />
      <NumberedForm onSubmit={typedHandleSubmit(onSubmit)}>
        <NumberedFormSection number={1} title="Map view or sketch">
          <label htmlFor="map" className="sr-only">
            Map view or sketch
          </label>
          <Controller
            name="map"
            control={control}
            render={({ field: { onChange, name } }) => (
              <FileUpload
                defaultFileName={name}
                path={`submitters/${currentUser?.uid ?? ''}/new/${state.context.blmPointId ?? ''}`}
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
          <ErrorMessage errors={formState.errors} name="map" as={ErrorMessageTag} />
        </NumberedFormSection>
        <NumberedFormSection number={2} title="Monument area">
          <label htmlFor="monument" className="sr-only">
            Monument area
          </label>
          <Controller
            name="monument"
            control={control}
            render={({ field: { onChange, name } }) => (
              <FileUpload
                defaultFileName={name}
                path={`submitters/${currentUser?.uid ?? ''}/new/${state.context.blmPointId ?? ''}`}
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
          <ErrorMessage errors={formState.errors} name="monument" as={ErrorMessageTag} />
        </NumberedFormSection>
        <NumberedFormSection number={3} title="Monument close-up">
          <label htmlFor="closeUp" className="sr-only">
            Monument close-up
          </label>
          <Controller
            name="closeUp"
            control={control}
            render={({ field: { onChange, name } }) => (
              <FileUpload
                defaultFileName={name}
                path={`submitters/${currentUser?.uid ?? ''}/new/${state.context.blmPointId ?? ''}`}
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
          <ErrorMessage errors={formState.errors} name="closeUp" as={ErrorMessageTag} />
        </NumberedFormSection>
        <NumberedFormSection number={4} title="Extra pages">
          {extraFields.slice(0, extraPageCount).map((field, index) => (
            <Fragment key={field}>
              <label htmlFor={field} className="sr-only">
                Extra page {index + 1}
              </label>
              <Controller
                name={field}
                control={control}
                render={({ field: { onChange, name } }) => (
                  <FileUpload
                    defaultFileName={name}
                    path={`submitters/${currentUser?.uid ?? ''}/new/${state.context.blmPointId ?? ''}`}
                    contentTypes={[
                      { name: 'PDF', value: 'application/pdf' },
                      { name: 'PNG', value: 'image/png' },
                      { name: 'JPEG', value: 'image/jpeg' },
                    ]}
                    maxFileSize={5}
                    value={fields[name]}
                    onChange={onChange}
                  />
                )}
              />
              <ErrorMessage errors={formState.errors} name={field} as={ErrorMessageTag} />
            </Fragment>
          ))}
          {limit - extraPageCount} extra pages are allowed
          <Button
            style="alternate"
            state={extraPageCount >= limit ? 'disabled' : 'idle'}
            onClick={() => {
              const nextPage = extraPageCount + 1;
              if (nextPage > limit) {
                return;
              }

              setExtraPageCount(nextPage);
            }}
          >
            Add another file
          </Button>
        </NumberedFormSection>
        <NumberedFormSection number={0} title={undefined}>
          <Wizard back={() => send({ type: 'BACK' })} next={true} />
        </NumberedFormSection>
      </NumberedForm>
    </>
  );
}
