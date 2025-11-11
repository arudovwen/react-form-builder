import React from 'react';

function getFileDataUrl(rawBase64) {
  if (!rawBase64 || typeof rawBase64 !== 'string') return null;

  // Trim and take first few chars for detection
  const header = rawBase64.substring(0, 10);
  let mimeType = null;

  // Image MIME Types
  if (header.startsWith('/9j/')) {
    // JPEG
    mimeType = 'image/jpeg';
  } else if (header.startsWith('iVBOR')) {
    // PNG
    mimeType = 'image/png';
  } else if (header.startsWith('R0lGOD')) {
    // GIF
    mimeType = 'image/gif';
  } else if (header.startsWith('Qk')) {
    // BMP
    mimeType = 'image/bmp';
  } else if (header.startsWith('UklGR')) {
    // WebP
    mimeType = 'image/webp';
  }

  // Document MIME Types
  else if (header.startsWith('JVBERi0')) {
    // PDF
    mimeType = 'application/pdf';
  }

  // Text MIME Types
  else if (header.startsWith('data:text')) {
    // Text File
    mimeType = 'text/plain';
  }

  // Audio MIME Types
  else if (header.startsWith('AA')) {
    // Audio (wav, mp3)
    mimeType = 'audio/wav';
  }

  // Video MIME Types
  else if (header.startsWith('data:video')) {
    // Video file
    mimeType = 'video/mp4';
  }

  // Handle other file types or unknown type
  if (mimeType) {
    return `data:${mimeType};base64,${rawBase64}`;
  }

  // Fallback in case unknown type
  console.warn('Unknown file type or invalid base64');
  return rawBase64;
}

const Base64FileViewer = ({ defaultValue, fileName = 'downloaded-file' }) => {
  const base64 = getFileDataUrl(defaultValue);
  // Check if the string is a valid base64 file (image, pdf, text, etc.)
  const isImage =
    typeof base64 === 'string' && base64.startsWith('data:image/');
  const isPDF =
    typeof base64 === 'string' && base64.startsWith('data:application/pdf');
  const isText =
    typeof base64 === 'string' && base64.startsWith('data:text/plain');
  const isFile = base64 && typeof base64 === 'string';

  // Extract MIME type (for download extension)
  const mimeType = isFile
    ? base64.substring('data:'.length, base64.indexOf(';base64'))
    : null;
  const extension = mimeType ? mimeType.split('/')[1] : 'txt'; // Default to "txt" for unsupported file types

  // Handle download
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = base64;
    link.download = `${fileName}.${extension}`;
    link.click();
  };

  if (!base64) {
    return (
      <div className="flex flex-col items-center p-4 mt-1 space-y-3 bg-white border border-gray-200 rounded-lg ">
        No Base64 file added
      </div>
    );
  }
  // Render for images
  if (isImage) {
    return (
      <div className="flex flex-col items-center p-3 mt-1 space-y-3 bg-white border border-gray-200 rounded-lg">
        <img
          src={base64}
          alt={fileName}
          className="h-auto max-w-full border border-gray-200 rounded-md "
        />
        <button
         type="button"
          onClick={handleDownload}
          className="px-4 py-2 text-sm font-semibold text-blue-600 transition-all border-none rounded-md"
        >
          ⬇️ Download Image
        </button>
      </div>
    );
  }

  // Render for PDF files
  if (isPDF) {
    return (
      <div className="flex flex-col items-center p-3 mt-1 space-y-3 bg-white border border-gray-200 rounded-lg">
        {/* <embed
          src={base64}
          type="application/pdf"
          width="100%"
          height="500px"
          className="border border-gray-200 rounded-md "
        /> */}
        <button
         type="button"
          onClick={handleDownload}
           className="px-4 py-2 text-sm font-semibold text-blue-600 transition-all border-none rounded-md"
        >
          ⬇️ Download PDF
        </button>
      </div>
    );
  }

  // Render for Text files
  if (isText) {
    const textContent = atob(base64.split(',')[1]); // Decode base64 text content

    return (
      <div className="flex flex-col items-center p-3 mt-1 space-y-3 bg-white border border-gray-200 rounded-lg">
        <textarea
          value={textContent}
          readOnly
          className="w-full h-10 p-2 border border-gray-300 rounded-md"
        />
        <button
         type="button"
          onClick={handleDownload}
          className="px-4 py-2 text-sm font-semibold text-blue-600 transition-all border-none rounded-md"
        >
          ⬇️ Download Text File
        </button>
      </div>
    );
  }

  // Render for other files (generic download button)
  return (
    <div className="flex flex-col items-center p-3 space-y-3 bg-white border border-gray-200 rounded-lg ">
      <div className="text-sm text-gray-600">Unsupported or generic file</div>
      <button
      type="button"
        onClick={handleDownload}
          className="px-4 py-2 text-sm font-semibold text-blue-600 transition-all border-none rounded-md"
      >
        ⬇️ Download {fileName}.{extension}
      </button>
    </div>
  );
};

export default Base64FileViewer;
