import { ArrowTopRightOnSquareIcon } from '@heroicons/react/20/solid';
import { ErrorMessage } from '@hookform/error-message';
import { yupResolver } from '@hookform/resolvers/yup';
import { useFirebaseAuth } from '@ugrc/utah-design-system';
import PropTypes from 'prop-types';
import { useContext } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { existingSheetSchema } from '../../../../functions/shared/cornerSubmission/Schema.js';
import { SubmissionContext } from '../../contexts/SubmissionContext.jsx';
import { Link } from '../../formElements/Buttons.jsx';
import FileUpload from '../../formElements/FileUpload.jsx';
import { NumberedForm, NumberedFormSection } from '../../formElements/Form.jsx';
import Spacer from '../../formElements/Spacer.jsx';
import { Switch } from '../../formElements/Switch.jsx';
import usePageView from '../../hooks/usePageView.jsx';
import ErrorMessageTag from '../../pageElements/ErrorMessage.jsx';
import Wizard from './Wizard.jsx';

const defaults = {
  pdf: '',
  mrrc: false,
};

export default function MonumentPdf({ dispatch }) {
  const { currentUser } = useFirebaseAuth();
  const [state, send] = useContext(SubmissionContext);
  usePageView('screen-submission-pdf');

  let defaultValues = state.context.existing;
  if (!defaultValues) {
    defaultValues = defaults;
  }

  if (typeof defaultValues?.mrrc !== 'boolean') {
    defaultValues.mrrc = false;
  }

  const { handleSubmit, control, formState } = useForm({
    resolver: yupResolver(existingSheetSchema),
    defaultValues,
  });

  const value = useWatch({ control, name: 'pdf' });

  const onSubmit = (payload) => {
    send({ type: 'NEXT', meta: 'existing', payload });
  };

  return (
    <>
      <h2 className="text-2xl font-semibold">Monument Sheet</h2>
      <Spacer className="my-4" />
      <NumberedForm onSubmit={handleSubmit(onSubmit)}>
        <NumberedFormSection number={1} title="Existing sheet">
          <Controller
            name="pdf"
            control={control}
            render={({ field: { onChange } }) => (
              <FileUpload
                defaultFileName="existing-sheet"
                path={`submitters/${currentUser.uid}/existing/${state.context.blmPointId}`}
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
            <label htmlFor="mrrc" className="font-semibold">
              Associated with a{' '}
              <abbr className="cursor-help" title="Monument Replacement and Restoration Committee">
                MRRC
              </abbr>{' '}
              Project
            </label>
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
            <ErrorMessage errors={formState.errors} name="mrrc" as={ErrorMessageTag} />
          </div>
        </NumberedFormSection>
        <NumberedFormSection number={0}>
          <Wizard next={true} back={() => dispatch({ type: 'menu/toggle', payload: 'identify' })} />
        </NumberedFormSection>
      </NumberedForm>
    </>
  );
}
MonumentPdf.propTypes = {
  dispatch: PropTypes.func,
};
