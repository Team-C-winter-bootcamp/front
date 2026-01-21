import React from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  searchInput: string;
  setSearchInput: (value: string) => void;
  onSearch: (e: React.FormEvent) => void;
  onClear: () => void;
}

export function SearchBar({
  searchInput,
  setSearchInput,
  onSearch,
  onClear
}: SearchBarProps) {
  return (
    <form onSubmit={onSearch} className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="판례 검색..."
          className="w-full pl-10 pr-10 py-2.5 border border-slate-300 rounded-full bg-white text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm"
        />
        {searchInput && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
    </form>
  );
}
