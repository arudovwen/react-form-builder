import React, { useState, useEffect } from 'react';

export default function DataGridOptions({ value = [], onChange, onGetUrl }) {
  const [dataFields, setDataFields] = useState(
    value.length > 0
      ? value
      : [
          {
            id: Date.now(),
            field: '',
            headerName: '',
            type: 'text',
            editable: true,
            validate: false,
          },
        ],
  );
  const [url, setUrl] = useState('');
  // Handle input change
  const handleChange = (index, key, newValue) => {
    const updated = dataFields.map((item, idx) => (idx === index ? { ...item, [key]: newValue } : item));
    setDataFields(updated);
    if (onChange) onChange(updated);
  };

  // Add new column
  const addColumn = () => {
    const updated = [
      ...dataFields,
      {
        id: Date.now() + Math.random(),
        field: '',
        headerName: '',
        type: 'text',
        editable: true,
        validate: false,
      },
    ];
    setDataFields(updated);
    if (onChange) onChange(updated);
  };

  // Remove column
  const removeColumn = (index) => {
    const updated = dataFields.filter((_, idx) => idx !== index);
    setDataFields(updated);
    if (onChange) onChange(updated);
  };
useEffect(() => {
 onGetUrl(url);
}, [url]);

  return (
    <div className="space-y-2">
      {dataFields.map((field, index) => (
        <div key={field.id}>
          <div className="flex items-center gap-x-4">
            <div className="flex-1">
              <select
                value={field.type}
                onChange={(e) => handleChange(index, 'type', e.target.value)}
                className="w-full px-2 py-1 text-sm border rounded focus:outline-none"
              >
                <option value="text">Text</option>
                <option value="number">Number</option>
                <option value="checkbox">Checkbox</option>
              </select>
            </div>
            <div className="flex-1">
              <input
                type="text"
                value={field.field}
                onChange={(e) => handleChange(index, 'field', e.target.value)}
                placeholder="Field key"
                className="w-full px-2 py-1 text-sm border rounded outline-none ine-none focus:outline-none"
              />
            </div>

            <div className="flex-1">
              <input
                type="text"
                value={field.headerName}
                onChange={(e) => handleChange(index, 'headerName', e.target.value)
                }
                placeholder="Header name"
                className="w-full px-2 py-1 text-sm border rounded outline-none focus:outline-none"
              />
            </div>
            <label className="flex items-center mb-0 gap-x-2">
              <input
                type="checkbox"
                checked={field.validate}
                onChange={(e) => handleChange(index, 'validate', e.target.checked)
                }
              />
              Validate
            </label>
            <button
              type="button"
              disabled={dataFields.length === 1}
              onClick={() => removeColumn(index)}
              className="text-xs text-red-500 focus:outline-none hover:opacity-80 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Remove
            </button>
          </div>
      {field.validate && <div className="mt-1">
            <input
              placeholder="Provide validation api url"
              className="w-full px-2 py-1 text-sm border rounded outline-none focus:outline-none"
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>}
        </div>
      ))}

      <div>
        <button
          type="button"
          onClick={addColumn}
          className="flex items-center mt-2 text-xs font-medium text-gray-700 focuse:outline-none gap-x-1"
        >
          Add column
        </button>
      </div>
    </div>
  );
}
