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
    // w-72로 폭을 살짝 넓히고 왼쪽 마진(ml-6)을 주어 전체적으로 오른쪽으로 밀었습니다.
    <div className="hidden xl:block w-72 flex-shrink-0 order-1 md:order-2 ml-2">
      <div className="sticky top-24 space-y-6 bg-white p-6 rounded-2xl shadow-sm border border-gray-50">
        
        {/* 1. 사건종류 필터 */}
        <div className="pl-2"> {/* 텍스트를 좀 더 오른쪽으로 밀기 위한 내부 패딩 */}
          <h3 className="font-bold text-gray-800 mb-4 flex justify-between items-center">
            사건종류
            {selectedCaseTypes.length > 0 && (
              <button 
                onClick={() => onCaseTypeChange('')}
                className="text-xs text-blue-500 hover:text-blue-700 font-medium underline underline-offset-2"
              >
                초기화
              </button>
            )}
          </h3>
          <div className="space-y-2.5">
            {CASE_TYPES.map((type) => (
              <label key={type} className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={selectedCaseTypes.includes(type)}
                  onChange={() => onCaseTypeChange(type)}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 border-gray-300 transition-all"
                />
                <span className="text-sm text-gray-600 group-hover:text-blue-600 transition-colors">{type}</span>
              </label>
            ))}
          </div>
        </div>

        <hr className="border-gray-100" />

        {/* 2. 법원 필터 */}
        <div className="pl-2">
          <h3 className="font-bold text-gray-800 mb-4 flex justify-between items-center">
            법원
            {selectedCourts.length > 0 && (
              <button 
                onClick={() => onCourtChange('')}
                className="text-xs text-blue-500 hover:text-blue-700 font-medium underline underline-offset-2"
              >
                초기화
              </button>
            )}
          </h3>
          <div className="space-y-2.5">
            {COURT_TYPES.map((court) => (
              <label key={court} className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={selectedCourts.includes(court)}
                  onChange={() => onCourtChange(court)}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 border-gray-300 transition-all"
                />
                <span className="text-sm text-gray-600 group-hover:text-blue-600 transition-colors">{court}</span>
              </label>
            ))}
          </div>
        </div>

        <hr className="border-gray-100" />

        {/* 3. 재판유형 필터 */}
        <div className="pl-2">
          <h3 className="font-bold text-gray-800 mb-4">재판유형</h3>
          <div className="space-y-2.5">
            {JUDGMENT_TYPES.map((type) => (
              <label key={type} className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="radio"
                  name="judgmentType"
                  checked={selectedJudgmentType === type}
                  onChange={() => onJudgmentTypeChange(type)}
                  className="text-blue-600 focus:ring-blue-500 w-4 h-4 border-gray-300 transition-all"
                />
                <span className="text-sm text-gray-600 group-hover:text-blue-600 transition-colors">{type}</span>
              </label>
            ))}
          </div>
        </div>

        <hr className="border-gray-100" />

        {/* 4. 기간 필터 */}
        <div className="pl-2">
          <h3 className="font-bold text-gray-800 mb-4">기간</h3>
          <div className="space-y-2.5">
            {PERIOD_TYPES.map((period) => (
              <label key={period} className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="radio"
                  name="period"
                  checked={selectedPeriod === period}
                  onChange={() => onPeriodChange(period)}
                  className="text-blue-600 focus:ring-blue-500 w-4 h-4 border-gray-300 transition-all"
                />
                <span className="text-sm text-gray-600 group-hover:text-blue-600 transition-colors">{period}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}