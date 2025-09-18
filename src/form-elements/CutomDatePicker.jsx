import clsx from 'clsx';
import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const CustomDatePicker = ({ defaultValue, onGetValue, readOnly, dateFormat, minDate, maxDate }) => {
  const [startDate, setStartDate] = useState(defaultValue || new Date());
  useEffect(() => {
    if (onGetValue) {
      onGetValue(startDate);
    }
  }, [startDate]);

  return (
    <DatePicker
      dateFormat={dateFormat}
      disabled={readOnly}
      showIcon
      selected={startDate}
      onChange={(date) => setStartDate(date)}
      startDate={minDate}
      endDate={maxDate}
      className={clsx(
        'w-full rounded-lg border border-gray-300 bg-white py-2 pr-10 pl-3  text-gray-900 ',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
      )}
    />
  );
};

export default CustomDatePicker;
