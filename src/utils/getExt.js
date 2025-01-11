// eslint-disable-next-line import/prefer-default-export
export function getExtensionFromMimeType(mimeType) {
  const mimeTypes = {
    // Image MIME types
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',

    // Text MIME types
    'text/plain': 'txt',

    // Application (document) MIME types
    'application/pdf': 'pdf',
    'application/msword': 'doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      'docx',
    'application/vnd.ms-excel': 'xls',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
    'application/vnd.ms-powerpoint': 'ppt',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation':
      'pptx',
    'application/rtf': 'rtf',
    'application/vnd.oasis.opendocument.text': 'odt',
    'application/vnd.oasis.opendocument.spreadsheet': 'ods',

    // Archive/Compression file types
    'application/zip': 'zip',
    'application/x-rar-compressed': 'rar',

    // Audio and Video file types
    'audio/mpeg': 'mp3',
    'video/mp4': 'mp4',
  };

  return mimeTypes[mimeType] || null; // Return the corresponding extension or null if not found
}
