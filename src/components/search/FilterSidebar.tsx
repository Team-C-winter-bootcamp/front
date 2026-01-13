const CASE_TYPES = ['민사', '형사', '행정', '가사', '특허', '선거']
const COURT_TYPES = ['대법원', '고등/특허/고등법원', '지방법원', '행정/가정/회생/군사법원', '헌법재판소']
const JUDGMENT_TYPES = ['전체', '판결', '결정', '명령']
const PERIOD_TYPES = ['전체 기간', '최근 1년', '최근 3년', '최근 5년']

interface FilterSidebarProps {
  selectedCaseTypes: string[]
  selectedCourts: string[]
  selectedJudgmentType: string
  selectedPeriod: string
  onCaseTypeChange: (type: string) => void
  onCourtChange: (court: string) => void
  onJudgmentTypeChange: (type: string) => void
  onPeriodChange: (period: string) => void
}

export const FilterSidebar = ({
  selectedCaseTypes,
  selectedCourts,
  selectedJudgmentType,
  selectedPeriod,
  onCaseTypeChange,
  onCourtChange,
  onJudgmentTypeChange,
  onPeriodChange
}: FilterSidebarProps) => {
  return (
    <div className="hidden md:block w-64 flex-shrink-0 order-1 md:order-2">
      <div className="sticky top-24 space-y-8">
        {/* 1. 사건종류 필터 */}
        <div>
          <h3 className="font-bold mb-3 flex justify-between items-center">
            사건종류
            {selectedCaseTypes.length > 0 && (
              <button 
                onClick={() => onCaseTypeChange('')}
                className="text-xs text-gray-400 hover:text-blue-600 underline"
              >
                초기화
              </button>
            )}
          </h3>
          <div className="space-y-2">
            {CASE_TYPES.map((type) => (
              <label key={type} className="flex items-center gap-2 cursor-pointer hover:text-blue-600">
                <input
                  type="checkbox"
                  checked={selectedCaseTypes.includes(type)}
                  onChange={() => onCaseTypeChange(type)}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <span className="text-sm text-gray-700">{type}</span>
              </label>
            ))}
          </div>
        </div>

        <hr className="border-gray-100" />

        {/* 2. 법원 필터 */}
        <div>
          <h3 className="font-bold mb-3 flex justify-between items-center">
            법원
            {selectedCourts.length > 0 && (
              <button 
                onClick={() => onCourtChange('')}
                className="text-xs text-gray-400 hover:text-blue-600 underline"
              >
                초기화
              </button>
            )}
          </h3>
          <div className="space-y-2">
            {COURT_TYPES.map((court) => (
              <label key={court} className="flex items-center gap-2 cursor-pointer hover:text-blue-600">
                <input
                  type="checkbox"
                  checked={selectedCourts.includes(court)}
                  onChange={() => onCourtChange(court)}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <span className="text-sm text-gray-700">{court}</span>
              </label>
            ))}
          </div>
        </div>

        <hr className="border-gray-100" />

        {/* 3. 재판유형 필터 */}
        <div>
          <h3 className="font-bold mb-3">재판유형</h3>
          <div className="space-y-2">
            {JUDGMENT_TYPES.map((type) => (
              <label key={type} className="flex items-center gap-2 cursor-pointer hover:text-blue-600">
                <input
                  type="radio"
                  name="judgmentType"
                  checked={selectedJudgmentType === type}
                  onChange={() => onJudgmentTypeChange(type)}
                  className="text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <span className="text-sm text-gray-700">{type}</span>
              </label>
            ))}
          </div>
        </div>

        <hr className="border-gray-100" />

        {/* 4. 기간 필터 */}
        <div>
          <h3 className="font-bold mb-3">기간</h3>
          <div className="space-y-2">
            {PERIOD_TYPES.map((period) => (
              <label key={period} className="flex items-center gap-2 cursor-pointer hover:text-blue-600">
                <input
                  type="radio"
                  name="period"
                  checked={selectedPeriod === period}
                  onChange={() => onPeriodChange(period)}
                  className="text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <span className="text-sm text-gray-700">{period}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
