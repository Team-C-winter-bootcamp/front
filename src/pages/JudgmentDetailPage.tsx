import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useStore } from '../store/useStore'
import Header from '../components/Header'

const JudgmentDetailPage = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const { isAuthenticated } = useStore()
  const [activeTab, setActiveTab] = useState<'order' | 'reason'>('order')

  // 실제로는 API에서 판결문 데이터를 가져옴
  const judgmentData = {
    id: id || '1',
    title: '제주지방법원 2014. 6. 26. 선고 2014고합35 판결 폭행치사, 폭행, 폭력행위등처벌에관한법률위반(집단·흉기등폭행)',
    summary: '원고항소기각',
    aiSummary: {
      title: '조직폭력수용자 지정처분 취소 항소 기각',
      resultSummary: [
        '원고의 조직폭력수용자 지정처분 취소 항소를 기각함.',
        '항소 비용은 원고가 부담함.'
      ],
      facts: [
        '원고는 서울구치소장으로부터 조직폭력수용자로 지정됨.',
        '원고는 B에 대한 판결에 자신이 공법으로 명시되지 않았고, 특정경제범죄가중처벌등에관한법률위반(횡령)최 부분의 기재만으로는 조직폭력사범으로 볼 수 없으며, 공갈 부분 무죄 확정으로 지정 사유가 해소되었다고 주장함.',
        '원고는 또한 형집행법 시행규칙 제198조의 "조직폭력사범"은 당해 범죄 실행 당시 폭력조직에 가담 중인 경우로 제한 해석되어야 하고, 피고가 실제 가담 여부를 확인하지 않아 위법하다고 주장함.'
      ]
    },
    judgment: {
      court: '광주고등법원 전주제1-2행정부 판결',
      case: '(전주)2020누1778 조직폭력수용자 지정해제 거부처분 취소',
      plaintiff: 'A',
      defendant: '전주교도소장',
      firstInstance: '전주지방법원 2020. 10. 15. 선고 2020구항1411 판결',
      conclusionDate: '2021. 2. 24.',
      judgmentDate: '2021. 3. 24.',
      order: [
        '1. 원고의 항소를 기각한다.',
        '2. 항소비용은 원고가 부담한다.'
      ],
      claim: '제1심판결을 취소한다. 서울구치소장이 2018. 5. 31. 원고에 대하여 한 조직폭력수용자 지정해제 거부처분을 취소한다.',
      reasons: '이 법원이 이 부분에 관하여 기재할 이유는, 제1심판결 제36 제2항과 사이에 가위 등처벌에관한법률위반(공동상해)... 이후 내용 계속 나오면 되는 부분'
    },
    relatedCases: [
      '제주지방법원 2014. 6. 26. 선고 2014고합35 판결 폭행치사, 폭행, 폭력행위등처벌에관한법률위반(집단·흉기등폭행)',
      '광주고등법원 (제주) 2014. 9. 17. 선고 2014노76 판결 폭행치사, 폭행'
    ]
  }

  if (!isAuthenticated) {
    navigate('/')
    return null
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Search Bar */}
      <div className="px-4 md:px-6 py-4 border-b">
        <div className="flex items-center gap-2 md:gap-4">
          <button onClick={() => navigate('/search')} className="text-lg">
            ←
          </button>
          <div className="flex-1 max-w-2xl relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2">🔍</span>
            <input
              type="text"
              placeholder="키워드를 입력하세요"
              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-black">
              ✕
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6">
        {/* Title Section */}
        <div className="mb-6">
          <div className="text-sm text-gray-500 mb-2">{judgmentData.summary}</div>
          <h1 className="text-2xl md:text-3xl font-bold mb-4">{judgmentData.title}</h1>
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-gray-100 rounded">⬇️</button>
            <button className="p-2 hover:bg-gray-100 rounded">🔗</button>
            <button className="p-2 hover:bg-gray-100 rounded">⭐</button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 border-b mb-6">
          <button
            onClick={() => setActiveTab('order')}
            className={`pb-2 px-2 ${
              activeTab === 'order'
                ? 'border-b-2 border-blue-600 font-semibold'
                : 'text-gray-500'
            }`}
          >
            주문
          </button>
          <button
            onClick={() => setActiveTab('reason')}
            className={`pb-2 px-2 ${
              activeTab === 'reason'
                ? 'border-b-2 border-blue-600 font-semibold'
                : 'text-gray-500'
            }`}
          >
            판결이유
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* AI Summary */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold">AI 요약</h2>
                <div className="flex gap-2">
                  <button className="text-gray-500 hover:text-gray-700">ℹ️</button>
                  <button className="text-gray-500 hover:text-gray-700">👁️</button>
                </div>
              </div>
              <h3 className="text-lg font-semibold mb-4">{judgmentData.aiSummary.title}</h3>
              
              <div className="mb-4">
                <h4 className="font-semibold mb-2">결과 요약</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  {judgmentData.aiSummary.resultSummary.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">사실관계</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  {judgmentData.aiSummary.facts.map((fact, idx) => (
                    <li key={idx}>{fact}</li>
                  ))}
                </ul>
              </div>

              <button className="mt-4 text-blue-600 hover:text-blue-800 flex items-center gap-1">
                더보기 <span>▼</span>
              </button>
            </div>

            {/* Judgment Details */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold">{judgmentData.judgment.court}</h2>
              
              <div className="space-y-2 text-sm">
                <div><span className="font-semibold">사건:</span> {judgmentData.judgment.case}</div>
                <div><span className="font-semibold">원고, 항소인:</span> {judgmentData.judgment.plaintiff}</div>
                <div><span className="font-semibold">피고, 피항소인:</span> {judgmentData.judgment.defendant}</div>
                <div><span className="font-semibold">제1심판결:</span> {judgmentData.judgment.firstInstance}</div>
                <div><span className="font-semibold">변론종결:</span> {judgmentData.judgment.conclusionDate}</div>
                <div><span className="font-semibold">판결선고:</span> {judgmentData.judgment.judgmentDate}</div>
              </div>

              {activeTab === 'order' && (
                <div>
                  <h3 className="font-semibold mb-2">주문</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {judgmentData.judgment.order.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {activeTab === 'reason' && (
                <div>
                  <h3 className="font-semibold mb-2">청구취지 및 항소취지</h3>
                  <p className="mb-4">{judgmentData.judgment.claim}</p>
                  
                  <h3 className="font-semibold mb-2">이유</h3>
                  <div className="space-y-2">
                    <h4 className="font-semibold">1. 처분의 경위</h4>
                    <p>{judgmentData.judgment.reasons}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-3">상하급심 판례</h3>
              <div className="space-y-2">
                {judgmentData.relatedCases.map((case_, idx) => (
                  <div key={idx} className="p-3 bg-gray-50 rounded-lg text-sm hover:bg-gray-100 cursor-pointer">
                    {case_}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold">AI 유사판례</h3>
                <button className="text-gray-500 hover:text-gray-700">ℹ️</button>
              </div>
              <div className="space-y-2">
                {judgmentData.relatedCases.map((case_, idx) => (
                  <div key={idx} className="p-3 bg-gray-50 rounded-lg text-sm hover:bg-gray-100 cursor-pointer">
                    {case_}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default JudgmentDetailPage
