'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface DropdownFilterProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}

const DropdownFilterItem = ({
  label,
  option,
  onChange,
}: {
  label: string;
  option: string;
  onChange: (value: string) => void;
}) => {
  return (
    <li key={option} className="w-full">
      <Button
        variant="ghost"
        className="w-full justify-start rounded p-2 text-left"
        onClick={() => onChange(option)}
      >
        {label}
      </Button>
    </li>
  );
};

const DropdownFilter = ({ label, value, onChange, options }: DropdownFilterProps) => {
  const [query, setQuery] = useState('');

  const filteredOptions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return options;
    return options.filter(option => option.toLowerCase().includes(normalizedQuery));
  }, [options, query]);

  return (
    <div className="relative">
      <div className="dropdown w-full">
        <div
          tabIndex={0}
          role="button"
          className="glass-effect btn m-1 w-full justify-between text-foreground"
        >
          <span className="truncate">{value || `All ${label}`}</span>
        </div>
        <div
          tabIndex={0}
          className="dropdown-content z-[1000] mt-1 rounded-box border border-base-300 bg-card shadow-lg"
        >
          <div className="w-64 max-w-[calc(100vw-2rem)]">
            <div className="sticky top-0 z-[1] border-b border-base-300 bg-card p-2">
              <Input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder={`Filter ${label.toLowerCase()}...`}
                className="h-9 text-sm"
              />
            </div>
            <div className="max-h-64 overflow-y-auto overscroll-contain">
              <ul className="w-full space-y-1 p-2">
                <DropdownFilterItem label={`All ${label}`} option="" onChange={onChange} />
                {filteredOptions.length === 0 && (
                  <li className="px-2 py-1 text-sm text-muted-foreground">No options</li>
                )}
                {filteredOptions.map(option => (
                  <DropdownFilterItem
                    key={option}
                    label={option}
                    option={option}
                    onChange={onChange}
                  />
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DropdownFilter;
