import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface SearchSuggestionItem {
  id: string;
  title: string;
}

interface SearchSuggestProps {
  searchQuery: string;
  onChangeSearch: (value: string) => void;
  suggestions: SearchSuggestionItem[];
  onSelectSuggestion: (id: string) => void;
  maxSuggestions?: number;
}

export default function SearchSuggest({
  searchQuery,
  onChangeSearch,
  suggestions,
  onSelectSuggestion,
  maxSuggestions = 5,
}: SearchSuggestProps) {
  const showSuggestions = suggestions.length > 0 && searchQuery.trim() !== '';

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
      <Input
        placeholder="Search topics..."
        value={searchQuery}
        onChange={e => onChangeSearch(e.target.value)}
        className="pl-10 text-sm"
        autoComplete="off"
      />

      {showSuggestions && (
        <ul className="absolute left-0 right-0 z-50 mt-1 max-h-64 overflow-auto rounded-md border border-base-300 bg-card shadow-lg">
          {suggestions.slice(0, maxSuggestions).map(s => (
            <li key={s.id} className="w-full">
              <button
                className="w-full px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                onMouseDown={() => onSelectSuggestion(s.id)}
              >
                {s.title}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}


