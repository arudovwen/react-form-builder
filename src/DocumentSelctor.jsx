import axios from 'axios';
import React, { useState, useEffect } from 'react';

export default function DocumentSelctor({ handleValue }) {
  const [documents, setDocuments] = useState([]);
  const [selected, setSelected] = useState(null);

  const getDocuments = async () => {
    try {
      const response = await axios.get(
        'https://api.dev.workflow.kusala.com.ng/api/v1/FileUpload/upload-document',
      );
      if (response.status === 200) {
        setDocuments({
          documents: response.data.data?.map((i) => ({
            label: i?.name,
            value: i?.id,
          })),
        });
      }
    } finally {
      this.setState({ fileLoading: false });
    }
  };

  useEffect(() => {
    getDocuments();
  }, []);

  useEffect(() => {
    handleValue(selected);
  }, [selected]);

  return (
    <div>
      <h4 className="text-13">Choose a document</h4>
      <div className="d-flex align-items-center position-relative clearfix pr-6">
        <select
          className="form-control"
          onChange={(e) => setSelected(e.target.value)}
        >
          <option value="label">Label</option>
          {documents?.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
