import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { StorageImage, useStorage, useStorageTask } from 'reactfire';
import { deleteObject, ref, uploadBytesResumable } from 'firebase/storage';
import { Button } from './Buttons.jsx';
import { ErrorBoundary } from 'react-error-boundary';

export const ImageUpload = ({ defaultFileName, path, onChange, value }) => {
  const storage = useStorage();
  const [uploadTask, setUploadTask] = useState();
  const [fileReference, setFileReference] = useState();
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  useEffect(() => {
    if (value) {
      setFileReference(ref(storage, value));
    }
  }, [value, storage]);

  const uploadImage = (event) => {
    const fileList = event.target.files;
    const fileToUpload = fileList[0];
    let fileName = fileToUpload.name;

    if (defaultFileName) {
      const [, ext] = fileName.split('.');
      fileName = `${defaultFileName}.${ext}`;
    }

    const filePath = `${path}/${fileName}`;
    const fileRef = ref(storage, filePath);

    setFileReference(fileRef);
    setStatus('loading');
    setError('');

    const task = uploadBytesResumable(fileRef, fileToUpload, {
      contentType: fileToUpload.type,
      contentDisposition: 'inline',
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
            setError(
              `You can only upload images smaller than 5MB. That image was ${(
                task.snapshot.totalBytes /
                1024 /
                1024
              ).toFixed(2)}MB.`
            );
          } else if (!task.snapshot.metadata.contentType.match(/image.*/)) {
            setStatus('error');
            setError(
              `You can only upload images. That was a ${
                task.snapshot.metadata.contentType
                  ? task.snapshot.metadata.contentType
                  : 'unknown type'
              }.`
            );
          } else {
            setStatus('error');
            setError('Permission denied. Please try again.');
          }
        } catch {
          setStatus('error');
          setError('Permission denied. Please try again.');
        }
        setUploadTask(undefined);
      });

    setUploadTask(task);
  };

  return !value && status !== 'success' ? (
    <>
      <input
        type="file"
        name={defaultFileName}
        id={defaultFileName}
        onChange={uploadImage}
        className="w-max text-center text-sm text-slate-400 file:flex file:min-h-[2rem] file:cursor-pointer file:rounded-full file:border-2
        file:border-solid file:border-sky-600 file:bg-sky-500 file:px-7 file:py-1 file:text-sm
        file:font-semibold file:text-white file:transition-all file:duration-200 file:ease-in-out hover:file:bg-sky-600
        file:focus:border-sky-500 file:focus:outline-none file:focus:ring-2 file:focus:ring-sky-600 file:focus:ring-opacity-50
        file:active:bg-sky-700 file:disabled:cursor-not-allowed file:disabled:opacity-50"
      />
      {uploadTask && (
        <UploadProgress uploadTask={uploadTask} storageRef={fileReference} />
      )}
      {status === 'error' && (
        <p className="m-auto w-4/5 rounded bg-sky-700 px-2 py-1 text-center text-sm font-semibold text-white shadow">
          {error}
        </p>
      )}
    </>
  ) : (
    <>
      {value && (
        <div className="flex flex-col items-center gap-2">
          {fileReference?.fullPath && (
            <ErrorBoundary
              fallback={<div>The preview could not be accessed.</div>}
            >
              <ImagePreview storagePath={fileReference?.fullPath} />
            </ErrorBoundary>
          )}
          <Attachment
            onClick={async () => {
              try {
                await deleteObject(fileReference);
                setFileReference(undefined);
                onChange('');
                setStatus('idle');
                setError('');
              } catch {
                setStatus('error');
                setError('This file could not be deleted.');
              }
            }}
          />
          {error && (
            <p className="m-auto w-4/5 rounded bg-sky-700 px-2 py-1 text-center text-sm font-semibold text-white shadow">
              {error}
            </p>
          )}
        </div>
      )}
    </>
  );
};
ImageUpload.propTypes = {
  defaultFileName: PropTypes.string,
  onChange: PropTypes.func,
  value: PropTypes.string,
  path: PropTypes.string,
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

export const ImagePreview = ({ storagePath }) => {
  return (
    <div className="flex flex-col rounded border border-slate-400 bg-white text-slate-400 shadow">
      <StorageImage
        storagePath={storagePath}
        alt="upload preview"
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

export const Attachment = ({ onClick }) => (
  <div className="flex justify-between">
    <Button style="secondary" onClick={onClick}>
      Remove
    </Button>
  </div>
);
Attachment.propTypes = {
  onClick: PropTypes.func,
};
