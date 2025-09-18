import React from 'react';

const OptionsExample = () => (
  <blockquote style={{ fontSize: '11px', marginBottom: '8px' }} className="p-2 space-y-2 text-sm text-gray-700 bg-gray-100 rounded-md">
    <ul className="space-y-1 list-disc list-inside">
      <li>
        <strong>Method:</strong> <code>GET</code>
      </li>
      <li style={{ fontSize: '11px' }}>
        <strong>Response format:</strong>
        <pre className="p-2 mt-1 overflow-auto text-xs bg-white rounded-md">
          <code>
{`{
  "data": [
    { "text": "Option 1", "value": "1", "key": "" },
    { "text": "Option 2", "value": "2", "key": "" }
  ]
}`}
          </code>
        </pre>
      </li>
    </ul>
  </blockquote>
);

export default OptionsExample;
