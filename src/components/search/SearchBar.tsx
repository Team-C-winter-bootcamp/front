import Search from '../../assets/Search.png'

interface SearchBarProps {
  searchInput: string
  setSearchInput: (value: string) => void
  onSearch: (e: React.FormEvent) => void
  onClear: () => void
}

export const SearchBar = ({ searchInput, setSearchInput, onSearch, onClear }: SearchBarProps) => {


  return (
    <div className="px-4 md:px-6 py-4 border-b sticky top-0 bg-white z-10">
      <div className="pl-16 flex items-center gap-2 md:gap-4">
        
        <form onSubmit={onSearch} className="flex-1 max-w-2xl">
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <div className="inline-block p-1 rounded-full ">
                    <img 
                    src={Search} 
                    alt="search" 
                    className="w-5 h-5 object-contain justify-center items-center pt-1 opacity-60" 
                    />
            </div>
          </span>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="키워드를 입력하세요"
              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
            />
            {searchInput && (
              <button
                type="button"
                onClick={onClear}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-black"
              >
                ✕
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
