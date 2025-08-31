'use client';

import { Button } from '@/components/ui/button';

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
    <li key={option}>
      <Button
        variant="ghost"
        className="w-full rounded p-2 text-left"
        onClick={() => onChange(option)}
      >
        {label}
      </Button>
    </li>
  );
};

const DropdownFilter = ({ label, value, onChange, options }: DropdownFilterProps) => {
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
          <div className="max-h-64 overflow-y-auto overscroll-contain">
            <ul className="menu space-y-1 p-2">
              <DropdownFilterItem label={`All ${label}`} option="" onChange={onChange} />
              {options.map(option => (
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
  );
};

export default DropdownFilter;
