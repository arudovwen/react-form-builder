/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useMemo } from 'react';

export default function ArithmeticComponentView({
  defaultValue = [],
  onChange,
  isReadOnly,
  mappedFields = [],
  resultData = [],
}) {
  const [combinedFields, setCombinedFields] = useState([]);
  const [result, setResult] = useState(defaultValue);

  useEffect(() => {
    // Initialize combinedFields on mount or mappedFields change
    const initialFields = mappedFields.map((field, i) => {
      const raw = resultData?.[field.field_name] ?? '';

      const val = parseFloat(String(raw).replace(/,/g, '')) || field.value || '';
      return {
        ...field,
        value: Number.isNaN(val) ? '' : val,
      };
    });

    setCombinedFields(initialFields);
  }, [mappedFields, resultData]);

  const calculateResult = useMemo(() => {
    const valid = combinedFields.filter(
      (f) => f.value !== '' && !Number.isNaN(parseFloat(f.value)),
    );
  
    if (valid.length === 0) return null;

    let total = parseFloat(valid[0].value);
    for (let i = 1; i < valid.length; i++) {
      const { operation, value } = valid[i];
      const numVal = parseFloat(value);
      switch (operation) {
        case '+':
          total += numVal;
          break;
        case '-':
          total -= numVal;
          break;
        case '*':
          total *= numVal;
          break;
        case '/':
          total = numVal === 0 ? NaN : total / numVal;
          break;
        default:
          break;
      }
    }

    return total;
  }, [combinedFields]);

  useEffect(() => {
    setResult(calculateResult);
    if (onChange) onChange(calculateResult?.toString());
  }, [calculateResult]);
  // console.log({combinedFields, resultData});

  return (
    <div className="max-w-md">
      {/* <p className="font-semibold">
        Value:{' '}
        {result !== null && !Number.isNaN(result)
          ? result?.toLocaleString()
          : 'N/A'}
      </p> */}
    </div>
  );
}
