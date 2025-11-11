/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useMemo } from 'react';

export default function ArithmeticComponentView({
  defaultValue = 0,
  onChange,
  isReadOnly = false,
  mappedFields = [],
  resultData = {},
}) {
  const [combinedFields, setCombinedFields] = useState([]);

  // ✅ Build combined fields when in edit mode (not read-only)
  useEffect(() => {
    if (isReadOnly || !Array.isArray(mappedFields)) return;

    const initialFields = mappedFields.map((field) => {
      const raw = resultData?.[field.field_name] ?? field.value ?? 0;
      const numericValue = parseFloat(String(raw).replace(/,/g, '')) || 0;
      return { ...field, value: numericValue };
    });

    setCombinedFields(initialFields);
  }, [mappedFields, resultData, isReadOnly]);

  // ✅ Perform calculation only when not read-only
  const calculatedResult = useMemo(() => {
    if (isReadOnly || !combinedFields.length) {
      // use previous stored value instead
      return parseFloat(String(defaultValue).replace(/,/g, '')) || 0;
    }

    return combinedFields.reduce((total, { operation, value }, index) => {
      const num = parseFloat(value) || 0;
      if (index === 0) return num;

      switch (operation) {
        case '+':
          return total + num;
        case '-':
          return total - num;
        case '*':
          return total * num;
        case '/':
          return num === 0 ? NaN : total / num;
        default:
          return total;
      }
    }, 0);
  }, [combinedFields, isReadOnly, defaultValue]);

  // ✅ Notify parent only in edit mode
  useEffect(() => {
    if (!isReadOnly && typeof onChange === 'function') {
      const safeValue =
        Number.isFinite(calculatedResult) && !Number.isNaN(calculatedResult)
          ? calculatedResult.toLocaleString()
          : '0';
      onChange(safeValue);
    }
  }, [calculatedResult, isReadOnly]);

  // ✅ Display value based on mode
  const displayValue =
    Number.isFinite(calculatedResult) && !Number.isNaN(calculatedResult)
      ? calculatedResult.toLocaleString()
      : '0';

  return (
    <div className="form-control field-control">
      {displayValue}
    </div>
  );
}
