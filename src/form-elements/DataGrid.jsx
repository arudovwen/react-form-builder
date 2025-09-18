import React, { useState, useEffect } from 'react';
import CurrencyInput from 'react-currency-input-field';
import axios from 'axios';

export default function DataGrid({
  value = [],
  onChange,
  isReadOnly,
  columns = [],
  url,
}) {
  const [rows, setRows] = useState(value);
  const [editingCell, setEditingCell] = useState(null); // { rowIndex, field }
  const [validatingCells, setValidatingCells] = useState(new Set()); // Track cells being validated
  const [validationResults, setValidationResults] = useState({}); // Store validation results

  // Keep local rows in sync with prop
  useEffect(() => {
    setRows(value);
  }, []);

  const updateRowsAndNotify = (updated) => {
    setRows(updated);
    if (onChange) {
      onChange(updated);
    }
  };

  // Validation function - only runs for columns with validate: true
  const validateCell = async (val, rowIndex, field, column) => {
    // Double check that validation is explicitly true
    if (column.validate !== true || !url || !val) return;

    const cellKey = `${rowIndex}-${field}`;
    setValidatingCells(prev => new Set([...prev, cellKey]));

    try {
      const validationUrl = `${url}/${encodeURIComponent(val)}`;
      const { data, status } = await axios.get(validationUrl);

      // Store validation result
      setValidationResults(prev => ({
        ...prev,
        [cellKey]: {
          isValid: status === 200 && data,
          data: data.data?.description || data?.description,
          error: null,
        },
      }));
    } catch (error) {
      // Store validation error
      setValidationResults(prev => ({
        ...prev,
        [cellKey]: {
          isValid: false,
          data: null,
          error: error.response?.data?.message || error.message || 'Validation failed',
        },
      }));
    } finally {
      setValidatingCells(prev => {
        const newSet = new Set(prev);
        newSet.delete(cellKey);
        return newSet;
      });
    }
  };

  const handleCellChange = async (val, rowIndex, field) => {
    const updated = rows.map((row, i) => (i === rowIndex ? { ...row, [field]: val } : row));
    updateRowsAndNotify(updated);

    // Find the column to check if validation is needed
    const column = columns.find(col => col.field === field);
    // Only validate if column has validate: true, url is provided, and value exists
    if (column && column.validate === true && url && val) {
      await validateCell(val, rowIndex, field, column);
    }
  };

  const addRow = () => {
    const newId = rows.length > 0
      ? Math.max(...rows.map((row) => Number(row.id) || 0)) + 1
      : 1;

    const newRow = Object.fromEntries(
      columns.map((col) => [col.field, col.field === 'id' ? newId : '']),
    );

    updateRowsAndNotify([...rows, newRow]);
  };

  const deleteRow = (index) => {
    // Clean up validation results for deleted row
    const updatedValidationResults = { ...validationResults };
    Object.keys(updatedValidationResults).forEach(key => {
      if (key.startsWith(`${index}-`)) {
        delete updatedValidationResults[key];
      }
    });
    setValidationResults(updatedValidationResults);

    const updated = rows.filter((_, i) => i !== index);
    updateRowsAndNotify(updated);
  };

  const isEditing = (rowIndex, field) => editingCell?.rowIndex === rowIndex && editingCell?.field === field;

  const getCellValidationStatus = (rowIndex, field) => {
    const cellKey = `${rowIndex}-${field}`;
    const isValidating = validatingCells.has(cellKey);
    const validationResult = validationResults[cellKey];
    return { isValidating, validationResult };
  };

  // Renders editable inputs based on column type
  const renderEditableCell = (col, inputValue, rowIndex) => {
    const { isValidating, validationResult } = getCellValidationStatus(rowIndex, col.field);

    let validationClass = 'border-gray-300';
    if (col.validate === true) {
      if (validationResult?.isValid === false) {
        validationClass = 'border-red-500 bg-red-50';
      } else if (validationResult?.isValid === true) {
        validationClass = 'border-green-500 bg-green-50';
      }
    }
    const inputClassName = `w-full px-2 py-1 border rounded outline-none ${validationClass}`;

    if (col.type === 'number') {
      return (
        <div className="relative">
          <CurrencyInput
            value={inputValue ?? ''}
            onValueChange={(val) => handleCellChange(val, rowIndex, col.field)}
            decimalsLimit={6}
            allowNegativeValue={false}
            className={inputClassName}
            autoFocus
          />
          {isValidating && (
            <div className="absolute right-1 top-1">
              <div className="w-4 h-4 border-2 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
            </div>
          )}
        </div>
      );
    }

    if (col.type === 'checkbox') {
      return (
        <input
          type="checkbox"
          checked={!!inputValue}
          onChange={(e) => handleCellChange(e.target.checked, rowIndex, col.field)}
          onBlur={() => setEditingCell(null)}
          className="px-2 py-1 text-gray-600 border rounded outline-none"
          autoFocus
        />
      );
    }

    return (
      <div className="relative">
        <input
          type="text"
          value={inputValue ?? ''}
          onChange={(e) => handleCellChange(e.target.value, rowIndex, col.field)}
          onBlur={() => setEditingCell(null)}
          className={inputClassName}
          autoFocus
        />
        {isValidating && (
          <div className="absolute right-1 top-1">
            <div className="w-4 h-4 border-2 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
          </div>
        )}
      </div>
    );
  };

  // Renders read-only cell display
  const renderReadOnlyCell = (col, val, rowIndex) => {
    const { validationResult } = getCellValidationStatus(rowIndex, col.field);

    const cellContent = (() => {
      if (col.type === 'number') {
        return Number(val).toLocaleString();
      }
      if (col.type === 'checkbox') {
        return val ? 'Yes' : 'No';
      }
      return val;
    })();

    if (col.validate === true && validationResult) {
      return (
        <div className="flex items-center gap-2">
          <span>{cellContent} {typeof validationResult?.data === 'string' ? `[${validationResult?.data}]` : ''}</span>
          {validationResult.isValid ? (
            <span className="text-xs text-green-600">✓</span>
          ) : (
            <span
              className="text-xs text-red-600 cursor-help"
              title={validationResult.error}
            >
              ✗
            </span>
          )}
        </div>
      );
    }

    return cellContent;
  };

  return (
    <div className="mt-3 rounded">
      <div className="flex justify-end">
        {columns.length > 0 && !isReadOnly && (
          <button
            onClick={addRow}
            type="button"
            className="px-2 py-1 mb-3 text-xs text-white bg-gray-600 rounded hover:bg-gray-700"
          >
            Add Row
          </button>
        )}
      </div>

      <table className="w-full text-sm border-collapse rounded table-auto bg-gray-50">
        <thead>
          <tr className="bg-gray-100">
            {columns.map((col, index) => (
              <th
                key={`${col.field}- ${index}`}
                className="px-3 py-2 text-xs font-semibold text-left text-gray-600 border"
              >
                {col.headerName || col.field}
                {col.validate === true && (
                  <span className="ml-1 text-blue-600" title="This field will be validated">
                    *
                  </span>
                )}
              </th>
            ))}
            {!isReadOnly && <th className="w-10 px-2 py-2 border"></th>}
          </tr>
        </thead>
        <tbody>
          {rows.length > 0 ? (
            rows.map((row, rowIndex) => (
              <tr key={`${row.id}- ${rowIndex}`}>
                {columns.map((col) => {
                  const cellValue = row[col.field];
                  const editable = col.editable && !isReadOnly;
                  const editing = isEditing(rowIndex, col.field);

                  return (
                    <td
                      key={col.field}
                      className="px-3 py-1 border"
                      onDoubleClick={() => editable && setEditingCell({ rowIndex, field: col.field })}
                    >
                      {editable && editing
                        ? renderEditableCell(col, cellValue, rowIndex)
                        : (
                          <span className="block py-1 text-gray-700 cursor-pointer">
                            {renderReadOnlyCell(col, cellValue, rowIndex)}
                          </span>
                        )}
                    </td>
                  );
                })}
                {!isReadOnly && (
                  <td className="px-3 py-1 text-center border">
                    <button
                      onClick={() => deleteRow(rowIndex)}
                      className="text-red-500 hover:text-red-700"
                      aria-label="Delete row"
                    >
                      Remove
                    </button>
                  </td>
                )}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={columns.length + (isReadOnly ? 0 : 1)}
                className="p-2 text-xs text-center text-gray-400"
              >
                No data available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
