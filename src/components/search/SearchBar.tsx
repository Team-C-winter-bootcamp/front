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

          {/* Input 필드: 패딩과 글자 크기를 줄임 */}
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="키워드를 입력하세요"
            // pl-12: 아이콘 공간, py-2.5: 높이 축소, text-base: 글자 크기 축소
            // border-2 -> border (테두리 두께 감소)
            className="w-full pl-12 pr-10 py-2.5 border border-blue-500 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-100 bg-white text-base shadow-sm transition-all placeholder-gray-400 text-gray-800"
          />

          {/* 초기화 버튼 */}
          {searchInput && (
            <button
              type="button"
              onClick={onClear}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
            >
              ✕ 
            </button>
          )}
        </div>
      </form>
    </div>
  )
}