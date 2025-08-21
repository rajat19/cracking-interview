import { Search } from "lucide-react";
import { Input } from "../ui/input";

interface SearchFilterProps {
    searchQuery: string;
    onChangeSearch: (value: string) => void;
}

const SearchFilter = ({ searchQuery, onChangeSearch }: SearchFilterProps) => {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
      <Input
        placeholder="Search topics..."
        value={searchQuery}
        onChange={(e) => onChangeSearch(e.target.value)}
        className="pl-10 text-sm"
      />
    </div>
  );
};

export default SearchFilter;