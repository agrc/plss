import { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import {
  useStorage,
  useUser,
  useStorageDownloadURL,
  useStorageTask,
} from 'reactfire';
import { useNavigate, useParams } from 'react-router-dom';
import { ref, uploadBytesResumable } from 'firebase/storage';
import { NumberedForm, NumberedFormSection } from '../../formElements/Form.jsx';
import { Button } from '../../formElements/Buttons.jsx';
import Wizard from './Wizard.jsx';
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

const ImagePreview = ({ storagePath }) => {
  const storage = useStorage();

  const { data: imageURL } = useStorageDownloadURL(ref(storage, storagePath));

  return (
    <div className="flex flex-col rounded border bg-slate-800 text-white/50 shadow">
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

function Image() {
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
      <input
        type="file"
        onChange={onChange}
        className="text-center text-slate-300 file:flex file:min-h-[2rem] file:w-fit file:cursor-pointer file:rounded-full file:border-2
        file:border-solid file:border-indigo-600 file:bg-indigo-500 file:px-7 file:py-1 file:text-sm
        file:font-semibold file:text-white file:transition-all file:duration-200 file:ease-in-out hover:file:bg-indigo-600
        file:focus:border-indigo-500 file:focus:outline-none file:focus:ring-2 file:focus:ring-indigo-600 file:focus:ring-opacity-50
        file:active:bg-indigo-700 file:disabled:cursor-not-allowed file:disabled:opacity-50"
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

export default function MonumentImages() {
  const navigate = useNavigate();

  return (
    <>
      <h3 className="mb-4 text-2xl font-semibold">Monument Images</h3>
      <NumberedForm>
        <NumberedFormSection number={1} title="Map view or sketch">
          <Image />
        </NumberedFormSection>
        <NumberedFormSection number={2} title="Monument area">
          <Image />
        </NumberedFormSection>
        <NumberedFormSection number={3} title="Monument close-up">
          <Image />
        </NumberedFormSection>
        <NumberedFormSection number={4} title="Extra pages">
          <Image />
          10 extra pages are allowed
          <Button style="alternate">Add more images</Button>
        </NumberedFormSection>
        <NumberedFormSection number={5} title="">
          <Wizard back={() => navigate(-1)} next={true} clear={() => {}} />
        </NumberedFormSection>
      </NumberedForm>
    </>
  );
}
