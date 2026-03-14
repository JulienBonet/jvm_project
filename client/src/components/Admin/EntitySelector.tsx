import { useState } from 'react';
import { Autocomplete, TextField, CircularProgress } from '@mui/material';
import {Entity} from '../../types/entities/release.types'

interface EntitySelectorProps {
  label: string;
  endpoint: string;
  value: Entity[];
  onChange: React.Dispatch<React.SetStateAction<Entity[]>>;
}

function EntitySelector({ label, endpoint, value, onChange }: EntitySelectorProps) {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [options, setOptions] = useState<Entity[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const search = async (query: string): Promise<void> => {
    if (!query) return;

    setLoading(true);

    const res = await fetch(`${backendUrl}/api/${endpoint}?search=${query}`);
    const data: Entity[] = await res.json();

    setOptions(data);
    setLoading(false);
  };

  return (
    <Autocomplete
      multiple
      options={options}
      value={value}
      getOptionLabel={(option) => option.name || ''}
      onChange={(e, newValue) => onChange(newValue)}
      onInputChange={(e, inputValue) => search(inputValue)}
      filterOptions={(opts, params) => {
        const filtered = [...opts];

        const exists = opts.some((o) => o.name.toLowerCase() === params.inputValue.toLowerCase());

        if (params.inputValue !== '' && !exists) {
          filtered.push({
            name: params.inputValue,
            isNew: true,
          });
        }

        return filtered;
      }}
      renderInput={(params) => (
        <TextField
          /* eslint-disable-next-line react/jsx-props-no-spreading */
          {...params}
          label={label}
          placeholder={`Search ${label}`}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading && <CircularProgress size={18} />}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );
}

export default EntitySelector;
