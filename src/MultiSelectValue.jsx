import React, { useEffect, useState } from 'react';
import { Listbox } from '@headlessui/react';
import { Check, ChevronDown, X } from 'lucide-react';

export default function MultiSelectValue({
  value = [],
  onChange,
  options = [],
}) {
  const [selectedOptions, setSelectedOptions] = useState(value);
  useEffect(() => {
    if (onChange) {
      const normalized = selectedOptions.map((i) => ({
        ...i,
        fieldType: i.fieldType || 'text',
        operator: i.operator || 'equals',
        value: i.value ?? '', // handles empty string, 0, false properly
      }));
      onChange(normalized);
    }
  }, [selectedOptions]);

  const filteredOptions = options.filter(
    (opt) => !selectedOptions.some((sel) => sel.id === opt.id),
  );

  const removeItem = (id) => {
    setSelectedOptions((prev) => prev.filter((item) => item.id !== id));
  };

  // const handleLabelChange = (index, newLabel) => {
  //   setSelectedOptions((prev) => prev.map((item, i) => (i === index ? { ...item, label: newLabel } : item)));
  // };

  const handleValueChange = (index, name, newValue) => {
    setSelectedOptions((prev) => prev.map((item, i) => (i === index ? { ...item, [name]: newValue } : item)));
  };

  return (
    <div className="space-y-2">
      <Listbox value={selectedOptions} onChange={setSelectedOptions} multiple>
        <div className="relative mt-1">
          <Listbox.Button className="relative w-full py-2 pl-3 pr-10 text-sm text-left bg-white border border-gray-300 rounded shadow-sm cursor-default focus:outline-none">
            <span className="block truncate">
              {selectedOptions.length > 0
                ? selectedOptions.map((opt) => opt.label).join(', ')
                : 'Select options'}
            </span>
            <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </span>
          </Listbox.Button>

          <Listbox.Options className="absolute z-10 w-full py-1 mt-1 overflow-auto text-base bg-white border border-gray-200 rounded shadow max-h-60 focus:outline-none sm:text-sm">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <Listbox.Option
                  key={option.id}
                  value={option}
                  className={({ active }) => `relative cursor-pointer select-none py-2 pl-4 pr-4 ${
                      active ? 'bg-blue-100 text-blue-900' : 'text-gray-900'
                    }`
                  }
                >
                  {({ selected }) => (
                    <>
                      <span
                        className={`block truncate ${
                          selected ? 'font-medium' : 'font-normal'
                        }`}
                      >
                        {option.label}
                      </span>
                      {selected && (
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                          <Check className="w-4 h-4" aria-hidden="true" />
                        </span>
                      )}
                    </>
                  )}
                </Listbox.Option>
              ))
            ) : (
              <div className="px-4 py-2 text-gray-500">No option selected</div>
            )}
          </Listbox.Options>
        </div>
      </Listbox>

      {/* Editable selected items */}
      {selectedOptions.length > 0 && (
        <div className="grid items-center grid-cols-1 gap-2 mt-1">
          {selectedOptions.map((opt, index) => (
            <div
              key={opt.id}
              className="flex items-center gap-1 px-2 py-1 text-sm bg-gray-100 border rounded-lg outline-none hover:outline-none focus:outline-none"
            >
              <input
                type="text"
                value={opt.label}
                readOnly
                className="flex-1 px-1 py-1 text-xs border rounded"
              />

              <select
                value={opt.fieldType}
                onChange={(e) => handleValueChange(index, 'fieldType', e.target.value)
                }
                className="flex-1 px-1 py-1 text-xs border rounded outline-none hover:outline-none focus:outline-none"
              >
                <option value="text">Text</option>
                <option value="number">Number</option>
                <option value="boolean">Boolean</option>
              </select>
              <select
                value={opt.operator}
                onChange={(e) => handleValueChange(index, 'operator', e.target.value)
                }
                className="flex-1 px-2 py-1 text-xs border rounded outline-none focus:ring-1 focus:ring-blue-300"
              >
                <option value="equals">Equals</option>
                <option value="not_equals">Not equals</option>
                {opt.fieldType === 'number' && (
                  <option value="greater">Greater than</option>
                )}
                {opt.fieldType === 'number' && (
                  <option value="less">Less than</option>
                )}
                <option value="contains">Contains</option>
                <option value="not_contains">Does not contain</option>
              </select>

              {opt.fieldType !== 'boolean' ? (
                <input
                  type={opt.fieldType}
                  value={opt.value || ''}
                  onChange={(e) => handleValueChange(index, 'value', e.target.value)
                  }
                  className="flex-1 px-1 py-1 text-xs border rounded outline-none hover:outline-none focus:outline-none"
                  placeholder="Value"
                />
              ) : (
                <div className="flex items-center justify-center flex-1 px-1 py-1 text-xs bg-white border rounded outline-none gap-x-4 hover:outline-none focus:outline-none">
                  <label className="flex items-center !mb-0 gap-x-2">
                    <input
                      type="radio"
                      name={`boolean-${index}`} // ensures mutual exclusivity per item
                      checked={opt.value === true}
                      onChange={() => handleValueChange(index, 'value', true)}
                    />
                    True
                  </label>
                  <label className="flex items-center gap-x-2 !mb-0">
                    <input
                      type="radio"
                      name={`boolean-${index}`}
                      checked={opt.value === false}
                      onChange={() => handleValueChange(index, 'value', false)}
                    />
                    False
                  </label>
                </div>
              )}
              <button
                type="button"
                onClick={() => removeItem(opt.id)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
