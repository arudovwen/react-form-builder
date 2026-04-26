import React, {
  useState,
  useRef,
  useImperativeHandle,
  forwardRef,
} from 'react';
import axios from 'axios';
import {
  Copy,
  Download,
  Upload,
  File,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import classNames from 'classnames';
import { toast, ToastContainer } from 'react-toastify';

import { FileTypes } from '../data';

const token = window?.localStorage.getItem("token") || "";

const isImage = (url) => {
  if (!url) return false;
  if (typeof url !== "string") return false;
  if (url.startsWith("data:image")) return true;
  const extensions = ["jpg", "jpeg", "png", "gif", "bmp", "webp", "svg"];
  const ext = url.split("?")[0].split(".").pop().toLowerCase();
  return extensions.includes(ext);
};


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
      maxFileSize,
    },
    ref,
  ) => {
    const { storageSettingId, containerName, folderName } = detail;
    const maxFileSizeMB = maxFileSize || 5;

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

        // const result = {
        //   url: data?.data?.url,
        //   name: fileToUpload.name,
        //   size: fileToUpload.size,
        //   type: fileToUpload.type,
        // };

        setUploadedFileUrl(data?.data?.url);
        setFile({ ...fileToUpload, url: data?.data?.url });
        if (onUploaded) onUploaded(data?.data?.url);
      } catch (err) {
        console.error(err);
        setError('Upload failed');
      } finally {
        setUploading(false);
      }
    };
    /** ✅ Handles file selection */
/** ✅ Handles file selection */
const onSelectFile = (e) => {
  const f = e.target.files?.[0];
  if (!f) return;

  const MAX_SIZE = maxFileSizeMB * 1024 * 1024;

  // 🚫 File too large
  if (f.size > MAX_SIZE) {
    setError(`File size cannot exceed ${maxFileSizeMB}MB`);
    toast.error(`File size cannot exceed ${maxFileSizeMB}MB`);
    e.target.value = ''; // clear file input
    return;
  }

  setFile(f);
  setError('');

  // ✅ Automatically upload if enabled
  if (autoUpload) uploadFile(f);
};

    const openFileDialog = () => hiddenFileInput.current?.click();

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
      if (!uploadedFileUrl && !defaultValue) return setError('No file URL to download');
      try {
        const response = await fetch(uploadedFileUrl || defaultValue);
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
      window.navigator.clipboard.writeText(defaultValue || uploadedFileUrl);
      toast.success('Url Copied');
      return true;
    };
        const selectedType = FileTypes?.find(
          (i) => i.type === accept,
        )?.typeName;
    return (
      <div className="w-full">
        <ToastContainer />
        
        {!disabled ? (
          <div className="relative">
            {!file && !uploadedFileUrl ? (
              <div
                onClick={openFileDialog}
                className={classNames(
                  "relative group cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-300 ease-in-out px-6 !py-4 text-center",
                  uploading
                    ? "border-blue-500 bg-blue-50/50"
                    : "border-gray-200 bg-gray-50/30 hover:border-blue-400 hover:bg-white hover:shadow-xl",
                  error ? "border-red-300 bg-red-50/50" : ""
                )}
              >
                <input
                  type="file"
                  ref={hiddenFileInput}
                  onChange={onSelectFile}
                  className="hidden"
                  accept={accept}
                  name={name}
                />
                
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="p-2 bg-white rounded-full text-gray-400 group-hover:text-blue-500 shadow-sm transition-colors duration-300">
                    {uploading ? (
                      <Loader2 className="w-4  h-4 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-700">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">
                      {selectedType ? `${selectedType} files` : "All file types"} (Max {maxFileSizeMB}MB)
                    </p>
                  </div>
                </div>

                {uploading && (
                  <div className="absolute inset-0 bg-white/60 flex items-center justify-center rounded-2xl z-20">
                    <div className="flex flex-col items-center w-2/3 space-y-3">
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-600 transition-all duration-300" 
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-600">Uploading {progress}%</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="relative overflow-hidden rounded-2xl border border-green-200 bg-green-50/30 p-4 transition-all hover:shadow-lg">
                <div className="flex items-center space-x-4">
                  {isImage(uploadedFileUrl || defaultValue?.url) ? (
                    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 shadow-sm border border-white bg-white">
                      <img
                        src={uploadedFileUrl || defaultValue?.url}
                        className="w-full h-full object-cover"
                        alt="Thumbnail"
                      />
                    </div>
                  ) : (
                    <div className="p-2 bg-green-100 rounded-lg text-green-600 flex-shrink-0">
                      <CheckCircle className="w-6 h-6" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      File uploaded successfully
                    </p>
                    <p className="text-xs text-gray-500 truncate mt-0.5">
                      {file?.name || "Azure Blob File"}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={copyFile}
                      className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors border-none bg-transparent"
                      title="Copy URL"
                    >
                      <Copy className="w-5 h-5" />
                    </button>
                    {!autoUpload && !uploadedFileUrl && file && (
                      <button
                        onClick={() => uploadFile(file)}
                        disabled={uploading}
                        className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
                      >
                        {uploading ? 'Uploading...' : 'Upload'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="mt-3 flex items-start space-x-2 text-red-600 transition-all duration-300">
                <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-4">
            {defaultValue ? (
              <div className="flex items-center justify-between text-left">
                <div className="flex items-center space-x-3 overflow-hidden">
                  {isImage(defaultValue) ? (
                    <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 shadow-sm border border-white bg-white">
                      <img
                        src={defaultValue}
                        className="w-full h-full object-cover"
                        alt="Preview"
                      />
                    </div>
                  ) : (
                    <div className="p-2 bg-white rounded-lg text-gray-400 flex-shrink-0">
                      <File className="w-6 h-6" />
                    </div>
                  )}
                  <div className="truncate">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {defaultValue}
                    </p>
                    <p className="text-xs text-gray-500 whitespace-nowrap">
                      Read only view
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 pl-4">
                  <button 
                    type="button" 
                    onClick={copyFile}
                    className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-100 rounded-lg transition-colors border-none bg-transparent"
                    title="Copy URL"
                  >
                    <Copy className="w-5 h-5" />
                  </button>
                  <button 
                    type="button" 
                    onClick={downloadFile}
                    className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-100 rounded-lg transition-colors border-none bg-transparent"
                    title="Download"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center italic">No file uploaded</p>
            )}
          </div>
        )}
      </div>
    );

  },
);

export default AzureFileUploadComponent;
