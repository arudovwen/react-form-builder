import React, { useEffect, useState } from 'react';
import { Listbox } from '@headlessui/react';
import { Check, ChevronDown, X } from 'lucide-react';

export default function MultiSelectInput({ value = [], onChange, options }) {
  const [selectedOptions, setSelectedOptions] = useState(value);

  useEffect(() => {
    if (onChange) {
      onChange(selectedOptions);
    }
  }, [selectedOptions, onChange]);

  // Filter out selected options from dropdown
  const filteredOptions = options.filter(
    (opt) => !selectedOptions.some((sel) => sel.id === opt.id),
  );

  // Remove item handler
  const removeItem = (id) => {
    setSelectedOptions((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="space-y-2">
      <Listbox value={selectedOptions} onChange={setSelectedOptions} multiple>
        <div className="relative mt-1">
          <Listbox.Button className="relative w-full py-2 pl-3 pr-10 text-sm text-left bg-white border border-gray-300 rounded shadow-sm cursor-default focus:outline-none">
            <span className="block truncate">
              {selectedOptions.length > 0
                ? selectedOptions.map((opt) => opt?.label).join(', ')
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
                      {selected ? (
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                          <Check className="w-4 h-4" aria-hidden="true" />
                        </span>
                      ) : null}
                    </>
                  )}
                </Listbox.Option>
              ))
            ) : (
              <div className="px-4 py-2 text-gray-500">All options selected</div>
            )}
          </Listbox.Options>
        </div>
      </Listbox>

      {/* List of selected items with remove buttons */}
      {selectedOptions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedOptions.map((opt) => (
            <span
              key={opt.id}
              className="flex items-center px-2 py-1 text-sm bg-gray-100 border rounded-full"
            >
              {opt.label}
              <button
                type="button"
                onClick={() => removeItem(opt.id)}
                className="ml-1 text-gray-500 hover:text-gray-700"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
