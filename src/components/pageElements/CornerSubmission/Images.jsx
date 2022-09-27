import { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import {
  useStorage,
  useUser,
  useStorageDownloadURL,
  useStorageTask,
} from 'reactfire';
import { useParams } from 'react-router-dom';
import { ref, uploadBytesResumable } from 'firebase/storage';

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
    console.log(`Uploading image: ${percentComplete} complete`);
    return <span>{percentComplete}</span>;
  }
};

UploadProgress.propTypes = {
  uploadTask: PropTypes.object.isRequired,
  storageRef: PropTypes.object.isRequired,
};

const FetchImage = ({ storagePath }) => {
  const storage = useStorage();

  const { data: imageURL } = useStorageDownloadURL(ref(storage, storagePath));

  return (
    <div className="mt-6 flex flex-col rounded border bg-slate-800 text-white shadow">
      <img
        src={imageURL}
        alt="demo download"
        className="max-w-[200px] rounded-t"
      />
      <span className="w-full flex-1 select-none border-t py-1 text-center text-sm">
        image preview
      </span>
    </div>
  );
};
FetchImage.propTypes = {
  storagePath: PropTypes.string.isRequired,
};

export default function Images() {
  const { id } = useParams();
  const { data: user } = useUser();
  const storage = useStorage();
  const [uploadTask, setUploadTask] = useState();
  const [fileReference, setFileReference] = useState();
  const [status, setStatus] = useState('idle');
  const message = useRef();

  const onChange = (event) => {
    const fileList = event.target.files;
    const fileToUpload = fileList[0];
    const fileName = fileToUpload.name;
    const path = `submitters/${user.uid})/${id}/${fileName}`;
    const fileRef = ref(storage, path);

    setFileReference(fileRef);
    setStatus('loading');

    console.log(fileRef);

    const task = uploadBytesResumable(fileRef, fileToUpload, {
      contentType: fileToUpload.type,
    });

    task
      .then(() => {
        setUploadTask(undefined);
        setStatus('success');
      })
      .catch((e) => {
        console.log('caught the error again', e);
        console.log('task', task);

        try {
          if (uploadTask.snapshot.totalBytes > 5 * 1024 * 1024) {
            setStatus('error');
            message.current = `You can only upload images smaller than 5MB. That image was ${(
              uploadTask.snapshot.totalBytes /
              1024 /
              1024
            ).toFixed(2)}MB.`;
          } else if (
            !uploadTask.snapshot.metadata.contentType.match(/image.*/)
          ) {
            setStatus('error');
            message.current = `You can only upload images. That was a ${
              uploadTask.snapshot.metadata.contentType
                ? uploadTask.snapshot.metadata.contentType
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
      <input type="file" onChange={onChange} />
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
          <FetchImage storagePath={fileReference.fullPath} />
        </div>
      )}
    </>
  );
}
