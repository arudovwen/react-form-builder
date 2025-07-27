import React, { useState, useEffect } from 'react';
import {
  Image as LucideImage,
  FileText,
  File,
  FileSpreadsheet,
  FileBarChart,
  FileQuestion,
} from 'lucide-react';

const EXTENSION_MAP = {
  jpg: 'image',
  jpeg: 'image',
  png: 'image',
  gif: 'image',
  bmp: 'image',
  webp: 'image',
  svg: 'image',
  pdf: 'pdf',
  doc: 'word',
  docx: 'word',
  xls: 'excel',
  xlsx: 'excel',
  ppt: 'powerpoint',
  pptx: 'powerpoint',
};

const FILE_TYPE_ICONS = {
  image: LucideImage,
  pdf: FileText,
  word: File,
  excel: FileSpreadsheet,
  powerpoint: FileBarChart,
  other: FileQuestion,
};

const UniversalFileViewer = ({ fileUrl, fileName }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fileType, setFileType] = useState('unknown');

  useEffect(() => {
    if (!fileUrl) return;
    const extension = fileUrl.split('.').pop()?.toLowerCase() || '';
    const type = EXTENSION_MAP[extension] || 'other';
    setFileType(type);
  }, [fileUrl]);

  const handleFileClick = () => {
    if (fileType === 'image') {
      setIsModalOpen(true);
    } else {
      window.open(fileUrl, '_blank');
    }
  };

  const closeModal = () => setIsModalOpen(false);

  const renderIcon = () => {
    const IconComponent = FILE_TYPE_ICONS[fileType] || FileQuestion;
    return <IconComponent size={40} className="text-gray-500" />;
  };

  const getThumbnailElement = () => {
    if (fileType === 'image') {
      return (
        <button
          className="btn btn-view"
          type="button"
          aria-label="Preview file"
        >
          <span>Preview File</span>
        </button>
      );
    }

    return (
      <div
        onClick={handleFileClick}
        style={{
          cursor: 'pointer',
          width: '120px',
          height: '130px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid #eee',
          borderRadius: '4px',
          padding: '10px',
        }}
        title={`Click to ${fileType === 'pdf' ? 'open' : 'download'} ${
          fileName || 'file'
        }`}
      >
        <div style={{ marginBottom: '10px' }}>{renderIcon()}</div>
        <div
          style={{
            fontSize: '12px',
            textAlign: 'center',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            width: '100%',
          }}
        >
          {fileName || fileUrl?.split('/').pop() || 'Unknown file'}
        </div>
      </div>
    );
  };

  return (
    <div>
      <div onClick={handleFileClick}>{getThumbnailElement()}</div>

      {isModalOpen && fileType === 'image' && (
        <div
          className="modal"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
          }}
          onClick={closeModal}
        >
          <div
            className="modal-content"
            style={{
              position: 'relative',
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '8px',
              width: '90vw',
              maxHeight: '90vh',
              overflow: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <span
              className="close"
              onClick={closeModal}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                fontSize: '24px',
                cursor: 'pointer',
              }}
            >
              &times;
            </span>
            <img
              src={fileUrl || '/place.png'}
              alt={fileName || 'Full Image'}
              style={{
                maxWidth: '100%',
                maxHeight: '80vh',
                objectFit: 'contain',
                display: 'block',
                margin: '0 auto',
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default UniversalFileViewer;
