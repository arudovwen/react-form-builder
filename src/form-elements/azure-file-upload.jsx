import React, {
  useState,
  useRef,
  useImperativeHandle,
  forwardRef,
} from 'react';
import axios from 'axios';
import { Copy, Download } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';

const token = window?.localStorage.getItem('token') || '';

const AzureFileUploadComponent = forwardRef(
  (
    {
      apiUrl,
      detail = {},
      autoUpload = true,
      onUploaded,
      defaultValue = {},
      accept,
      disabled,
      name,
    },
    ref,
  ) => {
    const { storageSettingId, containerName, folderName } = detail;

    const [uploadedFileUrl, setUploadedFileUrl] = useState(
      defaultValue?.url || null,
    );
    const [file, setFile] = useState(defaultValue || null);
    const [progress, setProgress] = useState(0);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const hiddenFileInput = useRef(null);

    const api = axios.create({
      baseURL: `${apiUrl}/workflows/api/v1`,
      headers: { Authorization: `Bearer ${token}` },
    });

    /** ✅ Handles file selection */
    const onSelectFile = (e) => {
      const f = e.target.files?.[0];
      if (!f) return;

      setFile(f);
      setError('');

      // ✅ Automatically upload if enabled
      if (autoUpload) uploadFile(f);
    };

    const openFileDialog = () => hiddenFileInput.current?.click();

    /** ✅ Handles file upload to Azure */
    const uploadFile = async (fileToUpload = file) => {
      if (!fileToUpload) return setError('No file selected');
      if (!storageSettingId || !containerName || !folderName) return setError('Azure settings are incomplete');

      setUploading(true);
      setProgress(0);
      setError('');

      try {
        const form = new FormData();
        form.append('file', fileToUpload);

        const { data } = await api.post(
          `/fileupload/azure-upload-blob?${new URLSearchParams({
            settingsId: storageSettingId,
            containerName,
            folderName,
          })}`,
          form,
          {
            headers: { 'Content-Type': 'multipart/form-data' },
            onUploadProgress: (p) => setProgress(Math.round((p.loaded / p.total) * 100)),
          },
        );

        const result = {
          url: data?.data?.url,
          name: fileToUpload.name,
          size: fileToUpload.size,
          type: fileToUpload.type,
        };

        setUploadedFileUrl(data?.data?.url);
        setFile(fileToUpload);
        if (onUploaded) onUploaded(result);
      } catch (err) {
        console.error(err);
        setError('Upload failed');
      } finally {
        setUploading(false);
      }
    };

    // ✅ Expose functions to parent component
    useImperativeHandle(ref, () => ({
      triggerUpload: uploadFile,
      clear: () => {
        setFile(null);
        setProgress(0);
        setError('');
        setUploadedFileUrl(null);
      },
    }));

    /** ✅ Download file */
    const downloadFile = async () => {
      if (!uploadedFileUrl && !defaultValue?.url) return setError('No file URL to download');
      try {
        const response = await fetch(uploadedFileUrl || defaultValue?.url);
        if (!response.ok) return setError('Failed to fetch the file');

        const blob = await response.blob();
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = file?.name || 'download';
        a.click();
        URL.revokeObjectURL(a.href);
      } catch (err) {
        console.error(err);
        setError('An error occurred while downloading the file');
      }
    };
const copyFile = () => {
  window.navigator.clipboard.writeText(defaultValue?.url || uploadedFileUrl);
  toast.success('Url Copied');
  return true;
};
    return (
<>
<ToastContainer />
      <div>
        {disabled ? (
          <div>
            {/* Dropzone */}
            <div
              className="px-4 py-2 mb-4 text-center transition bg-white border border-gray-100 rounded-lg cursor-pointer hover:bg-gray-50"
              onClick={openFileDialog}
            >
              <input
                type="file"
                ref={hiddenFileInput}
                onChange={onSelectFile}
                className="hidden"
                accept={accept}
                name={name}
              />

              {!file && !defaultValue && (
                <p className="mb-0 text-sm text-gray-500">
                  Click to select a file or drop it here
                </p>
              )}

              {(file || defaultValue) && (
                <div className="flex items-center justify-between flex-1 space-y-1 text-sm gap-x-6">
                  <p className="font-medium">
                    {file?.name || defaultValue?.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {file?.type || defaultValue?.type || 'Unknown type'} •{' '}
                    {((file?.size || defaultValue?.size) / 1024).toFixed(1)} KB
                  </p>
                </div>
              )}

              {/* Manual Upload Button (only if autoUpload = false) */}
              {!autoUpload && file && (
                <button
                  onClick={() => uploadFile(file)}
                  disabled={uploading || !file}
                  className="px-2 py-1 text-xs text-white bg-blue-600 rounded disabled:bg-blue-300"
                >
                  {uploading ? 'Uploading...' : 'Upload'}
                </button>
              )}
            </div>

            {/* Progress bar */}
            {uploading && (
              <div className="w-full h-3 overflow-hidden bg-gray-200 rounded">
                <div
                  className="h-full transition-all bg-blue-600"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}

            {/* Error */}
            {error && <div className="text-sm text-red-600">{error}</div>}
          </div>
        ) : (
          <div className="px-6 py-2 mb-4 text-center transition bg-white border border-gray-100 rounded-lg">
            {defaultValue && (
              <div className="flex items-center justify-between space-y-1 text-sm gap-x-6">
                <div className='text-align-left'>
                  <p className="font-medium text-left">{defaultValue?.name} </p>
                   {/* <p className="text-xs font-medium text-left">{defaultValue?.url}</p> */}
                  <p className="text-xs text-left text-gray-500">
                    {defaultValue?.type || 'Unknown type'} •{' '}
                    {(defaultValue?.size / 1024).toFixed(1)} KB
                  </p>
                </div>
               <div className="flex text-sm gap-x-3">
                 <button type="button" onClick={() => copyFile()}>
                  <Copy />
                </button>
                 <button type="button" onClick={() => downloadFile()}>
                  <Download />
                </button>
               </div>
              </div>
            )}
          </div>
        )}
      </div></>
    );
  },
);

export default AzureFileUploadComponent;
