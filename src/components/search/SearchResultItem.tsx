import { SearchResult } from '../../pages/SearchResultsPage'

interface SearchResultItemProps {
  result: SearchResult
  onClick: (id: number) => void
}

export const SearchResultItem = ({ result, onClick }: SearchResultItemProps) => {
  return (
    <div
      onClick={() => onClick(result.id)}
      className="bg-white rounded-xl shadow-xl border border-slate-200 p-5 hover:shadow-2xl hover:border-indigo-300 cursor-pointer transition-all duration-200"
    >
      <div className="flex gap-2 mb-2 text-sm">
        <span className="text-slate-600 font-light">{result.court}</span>
        <span className="text-slate-400">|</span>
        <span className="text-slate-600 font-light">{result.date}</span>
        <span className="text-slate-400">|</span> 
        <span className="bg-indigo-50 border border-indigo-200 text-indigo-700 px-2 py-0.5 rounded-lg text-xs flex items-center font-medium">{result.caseType}</span>
        <span className="bg-purple-50 border border-purple-200 text-purple-700 px-2 py-0.5 rounded-lg text-xs flex items-center font-medium">{result.judgmentType}</span>
      </div>
      <h3 className="font-medium text-lg mb-3 text-slate-800 leading-tight hover:text-indigo-600 transition-colors">{result.title}</h3>
      <p className="text-slate-600 text-sm line-clamp-2 leading-relaxed font-light">{result.content}</p>
    </div>
  )
}
