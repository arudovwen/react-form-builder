import React, { useState } from 'react';
import { get } from './stores/requests';

const OptionCreateApi = ({ initialFields, onChange }) => {
  const [url, setUrl] = useState(initialFields || '');
  const [loading, setLoading] = useState(false);

  const loadApi = async () => {
    if (!url) return;
    setLoading(true);
    try {
      const { data } = await get(url);
      if (onChange) {
        onChange(data);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      // Optional: Add error handling UI
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-6">
      <div className="flex gap-x-[10px] mb-2 items-center">
        <input
          placeholder="Load from URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="input-style"
        />
        <button
          type="button"
          onClick={loadApi}
          disabled={loading}
          className={`button-style ${
            loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-600'
          }`}
        >
          {loading ? 'Loading...' : 'Load'}
        </button>
      </div>
    </div>
  );
};

export default OptionCreateApi;
