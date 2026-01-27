import { useState, useEffect, Fragment, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Layout } from '../components/ui/Layout';
import { Check, CalendarOff, Edit3, AlertCircle } from 'lucide-react';
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
      setTimeout(() => setCurrentStep((prev) => prev + 1), 300);
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
      <div className="bg-white min-h-screen">
        {/* 프로그레스 바 */}
        <div className="bg-white border-b border-gray-200 py-6">
          <div className="max-w-4xl mx-auto px-6">
            <div className="flex items-center w-full">
              {dynamicSteps.map((step, index) => {
                const isCompleted = index < currentStep;
                const isActive = index === currentStep;
                return (
                  <Fragment key={step.id}>
                    <div className="flex flex-col items-center flex-1">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                        isCompleted ? 'bg-indigo-600 border-indigo-600 text-white' : isActive ? 'bg-white border-indigo-600 text-indigo-600' : 'bg-white border-gray-300 text-gray-400'
                      }`}>
                        {isCompleted ? <Check size={18} /> : <span className="text-sm font-bold">{step.id}</span>}
                      </div>
                      <span className={`text-xs mt-2 font-medium ${isActive || isCompleted ? 'text-gray-900' : 'text-gray-500'}`}>
                        {step.label}
                      </span>
                    </div>
                    {index < dynamicSteps.length - 1 && (
                      <div className={`flex-1 h-0.5 mx-2 ${isCompleted ? 'bg-indigo-600' : 'bg-gray-300'}`} />
                    )}
                  </Fragment>
                );
              })}
            </div>
          </div>
        </div>

        {/* 메인 컨텐츠 */}
        <div className="max-w-4xl mx-auto px-6 py-10">
          <div className="bg-slate-50 rounded-3xl p-8 shadow-sm border border-slate-100">
            <div className="mb-4 inline-block px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full uppercase tracking-wider">
              Step {currentStep + 1} / {dynamicSteps.length}
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-8">{currentStepData.question}</h2>

            <AnimatePresence mode="wait">
              {showCustomInput ? (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col gap-4">
                  <div className="relative">
                    <input 
                      autoFocus
                      type="text"
                      value={customInput}
                      onChange={(e) => setCustomInput(e.target.value)}
                      placeholder="상황에 맞는 답변을 직접 입력해주세요."
                      className="w-full p-5 text-lg border-2 border-indigo-600 rounded-2xl outline-none bg-white shadow-lg"
                      onKeyPress={(e) => e.key === 'Enter' && handleCustomSubmit()}
                    />
                    <Edit3 className="absolute right-5 top-5 text-indigo-300" size={24} />
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setShowCustomInput(false)} className="flex-1 py-4 bg-gray-200 text-gray-600 rounded-2xl font-bold text-lg">취소</button>
                    <button onClick={handleCustomSubmit} className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg shadow-indigo-100">입력 완료</button>
                  </div>
                </motion.div>
              ) : (
                <motion.div key={currentStep} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  {currentStepData.type === 'when' ? (
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-full max-w-sm">
                        <input 
                          type="date" 
                          className="w-full p-5 text-xl border-2 border-indigo-100 rounded-2xl focus:border-indigo-600 outline-none transition-all bg-white text-gray-700"
                          onChange={(e) => setSelectedValues({ ...selectedValues, when: e.target.value })}
                          value={selectedValues['when'] !== '날짜 미상' ? selectedValues['when'] || '' : ''}
                        />
                      </div>
                      <div className="w-full max-w-sm flex flex-col gap-3">
                        <button 
                          onClick={() => handleOptionClick('when', selectedValues['when'])}
                          className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg disabled:bg-gray-200 shadow-md"
                          disabled={!selectedValues['when'] || selectedValues['when'] === '날짜 미상'}
                        >
                          이 날짜로 선택
                        </button>
                        <button 
                          onClick={() => handleOptionClick('when', '날짜 미상')}
                          className="w-full py-4 bg-white text-gray-500 border border-gray-200 rounded-2xl font-medium flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
                        >
                          <CalendarOff size={18} /> 날짜를 잘 모르겠습니다
                        </button>
                      </div>
                    </div>
                  ) : currentStepData.type === 'detail' ? (
                    <div className="flex flex-col gap-3">
                      <textarea
                        value={detailText}
                        onChange={(e) => setDetailText(e.target.value)}
                        placeholder="상황을 자세히 적어주시면 AI가 더 정확한 분석을 도와드립니다."
                        className={`w-full h-64 p-5 text-lg border-2 rounded-2xl focus:ring-4 focus:outline-none resize-none shadow-inner transition-all ${
                          detailText.length > 0 && !isDetailValid 
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-50' 
                          : 'border-gray-200 focus:border-indigo-600 focus:ring-indigo-50'
                        }`}
                      />
                      <div className="flex justify-between items-center px-1">
                        <div className="min-h-[24px]">
                          {detailText.length > 0 && !isDetailValid && (
                            <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-sm text-red-500 font-semibold flex items-center gap-1">
                              <AlertCircle size={14} /> 최소 15자 이상 작성해주세요. (현재 {detailText.length}자)
                            </motion.p>
                          )}
                        </div>
                        <span className={`text-sm font-bold ${isDetailValid ? 'text-indigo-600' : 'text-gray-400'}`}>
                          {detailText.length} / 15자 이상
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      {currentStepData.options.map((option, idx) => (
                        <motion.button
                          key={idx}
                          whileHover={{ x: 10, backgroundColor: '#f5f7ff' }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleOptionClick(currentStepData.type, option)}
                          className="p-5 text-left text-lg font-medium text-gray-700 bg-white border border-gray-200 rounded-2xl hover:border-indigo-600 hover:text-indigo-600 transition-all shadow-sm"
                        >
                          {option}
                        </motion.button>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="mt-8 flex justify-between items-center">
            <button 
              onClick={() => showCustomInput ? setShowCustomInput(false) : setCurrentStep(prev => prev - 1)} 
              disabled={currentStep === 0 && !showCustomInput}
              className="px-6 py-3 text-gray-500 font-medium disabled:opacity-30 hover:text-indigo-600 transition-colors"
            >
              {showCustomInput ? "선택지로 돌아가기" : "이전 단계로"}
            </button>
            {currentStep === dynamicSteps.length - 1 && !showCustomInput && (
              <button 
                onClick={handleNext} 
                disabled={!isDetailValid || isLoading}
                className={`px-12 py-4 rounded-2xl font-bold text-lg shadow-lg transition-all active:scale-95 ${
                  !isDetailValid || isLoading ? 'bg-gray-300' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100'
                }`}
              >
                {isLoading ? '사건 분석 중...' : '유사 판례 검색하기'}
              </button>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}