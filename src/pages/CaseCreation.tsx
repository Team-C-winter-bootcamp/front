import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCase } from '../context/CaseContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Card } from '../components/ui/Card';
import { ProgressIndicator } from '../components/case/ProgressIndicator';
import { ArrowLeft, ArrowRight, Sparkles, FileText } from 'lucide-react';
export function CaseCreation() {
  const navigate = useNavigate();
  const { caseData, updateCaseData } = useCase();
  const [step, setStep] = useState(1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  // Local state for form inputs
  const [description, setDescription] = useState(caseData.description);
  const [plaintiff, setPlaintiff] = useState(caseData.parties.plaintiff);
  const [defendant, setDefendant] = useState(caseData.parties.defendant);
  const [date, setDate] = useState(caseData.incidentDate);
  const [amount, setAmount] = useState(caseData.amount);
  const [evidence, setEvidence] = useState<'yes' | 'no' | 'unsure' | null>(
    caseData.hasEvidence
  );
  const handleAnalyze = () => {
    if (!description.trim()) return;
    setIsAnalyzing(true);
    updateCaseData({
      description
    });
    // Simulate AI analysis
    setTimeout(() => {
      setIsAnalyzing(false);
      setStep(2);
      // Simulate classification
      updateCaseData({
        type: 'loan'
      });
    }, 2000);
  };
  const handleComplete = () => {
    updateCaseData({
      parties: {
        plaintiff,
        defendant
      },
      incidentDate: date,
      amount,
      hasEvidence: evidence
    });
    navigate('/case/1/document');
  };
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => step > 1 ? setStep(step - 1) : navigate('/')}
            className="pl-0 hover:bg-transparent hover:text-blue-600"
            leftIcon={<ArrowLeft className="w-4 h-4" />}>

            뒤로
          </Button>
        </div>

        <ProgressIndicator
          currentStep={step}
          totalSteps={3}
          label={step === 1 ? '초기 설명' : step === 2 ? '세부 정보' : '검토'} />


        {step === 1 &&
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-3">
                무슨 일이 있었나요?
              </h1>
              <p className="text-gray-600">
                상황을 자신의 말로 설명해주세요. 법률 용어는 걱정하지 마세요.
                그냥 이야기를 들려주세요.
              </p>
            </div>

            <Card>
              <Textarea
              placeholder="예시: 작년에 친구 철수에게 차 수리비로 500만원을 빌려줬습니다. 12월까지 갚겠다고 약속했지만 그 이후로 연락이 안 됩니다..."
              className="min-h-[200px] text-lg"
              value={description}
              onChange={(e) => setDescription(e.target.value)} />

            </Card>

            <div className="flex justify-end">
              <Button
              size="lg"
              onClick={handleAnalyze}
              disabled={!description.trim()}
              isLoading={isAnalyzing}
              rightIcon={!isAnalyzing && <Sparkles className="w-4 h-4" />}>

                {isAnalyzing ? '사건 분석 중...' : '계속하기'}
              </Button>
            </div>
          </div>
        }

        {step === 2 &&
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-3">
                세부 정보를 입력해주세요
              </h1>
              <p className="text-gray-600">
                이 사건은{' '}
                <span className="font-semibold text-blue-600">대여금 분쟁</span>
                으로 파악됩니다. 주요 정보를 입력해주세요.
              </p>
            </div>

            <div className="space-y-4">
              <Card className="space-y-6">
                <Input
                label="누가 돈을 빌려갔나요? (피고)"
                placeholder="성명"
                value={defendant}
                onChange={(e) => setDefendant(e.target.value)} />


                <Input
                label="귀하의 성명 (원고)"
                placeholder="성명"
                value={plaintiff}
                onChange={(e) => setPlaintiff(e.target.value)} />


                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                  label="빌려준 금액"
                  placeholder="0"
                  type="number"
                  leftIcon={<span className="text-gray-500">₩</span>}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)} />


                  <Input
                  label="대여 날짜"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)} />

                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    서면 증거가 있나요? (문자, 이메일, 계약서)
                  </label>
                  <div className="flex gap-3">
                    {['yes', 'no', 'unsure'].map((option) =>
                  <button
                    key={option}
                    onClick={() => setEvidence(option as any)}
                    className={`
                          flex-1 py-3 px-4 rounded-xl border text-sm font-medium transition-all
                          ${evidence === option ? 'bg-blue-50 border-blue-500 text-blue-700 ring-1 ring-blue-500' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}
                        `}>

                        {option === 'yes' ?
                    '있음' :
                    option === 'no' ?
                    '없음' :
                    '잘 모름'}
                      </button>
                  )}
                  </div>
                </div>
              </Card>
            </div>

            <div className="flex justify-end pt-4">
              <Button
              size="lg"
              onClick={() => setStep(3)}
              disabled={!defendant || !amount}
              rightIcon={<ArrowRight className="w-4 h-4" />}>

                다음 단계
              </Button>
            </div>
          </div>
        }

        {step === 3 &&
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-3">
                작성 준비 완료
              </h1>
              <p className="text-gray-600">
                <span className="font-semibold text-blue-600">내용증명</span>{' '}
                작성을 시작할 충분한 정보가 모였습니다. 다음 단계에서 수정하고
                다듬을 수 있습니다.
              </p>
            </div>

            <Card className="bg-blue-50 border-blue-100">
              <h3 className="font-semibold text-blue-900 mb-2">요약</h3>
              <ul className="space-y-2 text-blue-800 text-sm">
                <li className="flex justify-between">
                  <span>유형:</span>
                  <span className="font-medium">대여금 분쟁</span>
                </li>
                <li className="flex justify-between">
                  <span>당사자:</span>
                  <span className="font-medium">
                    {plaintiff} vs. {defendant}
                  </span>
                </li>
                <li className="flex justify-between">
                  <span>금액:</span>
                  <span className="font-medium">₩{amount}</span>
                </li>
              </ul>
            </Card>

            <div className="flex justify-end pt-4">
              <Button
              size="lg"
              onClick={handleComplete}
              rightIcon={<FileText className="w-4 h-4" />}>

                문서 작성 시작
              </Button>
            </div>
          </div>
        }
      </div>
    </div>);

}