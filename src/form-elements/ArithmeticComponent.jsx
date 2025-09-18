import React, { useState, useEffect, useCallback } from 'react';
import CurrencyInput from 'react-currency-input-field';

const OPERATIONS = ['+', '-', '*', '/'];

export default function ArithmeticComponent({
  mappedFields = [],
  isEditing = false,
  onChangeCalculationFields,
  calculationFields = [],
}) {
  const [combinedFields, setCombinedFields] = useState([]);

  // Merge mappedFields + custom fields on mappedFields change
  useEffect(() => {
    setCombinedFields((prev) => {
      const customFields = prev.length
        ? prev.filter((f) => !f.isMapped)
        : calculationFields.filter((f) => !f.isMapped);

      const updatedMapped = mappedFields.map((field, index) => {
        const existing =
          prev.find((f) => f.field_name === field.field_name && f.isMapped) ||
          calculationFields.find(
            (f) => f.field_name === field.field_name && f.isMapped,
          );

        return {
          field_name: field.field_name,
          label: field.label || `Field ${index + 1}`,
          value: existing?.value || '',
          operation: existing?.operation || (index === 0 ? '' : '+'),
          isMapped: true,
        };
      });

      return [...updatedMapped, ...customFields];
    });
  }, [mappedFields]);

  // Notify parent on change
  useEffect(() => {
    if (onChangeCalculationFields) {
      onChangeCalculationFields(combinedFields);
    }
  }, [combinedFields]);

  const updateField = useCallback((index, changes) => {
    setCombinedFields((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], ...changes };
      return updated;
    });
  }, []);

  const handleLabelChange = (index, newLabel) => {
    updateField(index, { label: newLabel });
  };

  const handleValueChange = (index, val) => {
    updateField(index, { value: val });
  };

  const handleOperationChange = (index, op) => {
    updateField(index, { operation: op });
  };

  const addCustomInput = () => {
    setCombinedFields((prev) => [
      ...prev,
      {
        label: `Custom Field ${prev.length + 1}`,
        value: '',
        operation: prev.length === 0 ? '' : '+',
        isMapped: false,
      },
    ]);
  };

  const handleDeleteCustomField = (index) => {
    setCombinedFields((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="max-w-sm p-3 bg-white rounded">
      <div className="space-y-3">
        {combinedFields.map((field, index) => (
            <div key={index} className="flex items-center gap-2">
              {isEditing && !field.isMapped ? (
                <input
                  type="text"
                  value={field.label}
                  onChange={(e) => handleLabelChange(index, e.target.value)}
                  className=" border outline-none focus:outline-none rounded w-[120px] text- p-2"
                />
              ) : (
                <span className="text-xs font-medium capitalize">{field.label}</span>
              )}

              <div className="flex items-center flex-1 gap-2">
                {index !== 0 && (
                  <select
                    value={field.operation}
                    onChange={(e) => handleOperationChange(index, e.target.value)
                    }
                    className="p-1 text-xl border rounded min-w-16"
                  >
                    {OPERATIONS.map((ops) => (
                      <option key={`op-${index}-${ops}`} value={ops}>
                        {ops}
                      </option>
                    ))}
                  </select>
                )}

                <CurrencyInput
                  value={field.value}
                  onValueChange={(val) => handleValueChange(index, val)}
                  className={`w-full p-2 text-xs outline-none focus:outline-none ${
                    field.isMapped ? 'bg-gray-100' : 'bg-white'
                  } text-gray-700 border rounded`}
                  placeholder={`${field.isMapped ? field.label : 'Enter'} value`}
                  readOnly={field.isMapped}
                />

                {isEditing && !field.isMapped && (
                  <button
                    onClick={() => handleDeleteCustomField(index)}
                    className="px-2 py-1 text-xs text-white bg-red-500 rounded hover:bg-red-600"
                    title="Remove field"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          ))}

        {isEditing && (
          <div className='flex justify-end'>
            <button
              type="button"
              onClick={addCustomInput}
              className="px-3 py-1 mt-2 text-sm text-white bg-blue-500 rounded hover:bg-blue-600"
            >
              + Add Input
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
