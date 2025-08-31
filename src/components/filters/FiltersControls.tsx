'use client';

import { Button } from '@/components/ui/button';
import SearchFilter from '@/components/filters/SearchFilter';
import DifficultyFilter from '@/components/filters/DifficultyFilter';
import DropdownFilter from '@/components/filters/DropdownFilter';
import { ITopicDifficulty } from '@/types/topic';

interface FiltersControlsProps {
  variant: 'mobile' | 'desktop';
  searchQuery: string;
  onChangeSearch: (value: string) => void;
  difficultyFilter: ITopicDifficulty;
  onChangeDifficulty: (value: ITopicDifficulty) => void;
  topicTagFilter: string;
  companyFilter: string;
  allTags: string[];
  allCompanies: string[];
  onChangeTopic: (value: string) => void;
  onChangeCompany: (value: string) => void;
  onClear: () => void;
}

const FiltersControls = ({
  variant,
  searchQuery,
  onChangeSearch,
  difficultyFilter,
  onChangeDifficulty,
  topicTagFilter,
  companyFilter,
  allTags,
  allCompanies,
  onChangeTopic,
  onChangeCompany,
  onClear,
}: FiltersControlsProps) => {
  const containerClass =
    variant === 'mobile'
      ? 'p-3 border-b border-border space-y-2'
      : 'p-3 lg:p-4 border-b border-border space-y-2 lg:space-y-3';

  return (
    <div className={containerClass}>
      <SearchFilter searchQuery={searchQuery} onChangeSearch={onChangeSearch} />
      <DifficultyFilter
        difficultyFilter={difficultyFilter}
        onChangeDifficulty={onChangeDifficulty}
        variant={variant}
      />

      <div className="grid grid-cols-1 gap-2 overflow-visible">
        <DropdownFilter
          label="Topic"
          value={topicTagFilter}
          onChange={onChangeTopic}
          options={allTags}
        />
        <DropdownFilter
          label="Company"
          value={companyFilter}
          onChange={onChangeCompany}
          options={allCompanies}
        />
      </div>

      {(topicTagFilter || companyFilter) && (
        <Button variant="destructive" size="sm" onClick={onClear} className="text-xs">
          Clear filters
        </Button>
      )}
    </div>
  );
};

export default FiltersControls;
