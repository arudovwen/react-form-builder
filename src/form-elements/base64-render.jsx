import React from 'react';

/**
 * Detect MIME type from raw base64 using file signatures
 */
function detectMimeType(raw) {
  if (!raw) return null;

  const header = raw.substring(0, 20);

  // IMAGE TYPES
  if (header.startsWith('/9j/')) return 'image/jpeg';
  if (header.startsWith('iVBOR')) return 'image/png';
  if (header.startsWith('R0lGOD')) return 'image/gif';
  if (header.startsWith('Qk')) return 'image/bmp';
  if (header.startsWith('UklGR')) return 'image/webp';

  // PDF
  if (header.startsWith('JVBERi0')) return 'application/pdf';

  // TEXT (plain)
  try {
    const decoded = atob(raw.substring(0, 50));
    if (/^[\x09\x0A\x0D\x20-\x7E]+$/.test(decoded)) {
      return 'text/plain';
    }
  } catch {}

  // AUDIO/VIDEO BASIC DETECTION
  if (header.startsWith('SUQz')) return 'audio/mp3';
  if (header.startsWith('AAAAGGZ')) return 'audio/wav';
  if (header.startsWith('AAAAIGZ0')) return 'video/mp4';

  return null; // unknown
}

/**
 * Converts raw base64 into a valid data URL
 */
function getFileDataUrl(rawBase64) {
  if (!rawBase64 || typeof rawBase64 !== 'string') return null;

  // Clean whitespace/newlines
  const cleanBase64 = rawBase64.replace(/\s/g, '');

  // If already data URL → return as is
  if (cleanBase64.startsWith('data:')) return cleanBase64;

  const mimeType = detectMimeType(cleanBase64);

  if (mimeType) return `data:${mimeType};base64,${cleanBase64}`;

  console.warn('Unknown MIME type, returning raw base64.');
  return `data:application/octet-stream;base64,${cleanBase64}`;
}

const Base64FileViewer = ({ defaultValue, fileName = 'downloaded-file' }) => {
  const base64Url = getFileDataUrl(defaultValue);

  if (!base64Url) {
    return (
      <div className="flex flex-col items-center p-4 mt-1 space-y-3 bg-white border rounded-lg">
        No Base64 file added
      </div>
    );
  }

  const isImage = base64Url.startsWith('data:image/');
  const isPDF = base64Url.startsWith('data:application/pdf');
  const isText = base64Url.startsWith('data:text/plain');

  // Extract MIME type → for extension
  const mimeType = base64Url.substring(5, base64Url.indexOf(';'));
  const extension = mimeType.includes('/') ? mimeType.split('/')[1] : 'bin';

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = base64Url;
    link.download = `${fileName}.${extension}`;
    link.click();
  };

  // IMAGE VIEWER
  if (isImage) {
    return (
      <div className="flex flex-col items-center p-3 mt-1 space-y-3 bg-white border rounded-lg">
        <img
          src={base64Url}
          alt={fileName}
          className="h-auto max-w-[200px] border rounded-md"
        />
        <button
          type="button"
          onClick={handleDownload}
          className="px-4 py-2 text-sm font-semibold text-blue-600"
        >
          ⬇️ Download Image
        </button>
      </div>
    );
  }

  // PDF VIEWER
  if (isPDF) {
    return (
      <div className="flex flex-col items-center p-3 mt-1 space-y-3 bg-white border rounded-lg">
        <embed
          src={base64Url}
          type="application/pdf"
          width="100%"
          height="200px"
          className="border rounded-md"
        />
        <button
          type="button"
          onClick={handleDownload}
          className="px-4 py-2 text-sm font-semibold text-blue-600"
        >
          ⬇️ Download PDF
        </button>
      </div>
    );
  }

  // TEXT VIEWER
  if (isText) {
    const textContent = atob(base64Url.split(',')[1]);

    return (
      <div className="flex flex-col items-center p-3 mt-1 space-y-3 bg-white border rounded-lg">
        <textarea
          value={textContent}
          readOnly
          className="w-full h-24 p-2 border rounded-md"
        />
        <button
          type="button"
          onClick={handleDownload}
          className="px-4 py-2 text-sm font-semibold text-blue-600"
        >
          ⬇️ Download Text File
        </button>
      </div>
    );
  }

  // GENERIC FILE VIEWER
  return (
    <div className="flex flex-col items-center p-3 space-y-3 bg-white border rounded-lg">
      <div className="text-sm text-gray-600">Unsupported or generic file</div>
      <button
        type="button"
        onClick={handleDownload}
        className="px-4 py-2 text-sm font-semibold text-blue-600"
      >
        ⬇️ Download {fileName}.{extension}
      </button>
    </div>
  );
};

export default Base64FileViewer;
