import React, { useEffect, useState } from 'react';

const OptionCreateList = ({ initialFields = [], onChange, hideKey }) => {
  const [fields, setFields] = useState(initialFields);

  const handleChange = (index, field, newValue) => {
    const updated = [...fields];
    updated[index][field] = newValue;
    setFields(updated);
  };

  const addField = () => {
    setFields([...fields, { key: '', label: '', value: '' }]);
  };

  const removeField = (index) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  useEffect(() => {
    onChange(fields);
  }, [fields]);

  useEffect(() => {
    setFields(initialFields);
  }, [initialFields]);

  return (
    <>
      <div className="mb-6" >
       <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
         {fields.map((field, index) => (
          <div key={index} className="flex gap-x-[6px] mb-2">
            {!hideKey && (
              <input
                placeholder="Enter Key"
                value={field.key}
                onChange={(e) => handleChange(index, 'key', e.target.value)}
                className="flex-1 input-style"
              />
            )}
            <input
              placeholder="Enter Label"
              value={field.label}
              onChange={(e) => handleChange(index, 'label', e.target.value)}
              className="flex-1 input-style"
            />
            <input
              placeholder="Enter Value"
              value={field.value}
              onChange={(e) => handleChange(index, 'value', e.target.value)}
              className="flex-1 input-style"
            />

            <button
              type="button"
              onClick={() => removeField(index)}
              className="ml-1 text-xs outline-none"
            >
              Remove
            </button>
          </div>
        ))}
       </div>
        <button
          type="button"
          className="text-xs outline-none"
          onClick={addField}
        >
          Add Option
        </button>
      </div>

      {/* Debugging Output */}
      {/* <pre style={{ fontSize: '8px' }} className='text-[8px]'>{JSON.stringify(fields, null, 2)}</pre> */}
    </>
  );
};

export default OptionCreateList;
