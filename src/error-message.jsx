import React from 'react';

export default function ErrorMessage({ message }) {
  return (
    <div className='mt-1'>
      <span className="text-danger small">{message}</span>
    </div>
  );
}
