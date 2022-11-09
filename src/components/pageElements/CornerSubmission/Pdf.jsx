import { useContext, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { useStorage, useUser, useStorageTask } from 'reactfire';
import { ref, uploadBytesResumable } from 'firebase/storage';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { ErrorMessage } from '@hookform/error-message';
import { DocumentCheckIcon } from '@heroicons/react/24/outline';
import { SubmissionContext } from '../../contexts/SubmissionContext.jsx';
import { NumberedForm, NumberedFormSection } from '../../formElements/Form.jsx';
import { Button } from '../../formElements/Buttons.jsx';
import Spacer from '../../formElements/Spacer.jsx';
import ErrorMessageTag from '../../pageElements/ErrorMessage.jsx';
import Wizard from './Wizard.jsx';
import { existingSheetSchema } from './Schema';

export default function MonumentPdf({ dispatch }) {
  const [state, send] = useContext(SubmissionContext);
  const defaultValues = state.context.existing;

  const { handleSubmit, control, formState } = useForm({
    resolver: yupResolver(existingSheetSchema),
    defaultValues,
  });

  const onSubmit = (payload) => {
    send({ type: 'NEXT', meta: 'existing', payload });
  };

  const deleteAttachment = () => {};

  return (
    <>
      <h3 className="text-2xl font-semibold">Monument Sheet</h3>
      <Spacer className="my-4" />
      <NumberedForm onSubmit={handleSubmit(onSubmit)}>
        <NumberedFormSection number={1} title="Existing sheet">
          <Controller
            name="pdf"
            control={control}
            render={({ field: { onChange } }) =>
              defaultValues?.pdf ? (
                <Attachment
                  name="existing-sheet.pdf"
                  document={defaultValues.pdf}
                  id={state.context.blmPointId}
                  onChange={onChange}
                />
              ) : (
                <PdfUpload
                  defaultFileName="existing-sheet"
                  id={state.context.blmPointId}
                  onChange={onChange}
                />
              )
            }
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
            clear={deleteAttachment}
          />
        </NumberedFormSection>
      </NumberedForm>
    </>
  );
}
MonumentPdf.propTypes = {
  dispatch: PropTypes.func,
};
function PdfUpload({ defaultFileName, onChange, id }) {
  const { data: user } = useUser();
  const storage = useStorage();
  const [uploadTask, setUploadTask] = useState();
  const [fileReference, setFileReference] = useState();
  const [status, setStatus] = useState('idle');
  const message = useRef();

  const uploadImage = (event) => {
    const fileList = event.target.files;
    const fileToUpload = fileList[0];
    let fileName = fileToUpload.name;

    if (defaultFileName) {
      const [, ext] = fileName.split('.');
      fileName = `${defaultFileName}.${ext}`;
    }

    const path = `submitters/${user.uid}/existing/${id}/${fileName}`;
    const fileRef = ref(storage, path);

    setFileReference(fileRef);
    setStatus('loading');

    const task = uploadBytesResumable(fileRef, fileToUpload, {
      contentType: fileToUpload.type,
    });

    task
      .then(() => {
        setUploadTask(undefined);
        setStatus('success');
        onChange(fileRef.fullPath);
      })
      .catch(() => {
        try {
          if (task.snapshot.totalBytes > 5 * 1024 * 1024) {
            setStatus('error');
            message.current = `You can only upload pdf's smaller than 5MB. That image was ${(
              task.snapshot.totalBytes /
              1024 /
              1024
            ).toFixed(2)}MB.`;
          } else if (task.snapshot.metadata.contentType !== 'application/pdf') {
            setStatus('error');
            message.current = `You can only upload pdf's. That was a ${
              task.snapshot.metadata.contentType
                ? task.snapshot.metadata.contentType
                : 'unknown type'
            }.`;
          } else {
            setStatus('error');
            message.current = 'Permission denied. Please try again.';
          }
        } catch {
          setStatus('error');
          message.current = 'Permission denied. Please try again.';
        }
        setUploadTask(undefined);
      });

    setUploadTask(task);
  };

  return (
    <>
      <input
        type="file"
        onChange={uploadImage}
        className="text-center text-sm text-slate-400 file:flex file:min-h-[2rem] file:w-fit file:cursor-pointer file:rounded-full file:border-2
        file:border-solid file:border-sky-600 file:bg-sky-500 file:px-7 file:py-1 file:text-sm
        file:font-semibold file:text-white file:transition-all file:duration-200 file:ease-in-out hover:file:bg-sky-600
        file:focus:border-sky-500 file:focus:outline-none file:focus:ring-2 file:focus:ring-sky-600 file:focus:ring-opacity-50
        file:active:bg-sky-700 file:disabled:cursor-not-allowed file:disabled:opacity-50"
      />
      {uploadTask && (
        <UploadProgress uploadTask={uploadTask} storageRef={fileReference} />
      )}
      {status === 'error' && (
        <p className="m-4 rounded border p-4 text-center text-amber-300">
          {message.current}
        </p>
      )}
      {status === 'success' && (
        <div className="inline-flex items-center justify-center">
          <span className="h-8 w-8 text-green-300">
            <DocumentCheckIcon />
          </span>
        </div>
      )}
    </>
  );
}
PdfUpload.propTypes = {
  defaultFileName: PropTypes.string,
  onChange: PropTypes.func,
  id: PropTypes.string,
};

const UploadProgress = ({ uploadTask, storageRef }) => {
  const { status, data: uploadProgress } = useStorageTask(
    uploadTask,
    storageRef
  );

  if (status === 'loading') {
    return <>loading</>;
  }

  if (uploadProgress) {
    const { bytesTransferred, totalBytes } = uploadProgress;

    const percentComplete =
      Math.round(100 * (bytesTransferred / totalBytes)) + '%';
    return <span>{percentComplete}</span>;
  }
};
UploadProgress.propTypes = {
  uploadTask: PropTypes.object.isRequired,
  storageRef: PropTypes.object.isRequired,
};

function Attachment({ name }) {
  return (
    <div className="flex justify-between">
      <div>{name}</div>
      <Button style="secondary">Remove</Button>
    </div>
  );
}
Attachment.propTypes = {
  name: PropTypes.string,
  onChange: PropTypes.func,
  id: PropTypes.string,
};
