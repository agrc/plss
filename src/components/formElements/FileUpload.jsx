import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useStorage } from 'reactfire';
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytesResumable,
} from 'firebase/storage';
import clsx from 'clsx';
import { Button } from './Buttons.jsx';

const validateContentTypes = (contentType, contentTypes) => {
  const found = contentTypes.find(
    (meta) => contentType === meta.value.toLowerCase()
  );

  if (found) {
    return [true, ''];
  }

  const types = contentTypes.map((meta) => meta.name).join(', ');

  return [false, `You can only upload ${types} here.`];
};

const validateSize = (actualSize, megabytes) => {
  return actualSize > megabytes * 1024 * 1024;
};

const FileUpload = ({
  defaultFileName,
  path,
  contentTypes,
  maxFileSize,
  value,
  onChange,
}) => {
  const storage = useStorage();
  const uploadReference = useRef();
  const [fileUrl, setFileUrl] = useState('');
  const [uploadPercent, setUploadPercent] = useState();
  const [uploadError, setUploadError] = useState();
  useEffect(() => {
    if (value) {
      uploadReference.current = ref(storage, value);
      getDownloadURL(uploadReference.current).then(setFileUrl);
    }
  }, [storage, value]);

  const uploadFile = async (event) => {
    setUploadError();
    const fileList = event.target.files;
    const fileToUpload = fileList[0];
    let fileName = fileToUpload.name;

    let [hasValidType, errorMessage] = validateContentTypes(
      fileToUpload.type,
      contentTypes
    );
    if (!hasValidType) {
      setUploadError(errorMessage);
      return;
    }

    if (defaultFileName) {
      const [, ext] = fileName.split('.');
      fileName = `${defaultFileName}.${ext}`;
    }

    uploadReference.current = ref(storage, `${path}/${fileName}`);

    const uploadTask = uploadBytesResumable(
      uploadReference.current,
      fileToUpload
    );

    uploadTask?.on(
      'state_changed',
      ({ bytesTransferred, totalBytes }) => {
        let percent = 0;
        if (bytesTransferred > 0) {
          percent = Math.round(100 * (bytesTransferred / totalBytes));
        }

        setUploadPercent(percent);
      },
      () => {
        setUploadPercent();
        try {
          if (validateSize(uploadTask.snapshot.totalBytes, maxFileSize ?? 5)) {
            setUploadError(
              `You can only upload files smaller than ${maxFileSize}MB. You tried ${(
                uploadTask.snapshot.totalBytes /
                1024 /
                1024
              ).toFixed(2)}MB.`
            );
          } else {
            setUploadError(
              'Permission denied. Check your login status and try again.'
            );
          }
        } catch {
          setUploadError(
            'Permission denied. Check your login status and try again.'
          );
        }
      },
      async () => {
        onChange(uploadReference.current.fullPath);
        setUploadPercent();

        const url = await getDownloadURL(uploadReference.current);

        setFileUrl(url);
      }
    );
  };

  return fileUrl ? (
    <ObjectPreview url={fileUrl}>
      <Attachment
        onClick={async () => {
          await deleteObject(uploadReference.current);
          onChange();
          setFileUrl();
        }}
      />
    </ObjectPreview>
  ) : (
    <div className="relative">
      <input
        type="file"
        name={defaultFileName}
        id={defaultFileName}
        onChange={uploadFile}
        className="w-max text-center text-sm text-slate-400 file:flex file:min-h-[2rem] file:cursor-pointer file:rounded-full file:border-2
        file:border-solid file:border-sky-600 file:bg-sky-500 file:px-7 file:py-1 file:text-sm
        file:font-semibold file:text-white file:transition-all file:duration-200 file:ease-in-out hover:file:bg-sky-600
        file:focus:border-sky-500 file:focus:outline-none file:focus:ring-2 file:focus:ring-sky-600 file:focus:ring-opacity-50
        file:active:bg-sky-700 file:disabled:cursor-not-allowed file:disabled:opacity-50"
      />
      {uploadPercent !== undefined && (
        <span
          className={clsx('absolute right-10 text-4xl font-bold', {
            'text-sky-900': uploadPercent <= 16,
            'text-sky-800': uploadPercent > 16 && uploadPercent <= 32,
            'text-sky-700': uploadPercent > 32 && uploadPercent <= 48,
            'text-sky-600': uploadPercent > 48 && uploadPercent <= 64,
            'text-sky-500': uploadPercent > 64 && uploadPercent <= 80,
            'text-sky-400': uploadPercent > 80 && uploadPercent <= 90,
            'text-sky-300': uploadPercent > 90,
          })}
        >
          {uploadPercent}%
        </span>
      )}
      {uploadError && (
        <p className="m-auto w-4/5 rounded bg-sky-700 px-2 py-1 text-center text-sm font-semibold text-white shadow">
          {uploadError}
        </p>
      )}
    </div>
  );
};
FileUpload.propTypes = {
  path: PropTypes.string.isRequired,
  defaultFileName: PropTypes.string,
  onChange: PropTypes.func,
  value: PropTypes.string,
  contentTypes: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      value: PropTypes.string,
    })
  ),
  maxFileSize: PropTypes.number,
};

export const ObjectPreview = ({ url, children }) => {
  return (
    <div className="flex w-full flex-col rounded border border-slate-400 bg-slate-50 text-slate-400 shadow">
      {url.search(/\.pdf\?/i) > -1 ? (
        <object
          className="self-center"
          data={url}
          type="application/pdf"
          width="300"
          height="375"
        >
          PDF preview
        </object>
      ) : (
        <img
          src={url}
          alt="upload preview"
          className="m-2 max-w-[300px] self-center rounded-t"
        />
      )}

      <span className="flex flex-1 select-none justify-center rounded-b border-t bg-white p-2 text-sm italic">
        {children}
      </span>
    </div>
  );
};
ObjectPreview.propTypes = {
  url: PropTypes.string.isRequired,
  children: PropTypes.node,
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

export default FileUpload;
