import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Layout } from '../components/ui/Layout';
import { Card } from '../components/ui/Card';
import { FileText, Mail, AlertCircle, Check, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { caseService } from '../api';

export function Solution() {
  const navigate = useNavigate();
  const location = useLocation();
  const [caseId, setCaseId] = useState<number | null>(null);
  const [precedentsId, setPrecedentsId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [caseDetail, setCaseDetail] = useState<any>(null);

  // location state에서 caseId와 precedentsId 가져오기
  useEffect(() => {
    const state = location.state as { caseId?: number; precedentsId?: number } | null;
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
          const response = await caseService.getCaseDetail(caseId, precedentsId);
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

  // 예상 합의금 (API 응답에서 가져오거나 기본값)
  const estimatedAmount = caseDetail?.outcome_prediction?.estimated_compensation || '300만원 ~ 500만원';
  const averageAmount = '420만원';

  // 타임라인 단계 (API 응답에서 가져오거나 기본값)
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

        {/* 예상 합의금 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <Card className="p-8 bg-gray-50 border border-gray-200 relative">
            {/* Data Analyzed 배지 */}
            <div className="absolute top-4 right-4 flex items-center gap-2 bg-purple-600 text-white px-3 py-1.5 rounded-full text-xs font-medium">
              <Check size={14} />
              <span>Data Analyzed</span>
            </div>
            
            <div className="text-center">
              <h2 className="text-lg font-bold text-gray-900 mb-4">예상 합의금</h2>
              <div className="text-4xl md:text-5xl font-bold text-purple-600 mb-2">
                {estimatedAmount}
              </div>
              <p className="text-sm text-gray-600 mt-2">
                유사 사례 평균: {averageAmount}
              </p>
            </div>
          </Card>
        </motion.div>

        {/* 문제 해결 방안 - 타임라인 UI */}
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
              <h2 className="text-lg font-bold text-gray-900">① 문제 해결 방안</h2>
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
              {/* 합의서 */}
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

              {/* 고소장 */}
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

        {/* 면책 조항 */}
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
