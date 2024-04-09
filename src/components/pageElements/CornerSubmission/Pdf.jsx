import { useContext } from 'react';
import PropTypes from 'prop-types';
import { useUser } from 'reactfire';
import { useForm, useWatch, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { ErrorMessage } from '@hookform/error-message';
import { SubmissionContext } from '../../contexts/SubmissionContext.jsx';
import FileUpload from '../../formElements/FileUpload.jsx';
import { NumberedForm, NumberedFormSection } from '../../formElements/Form.jsx';
import Spacer from '../../formElements/Spacer.jsx';
import ErrorMessageTag from '../../pageElements/ErrorMessage.jsx';
import Wizard from './Wizard.jsx';
import { existingSheetSchema } from '../../../../functions/shared/cornerSubmission/Schema.js';
import usePageView from '../../hooks/usePageView.jsx';

export default function MonumentPdf({ dispatch }) {
  const { data: user } = useUser();
  const [state, send] = useContext(SubmissionContext);
  usePageView('screen-submission-pdf');

  const defaultValues = state.context.existing;

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
                path={`submitters/${user.uid}/existing/${state.context.blmPointId}`}
                contentTypes={[{ name: 'PDF', value: 'application/pdf' }]}
                maxFileSize={5}
                value={value}
                onChange={onChange}
              />
            )}
          />
          <ErrorMessage
            errors={formState.errors}
            name="pdf"
            as={ErrorMessageTag}
          />
        </NumberedFormSection>
        <NumberedFormSection number={0}>
          <Wizard
            next={true}
            back={() => dispatch({ type: 'menu/toggle', payload: 'identify' })}
          />
        </NumberedFormSection>
      </NumberedForm>
    </>
  );
}
MonumentPdf.propTypes = {
  dispatch: PropTypes.func,
};
