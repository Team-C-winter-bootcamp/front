import { useState, useEffect } from 'react';
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Layout } from '../components/ui/Layout';
import { Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { caseService } from '../api';

type Step = {
  id: number;
  label: string;
  question: string;
  options: string[];
};

const steps: Step[] = [
  {
    id: 1,
    label: '피해자 여부',
    question: '1. 현 상황에서 귀하의 역할을 알려주실 수 있나요?',
    options: ['저는 피해자/청구인입니다.', '저는 피의자입니다.', '저는 증인입니다.', '기타']
  },
  {
    id: 2,
    label: '보험여부',
    question: '2. 겪고있는 사건과 연관된 보험을 가지고 있나요?',
    options: ['네, 저에게 보험이 있습니다.', '상대방에게 보험이 있습니다.', '나와 상대방 모두 보험이 있습니다.', '잘모르겠습니다.']
  },
  {
    id: 3,
    label: '부상여부',
    question: '3. 사건 중에 신체적 부상을 입은 사람이 있나요?',
    options: ['네, 심각한 부상입니다.', '네, 경미한 부상입니다.', '부상이 없습니다.', '해당 없음']
  },
  {
    id: 4,
    label: '증거여부',
    question: '4. 지금 사용 가능한 문서화된 증거(사진, 이메일, 경찰 보고서)가 있나요?',
    options: ['네, 강력한 증거가 있습니다.', '일부 증거가 있습니다.', '서면 증거가 없습니다.', '나중에 가져올 수 있습니다.']
  },
  {
    id: 5,
    label: '세부사항',
    question: '5. 내용을 공유해 주셔서 감사합니다. 이제 상황에 대해 자세히 설명해 주시겠어요?',
    options: []
  }
];

export function CaseCreation() {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [detailText, setDetailText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [category, setCategory] = useState('기타');

  useEffect(() => {
    if (location.state?.category) {
      setCategory(location.state.category);
    }
  }, [location.state]);

  const handleOptionClick = (option: string) => {
    setSelectedOptions((prev) => [...prev, option]);
    
    if (currentStep < steps.length - 1) {
      setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
      }, 300);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      setSelectedOptions((prev) => prev.slice(0, -1));
      if (currentStep === steps.length - 1) {
        setDetailText('');
      }
    }
  };

  const handleNext = async () => {
    // 마지막 단계에서 15자 이상 작성했을 때만 API 호출
    if (currentStep === steps.length - 1 && detailText.trim().length >= 15) {
      setIsLoading(true);
      try {
        /**
         * [데이터 매핑 로직]
         * 껍데기(situation) 없이 백엔드 필드에 직접 매핑합니다.
         */
        const requestData = {
          category: category,
          who: selectedOptions[0] || '미지정', // 1번 질문: 역할
          when: '사건 발생일 및 상세 내용 참조', // UI에 시기 질문이 없으므로 고정 문구
          what: `${selectedOptions[1]} / ${selectedOptions[2]}`, // 2, 3번 질문: 보험 및 부상 여부 조합
          want: '유사 판례 검색 및 법률 조언 요청', // 검색 목적 고정
          detail: `[증거 상황: ${selectedOptions[3]}]\n\n${detailText.trim()}` // 4번 질문 + 사용자의 상세 서술
        };

        // API 호출 (백엔드 Serializer가 바로 읽을 수 있는 평탄한 구조)
        const response = await caseService.createCase(requestData);

        if (response.status === 'success' && response.data.results) {
          const caseId = response.data.case_id || 1;

          navigate('/search', { 
            state: { 
              results: response.data.results, 
              totalCount: response.data.total_count,
              caseId: caseId,
            } 
          });
        } else {
          alert('사건 등록에 실패했습니다. 다시 시도해주세요.');
        }
      } catch (error: any) {
        console.error('사건 등록 오류:', error);
        let errorMessage = '사건 등록 중 오류가 발생했습니다.';
        if (error?.response?.data?.message) {
          errorMessage = error.response.data.message;
        }
        alert(errorMessage);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const isNextDisabled = currentStep === steps.length - 1 && detailText.trim().length < 15;

  return (
    <Layout>
      <div className="min-h-screen bg-white flex flex-col">
        {/* Step Indicator */}
        <div className="bg-white border-b border-gray-200 py-8">
          <div className="max-w-4xl mx-auto px-6">
            <div className="flex items-center w-full">
              {steps.map((step, index) => {
                const isCompleted = index < currentStep;
                const isActive = index === currentStep;

                return (
                  <React.Fragment key={step.id}>
                    <div className="flex flex-col items-center flex-1">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                          isCompleted
                            ? 'bg-[#6D5AED] border-[#6D5AED] text-white'
                            : isActive
                            ? 'bg-white border-[#6D5AED] text-[#6D5AED]'
                            : 'bg-white border-gray-300 text-gray-400'
                        }`}
                      >
                        {isCompleted ? <Check size={20} /> : <span>{step.id}</span>}
                      </div>
                      <span className={`text-sm mt-2 font-medium ${isActive || isCompleted ? 'text-gray-900' : 'text-gray-500'}`}>
                        {step.label}
                      </span>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`flex-1 h-0.5 mx-2 ${isCompleted ? 'bg-[#6D5AED]' : 'bg-gray-300'}`} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full px-6 py-10">
          <div className="bg-[#F0F4F8] rounded-2xl p-10 flex flex-col min-h-[400px] shadow-sm">
            {currentStep === 0 && (
              <div className="mb-8">
                <p className="text-xl font-bold text-gray-800 leading-relaxed">
                  현재 겪고 계신 일에 대한 상황 파악을 위한 체크리스트입니다.<br />
                  입력하신 정보는 철저히 비밀이 보장되니, 상황에 맞는 버튼을 선택해 주세요.
                </p>
              </div>
            )}

            <div className="mb-8">
              <p className="text-2xl text-gray-900 font-bold">{steps[currentStep].question}</p>
            </div>

            {currentStep < steps.length - 1 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {steps[currentStep].options.map((option, idx) => (
                  <motion.button
                    key={idx}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleOptionClick(option)}
                    className="p-6 text-left text-lg font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:border-[#6D5AED] hover:bg-purple-50 hover:text-[#6D5AED] transition-all shadow-sm"
                  >
                    {option}
                  </motion.button>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <textarea
                  value={detailText}
                  onChange={(e) => setDetailText(e.target.value)}
                  placeholder="상황에 대해 자세히 설명해 주세요. (15자 이상)"
                  className="w-full px-4 py-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#6D5AED] focus:outline-none min-h-[200px] resize-none text-lg"
                />
                {detailText.length > 0 && detailText.length < 15 && (
                  <p className="text-sm text-red-500 font-medium">최소 15자 이상 작성해주세요. (현재 {detailText.length}자)</p>
                )}
                  {/* 예시 글 */}
               <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                 <p className="text-sm font-semibold text-gray-700 mb-2">작성 예시 (교통사고 상황):</p>
                  <div className="text-sm text-gray-600 leading-relaxed font-normal whitespace-pre-line">
                    {`2024년 1월 15일 오후 2시경, 강남역 사거리 인근에서 신호 대기를 위해 정차하고 있었습니다. 정차 후 약 10초 뒤, 후방에서 오던 승용차가 제 차의 범퍼를 강하게 들이받았습니다.
                  가해 차량 운전자는 사고 직후 차에서 내려 사과를 했으나, 현장에서 보험 접수를 미루며 개인 합의를 요구했습니다. 하지만 차량 뒷범퍼 파손이 심하고, 사고 충격으로 인해 현재 목과 허리에 통증이 있어 병원 치료가 필요한 상황입니다.
                  현장 사진과 블랙박스 영상은 모두 확보해 두었으며, 상대방의 과실 100%라고 생각되지만 상대방이 말을 바꾸고 있어 법적 대응을 준비하려 합니다.`}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
            <span className="text-lg text-[#6D5AED] font-semibold">Step {currentStep + 1} / {steps.length}</span>
            <div className="flex gap-4">
              <button
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className={`px-8 py-3 rounded-xl text-lg font-medium transition-all ${
                  currentStep === 0 ? 'bg-gray-100 text-gray-400' : 'bg-[#D3DDF4] text-[#6D5AED] hover:bg-[#C4D0EB]'
                }`}
              >
                Previous
              </button>
              {currentStep === steps.length - 1 && (
                <button
                  onClick={handleNext}
                  disabled={isNextDisabled || isLoading}
                  className={`px-10 py-3 rounded-xl text-lg font-medium text-white transition-all ${
                    isNextDisabled || isLoading ? 'bg-gray-300' : 'bg-[#6D5AED] hover:bg-[#5D4AD9]'
                  }`}
                >
                  {isLoading ? '검색 중...' : 'Next'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}