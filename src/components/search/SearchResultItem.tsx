import { SearchResult } from '../../pages/SearchResultsPage'

interface SearchResultItemProps {
  result: SearchResult
  onClick: (id: number) => void
}

export const SearchResultItem = ({ result, onClick }: SearchResultItemProps) => {
  return (
    <div
      onClick={() => onClick(result.id)}
      className="card-minimal p-5 hover:shadow-minimal-md hover:border-minimal-charcoal cursor-pointer transition-all duration-200"
    >
      <div className="flex gap-2 mb-2 text-sm">
        <span className="text-minimal-dark-gray font-light">{result.court}</span>
        <span className="text-minimal-medium-gray">|</span>
        <span className="text-minimal-dark-gray font-light">{result.date}</span>
        <span className="text-minimal-medium-gray">|</span> 
        <span className="bg-[#F5F3EB] border border-[#CFB982] text-minimal-dark-gray px-2 py-0.5 rounded-minimal text-xs flex items-center font-light">{result.caseType}</span>
        <span className="bg-[#F5F3EB] border border-[#CFB982] text-minimal-dark-gray px-2 py-0.5 rounded-minimal text-xs flex items-center font-light">{result.judgmentType}</span>
      </div>
      <h3 className="font-medium text-lg mb-3 text-minimal-charcoal leading-tight hover:text-minimal-dark-gray transition-colors">{result.title}</h3>
      <p className="text-minimal-dark-gray text-sm line-clamp-2 leading-relaxed font-light">{result.content}</p>
    </div>
  )
}
