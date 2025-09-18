/* eslint-disable import/prefer-default-export */
export const FileTypes = [
  {
    type: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
      'image/bmp',
      'image/tiff',
      'image/x-icon',
      'image/heic',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'video/mp4',
      'video/x-m4v',
      'video/*',
      'text/csv',
    ].join(', '),
    typeName: 'All File Types',
  },
  {
    type: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
      'image/bmp',
      'image/tiff',
      'image/x-icon',
      'image/heic',
    ].join(', '),
    typeName: 'Image',
  },
  {
    type: 'application/pdf',
    typeName: 'PDF',
  },
  {
    type: [
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ].join(', '),
    typeName: 'Word',
  },
  {
    type: [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ].join(', '),
    typeName: 'Excel',
  },
  {
    type: [
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    ].join(', '),
    typeName: 'PowerPoint',
  },
  {
    type: [
      'video/mp4',
      'video/x-m4v',
      'video/*',
    ].join(', '),
    typeName: 'Videos',
  },
];
