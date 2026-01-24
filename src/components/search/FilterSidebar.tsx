interface FilterSidebarProps {
  selectedCaseTypes: string[];
  selectedCourts: string[];
  selectedJudgmentType: string;
  selectedPeriod: string;
  onCaseTypeChange: (type: string) => void;
  onCourtChange: (court: string) => void;
  onJudgmentTypeChange: (type: string) => void;
  onPeriodChange: (period: string) => void;
}

export function FilterSidebar({
  selectedCaseTypes,
  selectedCourts,
  selectedJudgmentType,
  selectedPeriod,
  onCaseTypeChange,
  onCourtChange,
  onJudgmentTypeChange,
  onPeriodChange
}: FilterSidebarProps) {
  const CASE_TYPES = ['민사', '형사', '행정', '가사', '특허', '선거'];
  const COURT_TYPES = ['대법원', '고등/특허/고등법원', '지방법원', '행정/가정/회생/군사법원', '헌법재판소'];
  const JUDGMENT_TYPES = ['전체', '판결', '결정', '명령'];
  const PERIOD_TYPES = ['전체 기간', '최근 1년', '최근 3년', '최근 5년'];

  return (
    <div className="bg-white rounded-xl shadow-xl border border-slate-200 p-6 space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-3">사건종류</h3>
        <div className="flex flex-wrap gap-2">
          {CASE_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => onCaseTypeChange(type)}
              className={`px-3 py-1.5 text-sm rounded-full transition-all ${
                selectedCaseTypes.includes(type)
                  ? 'bg-indigo-600 text-white font-medium shadow-lg'
                  : 'bg-white text-slate-700 hover:bg-slate-50 font-light border border-slate-200'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-3">법원</h3>
        <div className="space-y-2">
          {COURT_TYPES.map((court) => (
            <label key={court} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedCourts.includes(court)}
                onChange={() => onCourtChange(court)}
                className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
              />
              <span className="text-sm text-slate-700 font-light">{court}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-3">재판유형</h3>
        <div className="space-y-2">
          {JUDGMENT_TYPES.map((type) => (
            <label key={type} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="judgmentType"
                checked={selectedJudgmentType === type}
                onChange={() => onJudgmentTypeChange(type)}
                className="w-4 h-4 text-indigo-600 border-slate-300 focus:ring-indigo-500"
              />
              <span className="text-sm text-slate-700 font-light">{type}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-3">기간</h3>
        <div className="space-y-2">
          {PERIOD_TYPES.map((period) => (
            <label key={period} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="period"
                checked={selectedPeriod === period}
                onChange={() => onPeriodChange(period)}
                className="w-4 h-4 text-indigo-600 border-slate-300 focus:ring-indigo-500"
              />
              <span className="text-sm text-slate-700 font-light">{period}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
