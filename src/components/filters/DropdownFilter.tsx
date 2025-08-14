interface DropdownFilterProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: string[];
}

const DropdownFilterItem = ({ label, option, onChange }: { label: string, option: string, onChange: (value: string) => void }) => {
    return (
      <li key={option}>
      <button 
        type="button" 
        onClick={() => onChange(option)} 
        className="text-left w-full p-2 rounded hover:text-foreground"
      >
        {label}
      </button>
    </li>
    );
};

const DropdownFilter = ({ label, value, onChange, options }: DropdownFilterProps) => {
    return (
      <div className="relative">
        <div className='dropdown w-full'>
          <div tabIndex={0} role="button" className="btn m-1 w-full justify-between glass-effect text-foreground">
            <span className="truncate">{value || `All ${label}`}</span>
          </div>
          <div tabIndex={0} className="dropdown-content z-[1000] bg-card rounded-box shadow-lg border border-base-300 mt-1">
            <div className="max-h-64 overflow-y-auto overscroll-contain">
              <ul className="menu p-2 space-y-1">
                <DropdownFilterItem label={`All ${label}`} option='' onChange={onChange} />
                {options.map(option => (
                  <DropdownFilterItem key={option} label={option} option={option} onChange={onChange} />
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
};

export default DropdownFilter;
