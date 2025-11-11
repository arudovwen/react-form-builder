import React, { useEffect, useState } from 'react';
import axios from 'axios';

const token = window?.localStorage.getItem('token') || '';

export default function AzureFileSettings({
  detail = {},
  onValueChange = () => {}, apiUrl,
}) {
const api = axios.create({
    baseURL: `${apiUrl}/workflows/api/v1`,
    headers: { Authorization: `Bearer ${token}` },
  });

  const [loading, setLoading] = useState(false);

  const [settings, setSettings] = useState([]);
  const [containers, setContainers] = useState([]);
  const [folders, setFolders] = useState([]);

  // -----------------------
  // Uncontrolled internal state
  // -----------------------
  const [storageSettingId, setStorageSettingId] = useState(
    detail.storageSettingId || '',
  );
  const [containerName, setContainerName] = useState(
    detail.containerName || '',
  );
  const [folderName, setFolderName] = useState(detail.folderName || '');

  // -----------------------
  // Fetch: Settings
  // -----------------------
  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/Settings/get-all?activitySettingType=azure');
      setSettings(data?.results || []);
    } finally {
      setLoading(false);
    }
  };

  // -----------------------
  // Fetch: Containers
  // -----------------------
  const fetchContainers = async (id) => {
    if (!id) return;
    try {
      setLoading(true);
      const { data } = await api.get(`/Azure/get-containers/${id}`);
      setContainers(data?.data || []);
    } finally {
      setLoading(false);
    }
  };

  // -----------------------
  // Fetch: Folders
  // -----------------------
  const fetchFolders = async (id, container) => {
    if (!id || !container) return;
    try {
      setLoading(true);
      const { data } = await api.get(
        `/Azure/get-folders/${id}/${container}`,
      );
      setFolders(data?.data || []);
    } finally {
      setLoading(false);
    }
  };

  // Load settings on mount
  useEffect(() => {
    fetchSettings();
  }, []);

  // When storage setting changes
  useEffect(() => {
    setContainers([]);
    setFolders([]);

    if (storageSettingId) fetchContainers(storageSettingId);

    onValueChange({
      storageSettingId,
      containerName: '',
      folderName: '',
    });
  }, [storageSettingId]);

  // When container changes
  useEffect(() => {
    setFolders([]);

    if (storageSettingId && containerName) {
      fetchFolders(storageSettingId, containerName);
    }

    onValueChange({
      storageSettingId,
      containerName,
      folderName: '',
    });
  }, [containerName]);

  // When folder changes
  useEffect(() => {
    onValueChange({
      storageSettingId,
      containerName,
      folderName,
    });
  }, [folderName]);

  return (
    <div className="max-w-[500px] py-4 space-y-5">
      <h2 className="text-lg font-semibold">Azure File Settings</h2>

      {/* Storage Setting */}
      <div className="space-y-1">
        <label className="text-sm">Storage Setting</label>
        <select
          className="w-full p-2 border rounded"
          defaultValue={storageSettingId}
          onChange={(e) => {
            setStorageSettingId(e.target.value);
            setContainerName('');
            setFolderName('');
          }}
        >
          <option value="">Select storage setting</option>
          {settings.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {/* Containers */}
      {storageSettingId && (
        <div className="space-y-1">
          <label className="text-sm">Container</label>
          <select
            className="w-full p-2 border rounded"
            value={containerName}
            onChange={(e) => {
              setContainerName(e.target.value);
              setFolderName('');
            }}
          >
            <option value="">Select a container</option>
            {containers.map((c) => (
              <option key={c.text} value={c.value}>
                {c.text}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Folders */}
      {containerName && (
        <div className="space-y-1">
          <label className="text-sm">Folder</label>
          <select
            className="w-full p-2 border rounded"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
          >
            <option value="">Select a folder</option>
            {folders.map((f) => (
              <option key={f.text} value={f.value}>
                {f.text}
              </option>
            ))}
          </select>
        </div>
      )}

      {loading && <div className="text-sm text-gray-500">Loading...</div>}

      {/* Summary */}
      <div className="p-3 mt-4 space-y-1 text-sm border rounded bg-gray-50">
        <div>Setting: {storageSettingId}</div>
        <div>Container: {containerName}</div>
        <div>Folder: {folderName}</div>
      </div>
    </div>
  );
}
