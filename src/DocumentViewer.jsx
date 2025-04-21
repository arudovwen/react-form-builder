import React, { useState, useEffect } from 'react';

const UniversalFileViewer = ({ fileUrl, fileName }) => {
  // State to control modal visibility
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fileType, setFileType] = useState('unknown');

  // Determine file type based on extension
  useEffect(() => {
    if (!fileUrl) return;

    const extension = fileUrl.split('.').pop().toLowerCase();
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'];

    if (imageExtensions.includes(extension)) {
      setFileType('image');
    } else if (['pdf'].includes(extension)) {
      setFileType('pdf');
    } else if (['doc', 'docx'].includes(extension)) {
      setFileType('word');
    } else if (['xls', 'xlsx'].includes(extension)) {
      setFileType('excel');
    } else if (['ppt', 'pptx'].includes(extension)) {
      setFileType('powerpoint');
    } else {
      setFileType('other');
    }
  }, [fileUrl]);

  // Function to open modal for images, download for other files
  const handleFileClick = () => {
    if (fileType === 'image') {
      setIsModalOpen(true);
    } else {
      // For non-image files, open in new tab or download
      window.open(fileUrl, '_blank');
    }
  };

  // Function to close modal
  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Get file icon based on type
  const getFileIcon = () => {
    switch (fileType) {
      case 'image':
        return fileUrl || '/place.png'; // Actual image or placeholder
      case 'pdf':
        return '/icons/pdf-icon.png'; // Replace with your PDF icon path
      case 'word':
        return '/icons/word-icon.png'; // Replace with your Word icon path
      case 'excel':
        return '/icons/excel-icon.png'; // Replace with your Excel icon path
      case 'powerpoint':
        return '/icons/ppt-icon.png'; // Replace with your PowerPoint icon path
      default:
        return '/icons/file-icon.png'; // Replace with your generic file icon path
    }
  };

  // Determine display element based on file type
  const getThumbnailElement = () => {
    if (fileType === 'image') {
      return (
        <button
          className="btn btn-view"
          type="button"
          aria-label={'Preview file'}
        >
          <span>Preview File</span>
        </button>
      );
    }
    // For non-image files, show an icon with filename
    return (
      <div
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
        data-toggle="tooltip"
        data-placement="top"
        title={`Click to ${fileType === 'pdf' ? 'open' : 'download'} ${
          fileName || 'file'
        }`}
      >
        <div
          style={{
            width: '60px',
            height: '60px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '10px',
          }}
        >
          <img
            src={getFileIcon()}
            alt={`${fileType} icon`}
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
            }}
          />
        </div>
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
          {fileName || (fileUrl ? fileUrl.split('/').pop() : 'Unknown file')}
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* Thumbnail of the file */}
      <div onClick={handleFileClick}>{getThumbnailElement()}</div>

      {/* Modal only for viewing images */}
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
            onClick={(e) => e.stopPropagation()} // Prevent modal close when clicking inside
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
                zIndex: 1001,
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
