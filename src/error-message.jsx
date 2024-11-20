import React from 'react';

export default function ErrorMessage({ message }) {
  return (
    <div>
      <span className="text-danger small">{message}</span>
    </div>
  );
}
