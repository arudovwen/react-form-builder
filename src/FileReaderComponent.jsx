import React, { useState } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

const FileReaderComponent = ({
  setValue,
  name,
}) => {
  const [fileName, setFileName] = useState('');

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);
    // eslint-disable-next-line no-undef
    const reader = new FileReader();

    if (file.name.endsWith('.csv')) {
      reader.onload = (event) => {
        // eslint-disable-next-line no-undef
        const csv = event?.target.result;
        const parsed = Papa.parse(csv, { header: true });
        setValue(name, parsed.data);
      };
      reader.readAsText(file);
    } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      reader.onload = (event) => {
        // @ts-expect-error sort later
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);
        setValue(name, json);
      };
      reader.readAsArrayBuffer(file);
    }
  };

  return (
    <div className="">
      <div className="relative">
        <input
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={handleFileUpload}
          className="mb-2 input-control file:bg-gray-600 file:text-white file:text-sm file:rounded file:border-gray-600 file:outline-none file-style input-style "
        />
        {fileName && (
          <p className="mb-2 text-[10px] text-gray-600">Uploaded: {fileName}</p>
        )}
      </div>
      <a
        href="https://res.cloudinary.com/arudovwen-me/raw/upload/v1750869365/optiontemplate_phj66e.xlsx"
        download
        className="mt-1 text-sm text-white text-primary font-weight-medium"
      >
        Download template
      </a>
    </div>
  );
};

export default FileReaderComponent;
