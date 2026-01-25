import { SearchResult } from '../../pages/SearchResult';

interface SearchResultItemProps {
  result: SearchResult;
  onClick: (case_No: string) => void;
}

export function SearchResultItem({ result, onClick }: SearchResultItemProps) {
  return (
    <div
      onClick={() => onClick(result.case_No)}
      className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg hover:border-indigo-300 transition-all cursor-pointer"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <span>{result.court}</span>
          <span>|</span>
          <span>{result.date}</span>
        </div>
        <div className="flex gap-2">
          <span className="px-2 py-1 text-xs font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 rounded">
            {result.caseType}
          </span>
          <span className="px-2 py-1 text-xs font-medium text-indigo-600 bg-indigo-50 border border-indigo-100 rounded">
            {result.judgmentType}
          </span>
        </div>
      </div>
      <h3 className="text-lg font-semibold text-slate-900 mb-2 leading-tight">
        {result.title}
      </h3>
      <p className="text-sm text-slate-600 leading-relaxed line-clamp-2">
        {result.content}
      </p>
    </div>
  );
}
