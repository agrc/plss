import { Field, Label as HeadlessLabel } from '@headlessui/react';
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/20/solid';
import { ErrorMessage } from '@hookform/error-message';
import { yupResolver } from '@hookform/resolvers/yup';
import { type ExistingSheet, existingSheetSchema } from '@ugrc/plss-shared/corner-submission/schema';
import { useFirebaseAuth } from '@ugrc/utah-design-system/contexts/FirebaseAuthProvider';
import { Controller, type Resolver, type UseFormHandleSubmit, useForm, useWatch } from 'react-hook-form';
import { useSubmissionContext } from '../../contexts/SubmissionContext.tsx';
import { Link } from '../../formElements/Buttons.tsx';
import FileUpload from '../../formElements/FileUpload.tsx';
import { NumberedForm, NumberedFormSection } from '../../formElements/Form.tsx';
import Spacer from '../../formElements/Spacer.tsx';
import { Switch } from '../../formElements/Switch.tsx';
import usePageView from '../../hooks/usePageView.ts';
import ErrorMessageTag from '../../pageElements/ErrorMessage.tsx';
import type { AppAction } from '../../reducers/AppReducer.ts';
import Wizard from './Wizard.tsx';

type ExistingSheetFormValues = {
  mrrc: ExistingSheet['mrrc'];
  pdf: ExistingSheet['pdf'] | '';
};

const defaults: ExistingSheetFormValues = {
  pdf: '',
  mrrc: false,
};

type MonumentPdfProps = {
  dispatch: (action: AppAction) => void;
};

export default function MonumentPdf({ dispatch }: MonumentPdfProps) {
  const { currentUser } = useFirebaseAuth();
  const [state, send] = useSubmissionContext();
  usePageView('screen-submission-pdf');

  const savedSheet = state.context.existing as Partial<ExistingSheetFormValues> | undefined;
  const defaultValues: ExistingSheetFormValues = {
    ...defaults,
    ...savedSheet,
    mrrc: typeof savedSheet?.mrrc === 'boolean' ? savedSheet.mrrc : false,
  };

  const { handleSubmit, control, formState } = useForm<ExistingSheetFormValues>({
    resolver: yupResolver(existingSheetSchema) as Resolver<ExistingSheetFormValues>,
    defaultValues,
  });
  const typedHandleSubmit = handleSubmit as UseFormHandleSubmit<ExistingSheetFormValues>;

  const value = useWatch({ control, name: 'pdf' });

  const onSubmit = (payload: ExistingSheetFormValues) => {
    if (!payload.pdf) {
      return;
    }

    send({ type: 'NEXT', meta: 'existing', payload });
  };

  return (
    <>
      <h2 className="text-2xl font-semibold">Monument Sheet</h2>
      <Spacer className="my-4" />
      <NumberedForm onSubmit={typedHandleSubmit(onSubmit)}>
        <NumberedFormSection number={1} title="Existing sheet">
          <label htmlFor="existing-sheet" className="sr-only">
            Existing sheet
          </label>
          <Controller
            name="pdf"
            control={control}
            render={({ field: { onChange } }) => (
              <FileUpload
                defaultFileName="existing-sheet"
                path={`submitters/${currentUser?.uid ?? ''}/existing/${state.context.blmPointId ?? ''}`}
                contentTypes={[{ name: 'PDF', value: 'application/pdf' }]}
                maxFileSize={5}
                value={value}
                onChange={onChange}
              />
            )}
          />
          <ErrorMessage errors={formState.errors} name="pdf" as={ErrorMessageTag} />
        </NumberedFormSection>
        <NumberedFormSection number={2} title="MRRC">
          <div>
            <div className="font-semibold">
              Associated with a{' '}
              <abbr className="cursor-help" title="Monument Replacement and Restoration Committee">
                MRRC
              </abbr>{' '}
              Project
            </div>
            <Field>
              <HeadlessLabel className="sr-only">MRRC Project</HeadlessLabel>
              <div className="flex justify-between">
                <Controller
                  control={control}
                  name="mrrc"
                  render={({ field }) => (
                    <Switch
                      screenReader="Toggle that this associated with a Monument Replacement and Restoration Committee project?"
                      {...field}
                    />
                  )}
                />
                <Link
                  target="_blank"
                  rel="noopener noreferrer"
                  href="https://le.utah.gov/xcode/Title63A/Chapter16/63A-16-S509.html"
                >
                  Help
                  <ArrowTopRightOnSquareIcon className="align-center not-sr-only ml-1 inline-flex h-5 w-5" />
                </Link>
              </div>
            </Field>
            <ErrorMessage errors={formState.errors} name="mrrc" as={ErrorMessageTag} />
          </div>
        </NumberedFormSection>
        <NumberedFormSection number={0} title={undefined}>
          <Wizard next={true} back={() => dispatch({ type: 'menu/toggle', payload: 'identify' })} />
        </NumberedFormSection>
      </NumberedForm>
    </>
  );
}
