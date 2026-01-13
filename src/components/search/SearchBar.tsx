import { useNavigate } from 'react-router-dom'

interface SearchBarProps {
  searchInput: string
  setSearchInput: (value: string) => void
  onSearch: (e: React.FormEvent) => void
  onClear: () => void
}

export const SearchBar = ({ searchInput, setSearchInput, onSearch, onClear }: SearchBarProps) => {
  const navigate = useNavigate()

  return (
    <div className="px-4 md:px-6 py-4 border-b sticky top-0 bg-white z-10">
      <div className="flex items-center gap-2 md:gap-4">
        <button onClick={() => navigate('/')} className="text-lg p-2">
          ←
        </button>
        <form onSubmit={onSearch} className="flex-1 max-w-2xl">
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2">🔍</span>
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
