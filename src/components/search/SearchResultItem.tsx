import { SearchResult } from '../../pages/SearchResultsPage'

interface SearchResultItemProps {
  result: SearchResult
  onClick: (id: number) => void
}

export const SearchResultItem = ({ result, onClick }: SearchResultItemProps) => {
  return (
    <div
      onClick={() => onClick(result.id)}
      className="border border-gray-200 rounded-lg p-5 hover:shadow-md hover:border-blue-300 cursor-pointer transition-all bg-white"
    >
      <div className="flex gap-2 mb-2 text-sm">
        <span className="text-blue-600 font-semibold">{result.court}</span>
        <span className="text-gray-400">|</span>
        <span className="text-gray-600">{result.date}</span>
        <span className="text-gray-400">|</span>
        <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs flex items-center">{result.caseType}</span>
        <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs flex items-center">{result.judgmentType}</span>
      </div>
      <h3 className="font-bold text-lg mb-3 text-gray-900 leading-tight hover:text-blue-600">{result.title}</h3>
      <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">{result.content}</p>
    </div>
  )
}
