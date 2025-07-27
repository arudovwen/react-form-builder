import React, { useEffect, useMemo, useState } from 'react';

const CascadeDropdown = ({
  firstDropdownOptions,
  secondDropdownOptions,
  firstLabel,
  secondLabel,
  onGetValue,
  defaultValue,
  readOnly
}) => {
  // State to manage the selected value from both dropdowns
  const [selectedFirst, setSelectedFirst] = useState('');
  const [selectedSecond, setSelectedSecond] = useState('');

  // Handle the first dropdown change
  const handleFirstDropdownChange = (e) => {
    setSelectedFirst(e.target.value);
    setSelectedSecond(''); // Reset second dropdown when first changes
  };

  // Handle the second dropdown change
  const handleSecondDropdownChange = (e) => {
    setSelectedSecond(e.target.value);
  };

  useEffect(() => {
    if (onGetValue && selectedSecond && selectedFirst) {
      onGetValue(`${selectedFirst}_${selectedSecond}`);
    }
  }, [selectedFirst, selectedSecond]);

  useEffect(() => {
   if (defaultValue && defaultValue.includes('_')) {
     const splitValue = defaultValue?.split('_');
   if (splitValue[0]) setSelectedFirst(splitValue[0]);
   if (splitValue[1]) setSelectedSecond(splitValue[1]);
   }
  }, [defaultValue]);

  const filteredSecondOption = useMemo(() => secondDropdownOptions
              // eslint-disable-next-line eqeqeq
              ?.filter((i) => i.key == selectedFirst), [selectedFirst, secondDropdownOptions]);
  return (
    <div className="">
      {/* First Dropdown */}
      <div>
        <label
          htmlFor="first-dropdown"
          className="block mb-2 text-sm font-medium text-gray-700"
        >
          {firstLabel}
        </label>
        <select
          id="first-dropdown"
          value={selectedFirst}
          onChange={handleFirstDropdownChange}
          className="form-control"
          disabled={readOnly}
        >
          <option value="">Select an option</option>
          {firstDropdownOptions?.map((option) => (
            <option key={option.key} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Second Dropdown (Filtered based on first dropdown selection) */}
      {selectedFirst && (
        <div className="mt-4">
          <label
            htmlFor="second-dropdown"
            className="block mb-2 text-sm font-medium text-gray-700"
          >
            {secondLabel}
          </label>
          <select
            id="second-dropdown"
            value={selectedSecond}
            onChange={handleSecondDropdownChange}
            className="form-control"
            disabled={readOnly}
          >
            <option value="">Select an option</option>
            {filteredSecondOption
              ?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
          </select>
        </div>
      )}
    </div>
  );
};

export default CascadeDropdown;
