import { useContext, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import {
  useStorage,
  useUser,
  useStorageDownloadURL,
  useStorageTask,
} from 'reactfire';
import { ref, uploadBytesResumable } from 'firebase/storage';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { imagesSchema as schema } from './Schema';
import { SubmissionContext } from '../../contexts/SubmissionContext.jsx';
import { NumberedForm, NumberedFormSection } from '../../formElements/Form.jsx';
import Spacer from '../../formElements/Spacer.jsx';
import { Button } from '../../formElements/Buttons.jsx';
import Wizard from './Wizard.jsx';

const limit = 10;
const defaults = {
  map: '',
  monument: '',
  'close-up': '',
  'extra-1': '',
  'extra-2': '',
  'extra-3': '',
  'extra-4': '',
  'extra-5': '',
  'extra-6': '',
  'extra-7': '',
  'extra-8': '',
  'extra-9': '',
  'extra-10': '',
};
export default function MonumentImages() {
  const [state, send] = useContext(SubmissionContext);
  const [extraPageCount, setExtraPageCount] = useState(1);

  let defaultValues = state.context?.images;
  if (!defaultValues) {
    defaultValues = defaults;
  }
  const { handleSubmit, control } = useForm({
    resolver: yupResolver(schema),
    defaultValues,
  });

  const onSubmit = (payload) => {
    send({ type: 'NEXT', meta: 'images', payload });
  };

  return (
    <>
      <h3 className="text-2xl font-semibold">Monument Images</h3>
      <p className="text-sm leading-none">All images are optional</p>
      <Spacer className="my-4" />
      <NumberedForm onSubmit={handleSubmit(onSubmit)}>
        <NumberedFormSection number={1} title="Map view or sketch">
          <Controller
            name="map"
            control={control}
            render={({ field: { onChange } }) => (
              <ImageUpload defaultFileName="map" onChange={onChange} />
            )}
          />
        </NumberedFormSection>
        <NumberedFormSection number={2} title="Monument area">
          <Controller
            name="monument"
            control={control}
            render={({ field: { onChange } }) => (
              <ImageUpload defaultFileName="monument" onChange={onChange} />
            )}
          />
        </NumberedFormSection>
        <NumberedFormSection number={3} title="Monument close-up">
          <Controller
            name="close-up"
            control={control}
            render={({ field: { onChange } }) => (
              <ImageUpload defaultFileName="close-up" onChange={onChange} />
            )}
          />
        </NumberedFormSection>
        <NumberedFormSection number={4} title="Extra pages">
          {new Array(extraPageCount).fill().map((_, i) => (
            <Controller
              name={`extra-${i}`}
              control={control}
              key={i}
              render={({ field: { onChange } }) => (
                <ImageUpload
                  defaultFileName={`extra-${i}`}
                  onChange={onChange}
                />
              )}
            />
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
            Add another image
          </Button>
        </NumberedFormSection>
        <NumberedFormSection number={0}>
          <Wizard back={() => send('BACK')} next={true} clear={false} />
        </NumberedFormSection>
      </NumberedForm>
    </>
  );
}

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

const ImagePreview = ({ storagePath }) => {
  const storage = useStorage();

  const { data: imageURL } = useStorageDownloadURL(ref(storage, storagePath));

  return (
    <div className="flex flex-col rounded border border-slate-400 bg-white px-2 text-slate-400 shadow">
      <img
        src={imageURL}
        alt="demo download"
        className="max-w-[200px] rounded-t"
      />
      <span className="w-full flex-1 select-none border-t py-1 text-center text-sm italic">
        preview
      </span>
    </div>
  );
};
ImagePreview.propTypes = {
  storagePath: PropTypes.string.isRequired,
};

function ImageUpload({ defaultFileName, onChange }) {
  const [state] = useContext(SubmissionContext);
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

    const path = `submitters/${user.uid}/new/${state.context.blmPointId}/${fileName}`;
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
            message.current = `You can only upload images smaller than 5MB. That image was ${(
              task.snapshot.totalBytes /
              1024 /
              1024
            ).toFixed(2)}MB.`;
          } else if (!task.snapshot.metadata.contentType.match(/image.*/)) {
            setStatus('error');
            message.current = `You can only upload images. That was a ${
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
        <div className="flex flex-col items-center">
          <ImagePreview storagePath={fileReference.fullPath} />
        </div>
      )}
    </>
  );
}
ImageUpload.propTypes = {
  defaultFileName: PropTypes.string,
  onChange: PropTypes.func,
};
