import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Layout } from '../components/ui/Layout';
import { Card } from '../components/ui/Card';
import { FileText, Mail, AlertCircle, Check, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { caseService } from '../api';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function Solution() {
  const navigate = useNavigate();
  const location = useLocation();
  const [caseId, setCaseId] = useState<number | null>(null);
  const [precedentsId, setPrecedentsId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [caseDetail, setCaseDetail] = useState<any>(null);

  useEffect(() => {
    const state = location.state as { caseId?: number; precedentsId?: string } | null;
    if (state?.caseId) {
      setCaseId(state.caseId);
    }
    if (state?.precedentsId) {
      setPrecedentsId(state.precedentsId);
    }
  }, [location]);

  // 사건 분석 결과 조회
  useEffect(() => {
    const fetchCaseDetail = async () => {
      if (caseId && precedentsId) {
        setIsLoading(true);
        try {
          const response = await caseService.getCaseDetail(precedentsId);
          if (response.status === 'success' && 'data' in response) {
            setCaseDetail(response.data);
          }
        } catch (error: any) {
          console.error('사건 분석 결과 조회 오류:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchCaseDetail();
  }, [caseId, precedentsId]);

  const estimatedAmount = caseDetail?.outcome_prediction?.estimated_compensation || '300만원 ~ 500만원';
  const averageAmount = '420만원';
  const timelineSteps = caseDetail?.action_roadmap?.map((step: { step?: number; title?: string; description?: string; action?: string }, index: number) => ({
    id: step.step || index + 1,
    label: step.title || `단계 ${index + 1}`,
    status: index === 0 ? 'current' : index === 1 ? 'next' : 'final',
    description: step.description || step.action || '',
  })) || [
    {
      id: 1,
      label: '합의 시도',
      status: 'current' as const,
      description: '합의 시도를 분석하니 이 사건은 합의의 촉진을 주로 한 해결이 가장 효과적입니다.'
    },
    {
      id: 2,
      label: '내용증명 발송',
      status: 'next' as const,
      description: '내용증명 발송을 잘 보관하시고, 가능하면 서면적으로 모든 내용을 기록합니다.'
    },
    {
      id: 3,
      label: '소송 진행',
      status: 'final' as const,
      description: '소송 진행 데이터를 확보하고, 유사 사례를 바탕으로 주장을 강화합니다.'
    }
  ];

  const handleDocumentSelect = (type: 'agreement' | 'notice' | 'complaint') => {
    switch (type) {
      case 'agreement':
        navigate('/document/agree', { state: { caseId } });
        break;
      case 'notice':
        navigate('/document/proof', { state: { caseId } });
        break;
      case 'complaint':
        navigate('/document/goso', { state: { caseId } });
        break;
      default:
        break;
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-6 py-12 md:py-16">
        {/* 분석 요약 섹션 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <Card className="p-6 bg-gray-50 border border-gray-200">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-8 h-8 rounded bg-gray-200 flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-gray-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">분석 요약</h2>
            </div>
            <p className="text-base text-gray-700 leading-relaxed">
              {isLoading ? (
                '분석 중...'
              ) : caseDetail ? (
                <>
                  귀하의 사건은 <span className="font-semibold">{caseDetail.legal_foundation?.logic || '[분석 중]'}</span> 유형에 속하며, 
                  예상 결과는 <span className="font-semibold">{caseDetail.outcome_prediction?.expected_result || '[분석 중]'}</span>입니다. 
                  이에 따른 예상 솔루션은 다음과 같습니다.
                </>
              ) : (
                '사건 정보를 불러오는 중입니다...'
              )}
            </p>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 items-stretch">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="h-full"
          >
            <Card className="p-6 bg-gray-50 border border-gray-200 relative h-full flex flex-col">
              {/* 배지 */}
              <div className="absolute top-4 right-4 flex items-center gap-2 bg-purple-600 text-white px-3 py-1.5 rounded-full text-xs font-medium z-10">
                <Check size={14} />
                <span>Data Analyzed</span>
              </div>
              
              {/* 1. 제목 영역 (높이 고정) */}
              <div className="mb-4">
                <h2 className="text-xl font-bold text-gray-900 text-center">예상 적정 합의금</h2>
              </div>
              
              {/* 2. 메인 콘텐츠 영역 (남은 공간 모두 차지하여 중앙 정렬) */}
              <div className="flex-1 flex flex-col justify-center items-center w-full">
                <div className="text-4xl md:text-5xl font-bold text-purple-600 mb-2">
                  {estimatedAmount}
                </div>
                <p className="text-sm text-gray-600 mb-6">
                  유사 사례 평균: {averageAmount}
                </p>
                <div className="h-40 w-full max-w-xs">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={[
                        { name: '200', value: 20 },
                        { name: '300', value: 60 },
                        { name: '400', value: 80 },
                        { name: '500', value: 60 },
                        { name: '600', value: 20 }
                      ]}
                      margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
                    >
                      <XAxis 
                        dataKey="name" 
                        tick={{ fontSize: 12 }} 
                        axisLine={false}
                        tickLine={false}
                        interval={0}
                      />
                      <YAxis hide />
                      <Bar 
                        dataKey="value" 
                        fill="#6D5AED" 
                        radius={[4, 4, 0, 0]}
                        barSize={32}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* 3. 하단 설명 텍스트 (맨 아래 고정) */}
              <div className="mt-4 pt-2 text-center">
                <p className="text-xs text-gray-500">예측 범위 (300~500)</p>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="h-full"
          >
            <Card className="p-6 bg-gray-50 border border-gray-200 relative h-full flex flex-col">
              {/* 배지 */}
              <div className="absolute top-4 right-4 flex items-center gap-2 bg-purple-600 text-white px-3 py-1.5 rounded-full text-xs font-medium z-10">
                <Check size={14} />
                <span>Data Analyzed</span>
              </div>
              <div className="mb-4">
                <h2 className="text-xl font-bold text-gray-900 text-center">재판 예상 결과</h2>
              </div>
              <div className="flex-1 flex flex-col justify-center items-center w-full">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
                  <div className="relative w-56 h-56 flex-shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: '벌금형', value: 70, color: '#6D5AED' },
                            { name: '집행유예', value: 20, color: '#9CA3AF' },
                            { name: '무죄', value: 5, color: '#D1D5DB' },
                            { name: '실형', value: 5, color: '#F3F4F6' }
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={70}
                          outerRadius={95}
                          startAngle={90}
                          endAngle={-270}
                          dataKey="value"
                        >
                          {[
                            { name: '벌금형', value: 70, color: '#6D5AED' },
                            { name: '집행유예', value: 20, color: '#9CA3AF' },
                            { name: '무죄', value: 5, color: '#D1D5DB' },
                            { name: '실형', value: 5, color: '#F3F4F6' }
                          ].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    {/* 가운데 텍스트 */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                      <div className="text-2xl font-bold text-purple-600">70%</div>
                      <div className="text-sm text-gray-600 whitespace-nowrap">벌금형 예상</div>
                    </div>
                  </div>
                  <div className="flex flex-col justify-center space-y-2 text-sm text-gray-700 min-w-[100px]">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded flex-shrink-0" style={{ backgroundColor: '#6D5AED' }}></div>
                      <span className="font-medium">벌금형 70%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded flex-shrink-0" style={{ backgroundColor: '#9CA3AF' }}></div>
                      <span>집행유예 20%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded flex-shrink-0" style={{ backgroundColor: '#D1D5DB' }}></div>
                      <span>무죄 5%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded flex-shrink-0" style={{ backgroundColor: '#F3F4F6' }}></div>
                      <span>실형 5%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. 하단 설명 텍스트 */}
              <div className="mt-4 pt-2 text-center">
                <p className="text-xs text-gray-500">유사 사건 분석 결과</p>
              </div>
            </Card>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8"
        >
          <Card className="p-8 bg-gray-50 border border-gray-200 relative">
            {/* Data Analyzed 배지 */}
            <div className="absolute top-4 right-4 flex items-center gap-2 bg-purple-600 text-white px-3 py-1.5 rounded-full text-xs font-medium z-10">
              <Check size={14} />
              <span>Data Analyzed</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">예상 소요 기간</h2>
            <div className="text-center mb-8">
              <div className="text-4xl md:text-5xl font-bold text-purple-600 mb-2">평균 4개월 소요</div>
            </div>
            <div className="mt-12">
              <div className="flex items-center justify-between mb-2 px-1">
                <span className="text-sm text-gray-500 font-medium">최단 2개월</span>
                <span className="text-sm text-gray-500 font-medium">최장 8개월</span>
              </div>
              
              <div className="relative h-16">
                {/* 1. 전체 타임라인 바 (회색 배경) */}
                <div className="absolute top-8 left-0 w-full h-3 bg-gray-200 rounded-full"></div>
                
                {/* 2. 평균 구간 (보라색, 2~4개월, 전체의 1/3) */}
                <div className="absolute top-8 left-[33.33%] w-[33.33%] h-3 bg-purple-600 rounded-full shadow-sm"></div>

                {/* 3. 상단 마커 그룹 (그래프 위쪽으로 이동됨) */}
                
                {/* [사건 발생] - 왼쪽 33% 지점 */}
                <div className="absolute left-[33.33%] top-8 transform -translate-x-1/2 -translate-y-full pb-2 flex flex-col items-center group">
                   {/* 텍스트 */}
                   <span className="text-xs text-gray-600 mb-1 whitespace-nowrap font-medium">[사건 발생]</span>
                   {/* 점선 (위에서 아래로) */}
                   <div className="h-4 w-px border-l border-dashed border-gray-400 group-hover:border-purple-400 transition-colors"></div>
                </div>

                {/* (평균 4개월) - 중앙 50% 지점 */}
                <div className="absolute left-1/2 top-8 transform -translate-x-1/2 -translate-y-full pb-0 flex flex-col items-center z-10">
                   {/* 텍스트 (강조) */}
                   <span className="text-xs font-bold text-purple-700 mb-1 whitespace-nowrap bg-purple-50 px-2 py-0.5 rounded border border-purple-100 shadow-sm">
                     평균 4개월
                   </span>
                   {/* 실선 (중앙은 강조를 위해 실선 사용) */}
                   <div className="h-6 w-0.5 bg-gray-800"></div>
                </div>

                {/* [예상 종결] - 오른쪽 66% 지점 */}
                <div className="absolute left-[66.66%] top-8 transform -translate-x-1/2 -translate-y-full pb-2 flex flex-col items-center group">
                   {/* 텍스트 */}
                   <span className="text-xs text-gray-600 mb-1 whitespace-nowrap font-medium">[예상 종결]</span>
                   {/* 점선 */}
                   <div className="h-4 w-px border-l border-dashed border-gray-400 group-hover:border-purple-400 transition-colors"></div>
                </div>

              </div>
            </div>
            
            <p className="text-sm text-gray-500 mt-2 text-center">
              유사 사례 분석 결과 (최단 2개월 ~ 최장 8개월)
            </p>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8"
        >
          <Card className="p-8 bg-gray-50 border border-gray-200">
            <div className="flex items-start gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-gray-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">문제 해결 방안</h2>
            </div>
            
            {/* 타임라인 */}
            <div className="flex items-start justify-between gap-4 md:gap-8 relative">
              {timelineSteps.map((step: { id: number; label: string; status: 'current' | 'next' | 'final'; description: string }, index: number) => (
                <div key={step.id} className="flex-1 flex flex-col items-center relative">
                  {/* 단계 레이블 */}
                  <div className="mb-2">
                    <span className="text-xs text-gray-500">
                      {step.status === 'current' && '[현재 단계]'}
                      {step.status === 'next' && '[다음 단계]'}
                      {step.status === 'final' && '[최종]'}
                    </span>
                  </div>
                  
                  {/* 단계 제목 */}
                  <h3 className="text-base font-bold text-gray-900 mb-3 text-center">
                    {step.label}
                  </h3>
                  
                  {/* 원형 인디케이터 */}
                  <div className="relative mb-4">
                    <div
                      className={`w-16 h-16 rounded-full flex items-center justify-center border-2 transition-all ${
                        step.status === 'current'
                          ? 'bg-purple-600 border-purple-600 shadow-lg shadow-purple-200'
                          : 'bg-white border-purple-600'
                      }`}
                    >
                      {step.status === 'current' && (
                        <Check size={24} className="text-white" />
                      )}
                    </div>
                  </div>
                  
                  {/* 설명 텍스트 */}
                  <p className="text-sm text-gray-700 leading-relaxed text-center">
                    {step.description}
                  </p>
                  
                  {/* 화살표 (마지막 단계 제외) */}
                  {index < timelineSteps.length - 1 && (
                    <div className="absolute left-full top-1/2 transform -translate-y-1/2 translate-x-2 hidden md:block z-10">
                      <ArrowRight className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* 문서 작성하기 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-8"
        >
          <Card className="p-8 bg-gray-50 border border-gray-200">
            <h2 className="text-lg font-bold text-gray-900 mb-2 text-center">
              문서 작성하기
            </h2>
            <p className="text-base text-gray-700 mb-8 text-center">
              상황에 맞는 문서를 선택하여 작성하세요
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center mb-4">
                  <FileText className="w-6 h-6 text-gray-700" />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-2">합의서</h3>
                <p className="text-sm text-gray-700 leading-relaxed mb-4">
                  상대방과 합의할 때 사용하는 문서입니다. 합의 내용과 조건을 명확히 기록합니다.
                </p>
                <button
                  onClick={() => handleDocumentSelect('agreement')}
                  className="w-full bg-purple-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
                >
                  작성 시작하기
                </button>
              </div>

              {/* 내용증명서 */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center mb-4">
                  <Mail className="w-6 h-6 text-gray-700" />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-2">내용증명서</h3>
                <p className="text-sm text-gray-700 leading-relaxed mb-4">
                  상대방에게 법적 내용을 공식적으로 전달할 때 사용합니다. 법적 효력이 있습니다.
                </p>
                <button
                  onClick={() => handleDocumentSelect('notice')}
                  className="w-full bg-purple-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
                >
                  작성 시작하기
                </button>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center mb-4">
                  <AlertCircle className="w-6 h-6 text-gray-700" />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-2">고소장</h3>
                <p className="text-sm text-gray-700 leading-relaxed mb-4">
                  법적 절차를 진행하기 위해 작성하는 공식 문서입니다. 신중하게 작성해야 합니다.
                </p>
                <button
                  onClick={() => handleDocumentSelect('complaint')}
                  className="w-full bg-purple-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
                >
                  작성 시작하기
                </button>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center text-sm text-gray-600"
        >
          <p>
            본 결과는 법적 효력이 없는 참고용 시뮬레이션 결과입니다. 법적 효력이 필요한 경우 변호사와 상담하시기 바랍니다.
          </p>
        </motion.div>
      </div>
    </Layout>
  );
}