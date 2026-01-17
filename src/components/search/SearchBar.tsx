import Search from '../../assets/Search.png'

interface SearchBarProps {
  searchInput: string
  setSearchInput: (value: string) => void
  onSearch: (e: React.FormEvent) => void
  onClear: () => void
}

export const SearchBar = ({ searchInput, setSearchInput, onSearch, onClear }: SearchBarProps) => {
  return (
    <div className="w-full">
      <form onSubmit={onSearch} className="w-full">
        <div className="relative w-full">
          
          {/* 검색 아이콘: 위치를 조금 더 안쪽으로 당김 */}
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 flex items-center justify-center pointer-events-none">
            <img 
              src={Search} 
              alt="search" 
              className="w-5 h-5 object-contain opacity-50" 
            />
          </div>

          {/* Input 필드 */}
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="키워드를 입력하세요"
            className="w-full pl-12 pr-10 py-3 border border-[#CFB982] rounded-full focus:outline-none focus:ring-1 focus:ring-[#CFB982] focus:border-[#CFB982] bg-[#F5F3EB] text-base shadow-minimal transition-all placeholder-minimal-medium-gray text-minimal-charcoal font-light"
          />

          {/* 초기화 버튼 */}
          {searchInput && (
            <button
              type="button"
              onClick={onClear}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-minimal-medium-gray hover:text-minimal-charcoal transition-colors p-1"
            >
              ✕
            </button>
          )}
        </div>
      </form>
    </div>
  )
}