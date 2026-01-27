import { useState, useEffect, Fragment, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Layout } from '../components/ui/Layout';
import { Check, CalendarOff, Edit3, AlertCircle, Loader2, ChevronDown, ChevronUp, ChevronRight, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { caseService, initService } from '../api';
import { PostCaseInfoSuccess } from '../api/types';

// 1. 타입 정의
type QuestionType = 'who' | 'when' | 'what' | 'want' | 'detail';

interface QuestionItem {
  type: QuestionType;
  content: string;
}

interface CategoryData {
  category_id: number;
  name: string;
  questions: QuestionItem[];
}

interface StepItem {
  id: number;
  type: QuestionType;
  label: string;
  question: string;
  options: string[];
}

export default function CaseCreation() {
  const navigate = useNavigate();
  const location = useLocation();

  // 상태 관리
  const [currentStep, setCurrentStep] = useState(0);
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [selectedValues, setSelectedValues] = useState<Record<string, string>>({});
  const [detailText, setDetailText] = useState('');
  const [customInput, setCustomInput] = useState(''); 
  const [showCustomInput, setShowCustomInput] = useState(false); 
  const [isLoading, setIsLoading] = useState(false);
  const [isDataFetching, setIsDataFetching] = useState(true);
  const [clickedOption, setClickedOption] = useState<number | null>(null);
  const [showExample, setShowCustomExample] = useState(false);

  // 초기 데이터 로드
  useEffect(() => {
    const fetchInitData = async () => {
      try {
        const response = await initService.getCategories();
        setCategoryData(response as any);
      } catch (error) {
        console.error('데이터 로드 실패:', error);
      } finally {
        setIsDataFetching(false);
      }
    };
    fetchInitData();
  }, []);

  // 단계별 질문 동적 구성
  const dynamicSteps = useMemo<StepItem[]>(() => {
    const currentCategoryName = location.state?.category || '기타';
    const targetCategory = categoryData.find((c) => c.name === currentCategoryName);

    if (!targetCategory) return [];

    const typeOrder: Extract<QuestionType, 'who' | 'when' | 'what' | 'want'>[] = ['who', 'when', 'what', 'want'];
    const labels: Record<string, string> = { who: '당사자', when: '시기', what: '사건 내용', want: '희망 결과' };
    const questions: Record<string, string> = {
      who: '본인의 역할을 선택해주세요.',
      when: '사건이 발생한 날짜를 선택해주세요.',
      what: '구체적인 피해 상황은 무엇인가요?',
      want: '어떤 해결 결과를 원하시나요?'
    };

    const steps: StepItem[] = typeOrder.map((type, index) => {
      const options = targetCategory.questions
        .filter((q) => q.type === type)
        .map((q) => q.content);

      return {
        id: index + 1,
        type,
        label: labels[type],
        question: questions[type],
        options: type === 'when' ? [] : [...options, '기타(직접 입력)']
      };
    });

    steps.push({
      id: 5,
      type: 'detail',
      label: '세부사항',
      question: '상황에 대해 자세히 설명해 주세요.',
      options: []
    });

    return steps;
  }, [categoryData, location.state]);

  const isDetailValid = detailText.trim().length >= 15;

  const handleOptionClick = (type: QuestionType, value: string) => {
    if (value === '기타(직접 입력)') {
      setShowCustomInput(true);
      setCustomInput('');
      return;
    }
    
    setSelectedValues((prev) => ({ ...prev, [type]: value }));
    setShowCustomInput(false);
    if (currentStep < dynamicSteps.length - 1) {
      setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
        setClickedOption(null);
      }, 300);
    }
  };

  const handleCustomSubmit = () => {
    if (customInput.trim().length === 0) return;
    handleOptionClick(dynamicSteps[currentStep].type, customInput);
  };

  const handleNext = async () => {
    if (currentStep === dynamicSteps.length - 1 && isDetailValid) {
      setIsLoading(true);
      try {
        const requestData = {
          category: location.state?.category || '기타',
          who: selectedValues['who'] || '미지정',
          when: selectedValues['when'] || '날짜 미상',
          what: selectedValues['what'] || '미정',
          want: selectedValues['want'] || '법률 조언 요청',
          detail: detailText.trim()
        };

        const response = await caseService.createCase(requestData) as PostCaseInfoSuccess;

        if (response.status === 'success' && response.data) {
          navigate('/search', { 
            state: { 
              case_id: response.data.case_id,
              results: response.data.results, 
              totalCount: response.data.total_count,
            } 
          });
        }
      } catch (error) {
        alert('사건 등록에 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (isDataFetching) return <div className="h-screen flex items-center justify-center font-medium text-gray-500">정보를 구성 중입니다...</div>;
  const currentStepData = dynamicSteps[currentStep];

  return (
    <Layout>
      <div className="bg-white h-[calc(100vh-80px)] relative overflow-hidden flex flex-col">
        {/* 은은한 격자무늬 패턴 배경 */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.03]" 
             style={{ backgroundImage: `radial-gradient(#4f46e5 0.5px, transparent 0.5px)`, backgroundSize: '24px 24px' }} />

        {/* 프로그레스 바 */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-gray-100 py-4 flex-shrink-0 z-20">
          <div className="max-w-4xl mx-auto px-6">
            <div className="flex items-center w-full relative">
              {/* 진행률 배경 선: 첫 번째 원 중심부터 마지막 원 중심까지 */}
              <div 
                className="absolute top-5 h-[2px] bg-gray-100 z-0" 
                style={{ 
                  left: `${100 / (dynamicSteps.length * 2)}%`, 
                  right: `${100 / (dynamicSteps.length * 2)}%` 
                }} 
              />
              {/* 진행중인 그라데이션 선 */}
              <motion.div 
                className="absolute top-5 h-[2px] bg-gradient-to-r from-indigo-400 to-indigo-600 z-0"
                style={{ left: `${100 / (dynamicSteps.length * 2)}%` }}
                initial={{ width: '0%' }}
                animate={{ width: `${(currentStep / (dynamicSteps.length - 1)) * (100 - (100 / dynamicSteps.length))}%` }}
                transition={{ duration: 0.5 }}
              />

              {dynamicSteps.map((step, index) => {
                const isCompleted = index < currentStep;
                const isActive = index === currentStep;
                return (
                  <Fragment key={step.id}>
                    <div className="flex flex-col items-center flex-1 z-10">
                      <motion.div 
                        animate={{ 
                          scale: isActive ? 1.15 : 1,
                          backgroundColor: isCompleted || isActive ? '#4f46e5' : '#ffffff',
                          borderColor: isCompleted || isActive ? '#4f46e5' : '#e5e7eb'
                        }}
                        className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors shadow-sm`}
                      >
                        {isCompleted ? (
                          <Check size={18} className="text-white" />
                        ) : (
                          <span className={`text-sm font-bold ${isActive ? 'text-white' : 'text-gray-400'}`}>
                            {step.id}
                          </span>
                        )}
                      </motion.div>
                      <span className={`text-[11px] mt-3 font-bold uppercase tracking-tighter transition-colors ${isActive || isCompleted ? 'text-indigo-600' : 'text-gray-400'}`}>
                        {step.label}
                      </span>
                    </div>
                  </Fragment>
                );
              })}
            </div>
          </div>
        </div>

        {/* 메인 컨텐츠 */}
        <div className="max-w-4xl mx-auto w-full px-6 py-4 flex-1 flex flex-col justify-center relative z-10 overflow-hidden">
          <motion.div 
            layout
            className="bg-white rounded-[2rem] p-8 shadow-2xl shadow-indigo-500/[0.06] border border-slate-100 max-h-full overflow-y-auto custom-scrollbar flex flex-col"
          >
            <h2 className="text-2xl font-black text-slate-900 mb-6 leading-tight">
              <span className="text-indigo-600 mr-2">{currentStep + 1}.</span>
              {currentStepData.question}
            </h2>

            <AnimatePresence mode="wait">
              {showCustomInput ? (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col gap-4">
                  <div className="relative">
                    <input 
                      autoFocus
                      type="text"
                      value={customInput}
                      onChange={(e) => setCustomInput(e.target.value)}
                      placeholder="답변을 직접 입력해주세요."
                      className="w-full p-5 text-xl border-2 border-indigo-600 rounded-2xl outline-none bg-white shadow-xl"
                      onKeyPress={(e) => e.key === 'Enter' && handleCustomSubmit()}
                    />
                    <Edit3 className="absolute right-6 top-5 text-indigo-300" size={24} />
                  </div>
                  <div className="flex gap-4">
                    <button onClick={() => setShowCustomInput(false)} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-bold text-lg hover:bg-slate-200 transition-colors">취소</button>
                    <button onClick={handleCustomSubmit} className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-indigo-200 active:scale-[0.98] transition-all">입력 완료</button>
                  </div>
                </motion.div>
              ) : (
                <motion.div key={currentStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  {currentStepData.type === 'when' ? (
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-full max-w-md">
                        <input 
                          type="date" 
                          className="w-full p-5 text-2xl border-2 border-indigo-50 rounded-[1.5rem] focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 outline-none transition-all bg-slate-50/50 text-slate-700 font-bold"
                          onChange={(e) => setSelectedValues({ ...selectedValues, when: e.target.value })}
                          value={selectedValues['when'] !== '날짜 미상' ? selectedValues['when'] || '' : ''}
                        />
                      </div>
                      <div className="w-full max-w-md flex flex-col gap-3">
                        <button 
                          onClick={() => handleOptionClick('when', selectedValues['when'])}
                          className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-xl disabled:bg-slate-200 disabled:text-slate-400 shadow-xl shadow-indigo-200 active:scale-[0.98] transition-all"
                          disabled={!selectedValues['when'] || selectedValues['when'] === '날짜 미상'}
                        >
                          이 날짜로 선택
                        </button>
                        <button 
                          onClick={() => handleOptionClick('when', '날짜 미상')}
                          className="w-full py-4 bg-white text-slate-400 border-2 border-slate-100 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
                        >
                          <CalendarOff size={20} /> 날짜를 잘 모르겠습니다
                        </button>
                      </div>
                    </div>
                  ) : currentStepData.type === 'detail' ? (
                    <div className="flex flex-col gap-4">
                      <div className="relative">
                        <textarea
                          value={detailText}
                          onChange={(e) => setDetailText(e.target.value)}
                          placeholder="어떤 일이 있었는지 친구에게 이야기하듯 편하게 적어주세요."
                          className={`w-full h-48 p-6 text-lg border-2 rounded-[2rem] focus:ring-8 focus:outline-none resize-none shadow-inner transition-all leading-relaxed ${
                            detailText.length > 0 && !isDetailValid 
                            ? 'border-rose-100 focus:border-rose-400 focus:ring-rose-50 bg-rose-50/10' 
                            : 'border-slate-100 focus:border-indigo-600 focus:ring-indigo-50 bg-slate-50/30'
                          }`}
                        />
                        <div className="absolute bottom-4 right-6 flex flex-col items-end gap-1">
                          <span className={`text-xs font-black tracking-widest ${isDetailValid ? 'text-indigo-600' : 'text-slate-300'}`}>
                            {detailText.length} / 15자
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3">
                        <div className="min-h-[24px]">
                          <AnimatePresence>
                            {detailText.length > 0 && detailText.length < 15 && (
                              <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-xs text-rose-500 font-bold flex items-center gap-2">
                                <AlertCircle size={14} /> 조금 더 자세히 적어주시면 AI가 더 정확히 분석해요!
                              </motion.p>
                            )}
                            {isDetailValid && (
                              <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-indigo-600 font-bold flex items-center gap-2">
                                <Check size={14} /> 아주 좋아요! 상세한 정보는 분석에 큰 도움이 됩니다.
                              </motion.p>
                            )}
                          </AnimatePresence>
                        </div>

                        {/* 작성 예시 아코디언 */}
                        <div className="border border-slate-100 rounded-2xl overflow-hidden">
                          <button 
                            onClick={() => setShowCustomExample(!showExample)}
                            className="w-full p-3 bg-slate-50 flex items-center justify-between text-slate-600 font-bold text-xs"
                          >
                            <span className="flex items-center gap-2">💡 작성 예시 보기</span>
                            {showExample ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </button>
                          <AnimatePresence>
                            {showExample && (
                              <motion.div 
                                initial={{ height: 0 }}
                                animate={{ height: 'auto' }}
                                exit={{ height: 0 }}
                                className="overflow-hidden bg-white"
                              >
                                <div className="p-4 text-xs text-slate-500 leading-relaxed whitespace-pre-line border-t border-slate-50">
                                  {`2024년 1월 15일 오후 2시경, 강남역 사거리 인근에서 신호 대기를 위해 정차하고 있었습니다. 정차 후 약 10초 뒤, 후방에서 오던 승용차가 제 차의 범퍼를 강하게 들이받았습니다.
가해 차량 운전자는 사고 직후 차에서 내려 사과를 했으나, 현장에서 보험 접수를 미루며 개인 합의를 요구했습니다. 하지만 차량 뒷범퍼 파손이 심하고, 사고 충격으로 인해 현재 목과 허리에 통증이 있어 병원 치료가 필요한 상황입니다.`}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-3">
                      {currentStepData.options.map((option, idx) => (
                        <motion.button
                          key={idx}
                          whileHover={{ x: 12, backgroundColor: '#f0f4ff' }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            setClickedOption(idx);
                            handleOptionClick(currentStepData.type, option);
                          }}
                          className={`p-4 text-left text-lg font-bold transition-all border-2 rounded-2xl flex items-center justify-between group ${
                            clickedOption === idx 
                            ? 'border-indigo-600 bg-indigo-600 text-white' 
                            : 'border-slate-100 bg-white text-slate-600 hover:border-indigo-200'
                          }`}
                        >
                          {option}
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                            clickedOption === idx ? 'bg-white/20' : 'bg-slate-50 group-hover:bg-indigo-50'
                          }`}>
                            <ChevronRight size={20} className={clickedOption === idx ? 'text-white' : 'text-slate-300 group-hover:text-indigo-400'} />
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          <div className="mt-6 flex justify-between items-center px-4 flex-shrink-0">
            <button 
              onClick={() => {
                if (showCustomInput) {
                  setShowCustomInput(false);
                } else if (currentStep === 0) {
                  navigate('/home');
                } else {
                  setCurrentStep(prev => prev - 1);
                  setClickedOption(null);
                }
              }} 
              className="group flex items-center gap-2 px-6 py-3 text-slate-400 font-bold hover:text-indigo-600 transition-all"
            >
              <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
              {showCustomInput ? "선택지로 돌아가기" : currentStep === 0 ? "홈으로 가기" : "이전 단계로"}
            </button>
            
            {currentStep === dynamicSteps.length - 1 && !showCustomInput && (
              <motion.button 
                whileHover={!isLoading && isDetailValid ? { scale: 1.02 } : {}}
                whileTap={!isLoading && isDetailValid ? { scale: 0.98 } : {}}
                onClick={handleNext} 
                disabled={!isDetailValid || isLoading}
                className={`relative overflow-hidden px-12 py-4 rounded-[1.5rem] font-black text-xl shadow-2xl transition-all ${
                  !isDetailValid || isLoading 
                  ? 'bg-slate-100 text-slate-300 shadow-none' 
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100'
                }`}
              >
                <span className="flex items-center gap-3">
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin" size={24} />
                      사건 분석 중...
                    </>
                  ) : (
                    <>
                      유사 판례 검색하기
                      <ChevronRight size={24} />
                    </>
                  )}
                </span>
                {isLoading && (
                  <motion.div 
                    className="absolute inset-0 bg-white/20"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                  />
                )}
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}