import { useContext, useState } from 'react';
import { useUser } from 'reactfire';
import { useForm, useWatch, Controller } from 'react-hook-form';
import { ErrorMessage } from '@hookform/error-message';
import { yupResolver } from '@hookform/resolvers/yup';
import { imagesSchema as schema } from './Schema.mjs';
import { SubmissionContext } from '../../contexts/SubmissionContext.jsx';
import { NumberedForm, NumberedFormSection } from '../../formElements/Form.jsx';
import Spacer from '../../formElements/Spacer.jsx';
import ErrorMessageTag from '../../pageElements/ErrorMessage.jsx';
import { Button } from '../../formElements/Buttons.jsx';
import FileUpload from '../../formElements/FileUpload.jsx';
import Wizard from './Wizard.jsx';

const limit = 10;
const defaults = {
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
  const { data: user } = useUser();
  const [state, send] = useContext(SubmissionContext);

  let defaultValues = state.context?.images;
  if (!defaultValues) {
    defaultValues = defaults;
  }

  const [extraPageCount, setExtraPageCount] = useState(() => {
    let largestExtraPage = 1;
    for (let i = 1; i <= limit; i++) {
      if (defaultValues[`extra${i}`]) {
        largestExtraPage = i;
      }
    }

    console.log('largestExtraPage', largestExtraPage);

    return largestExtraPage;
  });

  const { handleSubmit, control, formState } = useForm({
    resolver: yupResolver(schema),
    defaultValues,
  });

  const fields = useWatch({ control });

  const onSubmit = (payload) => {
    send({ type: 'NEXT', meta: 'images', payload });
  };

  return (
    <>
      <h3 className="text-2xl font-semibold">Monument Images</h3>
      <p className="text-sm leading-none">
        All image/files are optional.
        <br />
        Acceptable file types are jpg, png, plus pdf for the Extra Pages.
      </p>
      <Spacer className="my-4" />
      <NumberedForm onSubmit={handleSubmit(onSubmit)}>
        <NumberedFormSection number={1} title="Map view or sketch">
          <Controller
            name="map"
            control={control}
            render={({ field: { onChange, name } }) => (
              <FileUpload
                defaultFileName={name}
                path={`submitters/${user.uid}/new/${state.context.blmPointId}`}
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
            name="map"
            as={ErrorMessageTag}
          />
        </NumberedFormSection>
        <NumberedFormSection number={2} title="Monument area">
          <Controller
            name="monument"
            control={control}
            render={({ field: { onChange, name } }) => (
              <FileUpload
                defaultFileName={name}
                path={`submitters/${user.uid}/new/${state.context.blmPointId}`}
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
            name="monument"
            as={ErrorMessageTag}
          />
        </NumberedFormSection>
        <NumberedFormSection number={3} title="Monument close-up">
          <Controller
            name="closeUp"
            control={control}
            render={({ field: { onChange, name } }) => (
              <FileUpload
                defaultFileName={name}
                path={`submitters/${user.uid}/new/${state.context.blmPointId}`}
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
            name="closeUp"
            as={ErrorMessageTag}
          />
        </NumberedFormSection>
        <NumberedFormSection number={4} title="Extra pages">
          {new Array(extraPageCount).fill().map((_, i) => (
            <>
              <Controller
                name={`extra${i + 1}`}
                control={control}
                render={({ field: { onChange, name } }) => (
                  <FileUpload
                    key={i}
                    defaultFileName={name}
                    path={`submitters/${user.uid}/new/${state.context.blmPointId}`}
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
              <ErrorMessage
                errors={formState.errors}
                name={`extra${i}`}
                as={ErrorMessageTag}
              />
            </>
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
        <NumberedFormSection number={0}>
          <Wizard back={() => send('BACK')} next={true} />
        </NumberedFormSection>
      </NumberedForm>
    </>
  );
}
