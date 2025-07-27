/* eslint-disable no-unused-vars */
import React, { useMemo, useState, useEffect } from 'react';
import CurrencyInput from 'react-currency-input-field';

const DynamicInputList = ({
  initialFields = [],
  getValues,
  readOnly = false,
  tempDefaultValue = {},
}) => {
  // Initialize merged fields only once
  const [fields, setFields] = useState([]);

  useEffect(() => {
   const tempData = initialFields?.map((field) => ({
    ...field,
    value: tempDefaultValue?.[field.key] ?? field.value,
  }));
  setFields(tempData);
  }, [initialFields]);

  const handleChange = (index, field, newValue) => {
    if (readOnly) return;
    const updated = [...fields];
    updated[index][field] = newValue;
    setFields(updated);

    // Sync the transformed values immediately on change
    const updatedTransformed = updated.reduce((acc, f) => {
      if (f.key.trim()) acc[f.key] = f.value;
      return acc;
    }, {});
    // eslint-disable-next-line no-unused-expressions
    getValues?.(updatedTransformed);
  };

  // For debugging or UI preview
  const transformedFields = useMemo(
    () => fields.reduce((acc, field) => {
        if (field.key.trim()) {
          acc[field.key] = field.value;
        }
        return acc;
      }, {}),
    [fields],
  );

  return (
    <>
      <div>
        {fields.map((field, index) => (
          <div key={index} style={{ marginBottom: 10 }}>
            <label className="block text-sm text-[#686878] darks:!text-white/70 mb-2">
              {field.label}
            </label>
          {field?.type === 'number' ? <CurrencyInput
              id={field.key}
              placeholder={`Provide ${field.label?.toLowerCase() || 'value'}`}
              className="w-full px-3 py-1 border border-gray-100 rounded outline-none"
              decimalsLimit={6}
              defaultValue={field.value}
              onValueChange={(e) => handleChange(index, 'value', e)}
              disabled={readOnly}
              allowNegativeValue={false}
            /> :
            <input
              placeholder={`Provide ${field.label?.toLowerCase() || 'value'}`}
              value={field.value}
              id={field.key}
              name={field.key}
              type={field.type}
              onChange={(e) => handleChange(index, 'value', e.target.value)}
              readOnly={readOnly}
              className="w-full px-3 py-1 border border-gray-100 rounded outline-none"
            />}

          </div>
        ))}
      </div>

      {/* Debug preview of transformed object */}
      {/* <h4>Transformed Output:</h4>
      <pre>{JSON.stringify(transformedFields, null, 2)}</pre> */}
    </>
  );
};

export default DynamicInputList;
