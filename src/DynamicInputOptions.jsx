import React, { useEffect, useState } from 'react';

const DynamicInputOptionList = ({ initialFields = [], onChange }) => {
  const [fields, setFields] = useState(initialFields);

  const handleChange = (index, field, newValue) => {
    const updated = [...fields];
    updated[index][field] = newValue;
    setFields(updated);
  };

  const addField = () => {
    setFields([...fields, { key: '', label: '', value: '', type: 'text' }]);
  };

  const removeField = (index) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  useEffect(() => {
    onChange(fields);
  }, [fields]);

  return (
    <>
      <div className="mb-6">
        {fields.map((field, index) => (
          <div key={index} className="flex gap-x-[10px] mb-2">
            <input
              placeholder="Enter Key"
              value={field.key}
              onChange={(e) => handleChange(index, 'key', e.target.value)}
               className="border border-gray-100 rounded w-full px-3 py-1 outline-none"
            />
            <input
              placeholder="Enter Label"
              value={field.label}
              onChange={(e) => handleChange(index, 'label', e.target.value)}
               className="border border-gray-100 rounded w-full px-3 py-1 outline-none"
            />
            <select onChange={(e) => handleChange(index, 'type', e.target.value)}
               className="border border-gray-100 rounded w-full px-3 py-1 outline-none">
                <option value="text">Text</option>
                <option value="number">Number</option>
                <option value="date">Date</option>
            </select>
            <button type='button' onClick={() => removeField(index)} className='text-xs outline-none ml-1' >Remove</button>
          </div>
        ))}
        <button type='button' className='text-xs outline-none' onClick={addField}>Add Field</button>
      </div>

      {/* Debugging Output */}
      <pre style={{ fontSize: '8px' }} className='text-[8px]'>{JSON.stringify(fields, null, 2)}</pre>

    </>
  );
};

export default DynamicInputOptionList;
