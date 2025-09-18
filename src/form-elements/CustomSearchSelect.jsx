import clsx from 'clsx';
import React, { useState, useEffect, useCallback, useMemo, forwardRef } from 'react';
import axios from 'axios';
import {
  Combobox,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
  ComboboxButton,
} from '@headlessui/react';
import { ChevronDown } from 'lucide-react';

const CustomSelect = forwardRef(
  (
    {
      options = [],
      defaultValue,
      onGetValue,
      readOnly = false,
      url = '',
    },
    ref,
  ) => {
    const [query, setQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const [selectedValue, setSelectedValue] = useState(defaultValue || null);
    const [fetchedOptions, setFetchedOptions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Debounce input
    useEffect(() => {
      const timeoutId = setTimeout(() => {
        setDebouncedQuery(query);
      }, 300);
      return () => clearTimeout(timeoutId);
    }, [query]);

    // Merge options and fetchedOptions
    const mergedOptions = useMemo(() => [
        ...new Map(
          [...options, ...fetchedOptions].map((item) => [
            `${item.value}-${item.text}`,
            item,
          ]),
        ).values(),
      ], [options, fetchedOptions]);

    // Filter options by query
    const filteredOptions = useMemo(() => {
      if (debouncedQuery === '') return mergedOptions;
      return mergedOptions.filter((option) => option.text?.toLowerCase().includes(debouncedQuery.toLowerCase()));
    }, [debouncedQuery, mergedOptions]);

    // Check if user input should be creatable
    const isCreatable = useMemo(() => (
        query.length > 0 &&
        !mergedOptions.some(
          (option) => option.text.toLowerCase() === query.toLowerCase(),
        )
      ), [query, mergedOptions, defaultValue]);

    // Fetch from API
    const fetchData = useCallback(async () => {
      if (!url) return;
      setLoading(true);
      setError(null);

      try {
        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${window.localStorage.getItem('token')}`,
          },
          params: { q: debouncedQuery },
        });

        const data = Array.isArray(response.data)
          ? response.data
          : response.data?.data || [];

        setFetchedOptions(data);
      } catch (err) {
        console.error('Failed to load options:', err);
        setError('Something went wrong while fetching data.');
        setFetchedOptions([]);
      } finally {
        setLoading(false);
      }
    }, [url, debouncedQuery]);

    useEffect(() => {
      if (url) fetchData();
    }, []);

    // Notify parent
    useEffect(() => {
      if (onGetValue) {
        onGetValue(selectedValue);
      }
    }, [selectedValue]);

    // Helpers
    const getSelectedOption = (value) => mergedOptions.find((option) => option.value === value) || { value, text: value };

    const handleChange = (value) => {
      if (!mergedOptions.some((option) => option.value === value)) {
        const newOption = { value, text: value };
        setSelectedValue(value);
        setFetchedOptions((prev) => [...prev, newOption]);
      } else {
        setSelectedValue(value);
      }
    };

    return (
      <div className="relative w-full" ref={ref}>
        <Combobox
          value={selectedValue}
          onChange={handleChange}
          disabled={readOnly}
        >
          <div className="relative">
            <ComboboxInput
              disabled={readOnly}
              className={clsx(
                'w-full rounded-lg border border-gray-300 bg-white py-2 pr-10 pl-3 text-sm text-gray-900 disabled:bg-gray-200',
                'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
              )}
              displayValue={(val) => getSelectedOption(val)?.text || ''}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Select an option..."
            />
            <ComboboxButton className="absolute inset-y-0 right-0 flex items-center px-2 text-gray-400 hover:text-gray-600 disabled:bg-gray-200">
              <ChevronDown />
            </ComboboxButton>
          </div>

          <ComboboxOptions
            className={clsx(
              'absolute z-10 mt-2 max-h-60 w-full overflow-auto rounded-md border border-gray-200 bg-white p-1 shadow-lg',
              'ring-1 ring-black ring-opacity-5 focus:outline-none',
            )}
          >
            {loading && (
              <div className="px-3 py-2 text-sm text-gray-500">Loading...</div>
            )}

            {!loading && error && (
              <div className="px-3 py-2 text-sm text-red-500">{error}</div>
            )}

            {!loading && !error && filteredOptions.length === 0 && !isCreatable && (
              <div className="px-3 py-2 text-sm text-gray-500">No results found.</div>
            )}

            {!loading && !error &&
              filteredOptions.filter(i => i.value).map((option, index) => (
                <ComboboxOption
                  key={`${option.value}-${index}`}
                  value={option.value}
                  className={({ active, selected }) => clsx(
                      'cursor-default select-none rounded-md px-3 py-2 text-sm',
                      active ? 'bg-blue-100 text-blue-900' : 'text-gray-900',
                      selected && 'font-semibold',
                    )
                  }
                >
                  {option.text}
                </ComboboxOption>
              ))}

            {/* Show "Create" option if input doesn't match any */}
            {isCreatable && (
              <ComboboxOption
                value={query}
                className={({ active }) => clsx(
                    'cursor-pointer select-none rounded-md px-3 py-2 text-sm italic',
                    active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                  )
                }
              >
                Add "<strong>{query}</strong>"
              </ComboboxOption>
            )}
          </ComboboxOptions>
        </Combobox>
      </div>
    );
  },
);

export default CustomSelect;
