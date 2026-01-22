import { useState } from 'react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/ui/Layout';
import { Check } from 'lucide-react';
import { motion } from 'framer-motion';

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
    question: '옵션을 이해하는 데 도움을 드릴 수 있습니다. 먼저 이 상황에서 귀하의 역할을 알려주실 수 있나요?',
    options: [
      '저는 피해자/청구인입니다',
      '저는 피의자입니다',
      '저는 증인입니다',
      '기타'
    ]
  },
  {
    id: 2,
    label: '보험여부',
    question: '감사합니다. 최선의 안내를 위해 다음을 알려주세요: 이 사건을 보장할 수 있는 보험 정책이 있나요?',
    options: [
      '네, 저에게 보험이 있습니다',
      '상대방에게 보험이 있습니다',
      '보험이 관련되지 않았습니다',
      '확실하지 않습니다'
    ]
  },
  {
    id: 3,
    label: '부상여부',
    question: '알겠습니다. 사건 중에 신체적 부상을 입은 사람이 있나요?',
    options: [
      '네, 심각한 부상입니다',
      '네, 경미한 부상입니다',
      '부상이 없습니다',
      '해당 없음'
    ]
  },
  {
    id: 4,
    label: '증거여부',
    question: '알겠습니다. 지금 사용 가능한 문서화된 증거(사진, 이메일, 경찰 보고서)가 있나요?',
    options: [
      '네, 강력한 증거가 있습니다',
      '일부 증거가 있습니다',
      '서면 증거가 없습니다',
      '나중에 가져올 수 있습니다'
    ]
  },
  {
    id: 5,
    label: '세부사항 작성',
    question: '세부사항을 공유해 주셔서 감사합니다. 이제 상황에 대해 자세히 설명해 주시겠어요?',
    options: []
  }
];

export function CaseCreation() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [detailText, setDetailText] = useState('');
  const [showDetailInput, setShowDetailInput] = useState(false);

  const handleOptionClick = (option: string) => {
    setSelectedOptions((prev) => [...prev, option]);
    
    if (currentStep < steps.length - 2) {
      setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
      }, 300);
    } else if (currentStep === steps.length - 2) {
      // 4단계 완료 후 5단계로
      setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
        setShowDetailInput(true);
      }, 300);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      setSelectedOptions((prev) => prev.slice(0, -1));
      if (currentStep === steps.length - 1) {
        setShowDetailInput(false);
        setDetailText('');
      }
    }
  };

  const handleNext = () => {
    if (currentStep === steps.length - 1 && detailText.trim().length >= 15) {
      navigate('/search');
    }
  };

  const isNextDisabled = currentStep === steps.length - 1 && detailText.trim().length < 15;

  return (
    <Layout>
      <div className="min-h-screen bg-white flex flex-col">
        {/* Step Indicator */}
        <div className="bg-white border-b border-gray-200 py-8">
          <div className="max-w-5xl mx-auto px-6">
            <div className="flex items-center w-full">
              {steps.map((step, index) => {
                const isCompleted = index < currentStep;
                const isActive = index === currentStep;

                return (
                  <React.Fragment key={step.id}>
                    <div className="flex flex-col items-center flex-shrink-0" style={{ width: `${100 / steps.length}%` }}>
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                          isCompleted
                            ? 'bg-[#6D5AED] border-[#6D5AED] text-white'
                            : isActive
                            ? 'bg-white border-[#6D5AED] text-[#6D5AED]'
                            : 'bg-white border-gray-300 text-gray-400'
                        }`}
                      >
                        {isCompleted ? (
                          <Check size={20} className="text-white" />
                        ) : (
                          <span className="text-base font-normal">{step.id}</span>
                        )}
                      </div>
                      <span
                        className={`text-sm mt-2 text-center font-normal whitespace-nowrap ${
                          isActive ? 'text-gray-900' : isCompleted ? 'text-gray-900' : 'text-gray-500'
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={`h-0.5 flex-1 mx-2 transition-all ${
                          isCompleted ? 'bg-[#6D5AED]' : 'bg-gray-300'
                        }`}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full px-6 py-12">
          <div className="bg-[#F0F4F8] rounded-lg p-10 flex-1 flex flex-col min-h-[200px]">
            {/* Welcome Message - 1단계에서만 표시 */}
            {currentStep === 0 && (
              <div className="mb-8">
                <p className="text-base text-gray-700 leading-relaxed font-normal">
                  안녕하세요. 저는 여러분의 법률 도우미입니다. 여러분의 상황을 차분하고 명확하게 이해할 수 있도록 도와드리기 위해 여기 있습니다. 여기서 공유하는 모든 내용은 비공개입니다.
                </p>
              </div>
            )}

            {/* Question */}
            <div className="mb-6">
              <p className="text-lg text-gray-900 font-normal mb-4">
                {steps[currentStep].question}
              </p>
            </div>

            {/* Options or Detail Input */}
            {currentStep < steps.length - 1 ? (
              <>
                <p className="text-sm text-gray-500 mb-4 font-normal">계속하려면 옵션을 선택하세요:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {steps[currentStep].options.map((option, idx) => (
                    <motion.button
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      onClick={() => handleOptionClick(option)}
                      className="p-5 text-left text-base font-normal text-gray-700 bg-white border border-gray-200 rounded-xl hover:border-[#6D5AED] hover:bg-purple-50 hover:text-[#6D5AED] transition-all duration-200 shadow-sm"
                    >
                      {option}
                    </motion.button>
                  ))}
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <textarea
                  value={detailText}
                  onChange={(e) => setDetailText(e.target.value)}
                  placeholder="상황에 대해 자세히 설명해 주세요. (15자 이상)"
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6D5AED] focus:border-[#6D5AED] min-h-[150px] resize-none text-base font-normal"
                  rows={6}
                />
                {detailText.length > 0 && detailText.length < 15 && (
                  <p className="text-sm text-red-500 font-normal">
                    상황에 대해 더 구체적으로 작성해주세요. (현재 {detailText.length}자 / 최소 15자)
                  </p>
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
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <div className="text-base text-[#6D5AED] font-normal underline">
              Step {currentStep + 1} of {steps.length}
            </div>
            <div className="flex gap-4">
              <button
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className={`px-6 py-3 rounded-lg text-base font-normal transition-all ${
                  currentStep === 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-[#D3DDF4] text-[#6D5AED] hover:bg-[#C4D0EB] border border-[#D3DDF4]'
                }`}
              >
                Previous
              </button>
              {currentStep === steps.length - 1 && (
                <button
                  onClick={handleNext}
                  disabled={isNextDisabled}
                  className={`px-6 py-3 rounded-lg text-base font-normal text-white transition-all ${
                    isNextDisabled
                      ? 'bg-gray-300 cursor-not-allowed'
                      : 'bg-[#6D5AED] hover:bg-[#5D4AD9]'
                  }`}
                >
                  Next
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
