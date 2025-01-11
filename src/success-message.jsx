import React from 'react';

export default function SuccessMessage({ message }) {
  return (
    <div className='mt-1'>
      <span className="text-success small">{message}</span>
    </div>
  );
}
