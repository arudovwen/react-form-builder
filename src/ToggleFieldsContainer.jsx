import React, { useMemo } from 'react';

export default function ToggleFieldsContainer({
  toggleVisibility,
  fields = [],
  results = {},
  data,
  children,
}) {
  const dependentValue = useMemo(
    () => results?.[data?.dependentField],
    [results, data],
  );

  const toggleResult = useMemo(
    () => fields.every((field) => {
        const value = results?.[field.field_name];
        const operator = field.operator || 'equals';

        if (field.id && field.label && field.fieldType && field.value != null) {
          const valA = field.value;
          const valB = value;

          switch (operator) {
            case 'equals':
              return String(valA).toLowerCase() === String(valB).toLowerCase();
            case 'not_equals':
              return String(valA).toLowerCase() !== String(valB).toLowerCase();
            case 'greater':
              return Number(valB) > Number(valA);
            case 'less':
              return Number(valB) < Number(valA);
            case 'contains':
              return String(valB)
                .toLowerCase()
                .includes(String(valA).toLowerCase());
            case 'not_contains':
              return !String(valB)
                .toLowerCase()
                .includes(String(valA).toLowerCase());
            default:
              return false;
          }
        }

        return false;
      }),
    [fields, results],
  );
  return (
    <>
      <div
        className={
          (data?.isCascade && !dependentValue) ||
          (toggleVisibility && (!toggleResult || !fields.length))
            ? 'opacity-10 h-0 overflow-hidden'
            : ''
        }
      >
        {children}
      </div>
    </>
  );
}
