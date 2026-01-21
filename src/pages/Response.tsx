import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCase } from '../context/CaseContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Timeline } from '../components/case/Timeline';
import {
  ArrowLeft,
  ArrowRight,
  DollarSign,
  MessageSquare,
  XCircle,
  Clock } from
'lucide-react';
export function Response() {
  const navigate = useNavigate();
  const { caseData, updateCaseData } = useCase();
  const [responseType, setResponseType] = useState<
    'paid' | 'partial' | 'refused' | 'counter' | 'none' | null>(
    (caseData.responseType ?? null) as 'paid' | 'partial' | 'refused' | 'counter' | 'none' | null);
  const [date, setDate] = useState(
    caseData.responseDate || new Date().toISOString().split('T')[0]
  );
  const [amount, setAmount] = useState(caseData.responseAmount || '');
  const [notes, setNotes] = useState(caseData.responseNotes || '');
  const timelineSteps = [
  {
    id: '1',
    label: '작성',
    status: 'completed' as const
  },
  {
    id: '2',
    label: '검토',
    status: 'completed' as const
  },
  {
    id: '3',
    label: '발송/제출',
    status: 'completed' as const
  },
  {
    id: '4',
    label: '답변',
    status: 'current' as const
  },
  {
    id: '5',
    label: '해결',
    status: 'upcoming' as const
  }];

  const handleComplete = () => {
    updateCaseData({
      responseType,
      responseDate: date,
      responseAmount: amount,
      responseNotes: notes,
      status: 'responded'
    });
    navigate('/case/1/resolution');
  };
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/case/1/send')}
            className="pl-0 hover:bg-transparent hover:text-blue-600"
            leftIcon={<ArrowLeft className="w-4 h-4" />}>

            발송/제출로 돌아가기
          </Button>
        </div>

        <div className="mb-8">
          <Timeline steps={timelineSteps} />
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            답변 기록하기
          </h1>
          <p className="text-gray-600">
            상대방이 내용증명에 답변했나요? 기록해두겠습니다.
          </p>
        </div>

        <Card className="mb-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                상대방의 답변은 무엇인가요?
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {[
                {
                  id: 'paid',
                  label: '전액 변제',
                  icon: DollarSign
                },
                {
                  id: 'partial',
                  label: '일부 변제',
                  icon: DollarSign
                },
                {
                  id: 'counter',
                  label: '반대 제안',
                  icon: MessageSquare
                },
                {
                  id: 'refused',
                  label: '변제 거부',
                  icon: XCircle
                },
                {
                  id: 'none',
                  label: '무응답',
                  icon: Clock
                }].
                map((option) =>
                <button
                  key={option.id}
                  onClick={() => setResponseType(option.id as any)}
                  className={`
                      flex flex-col items-center justify-center p-4 rounded-xl border text-sm font-medium transition-all h-24
                      ${responseType === option.id ? 'bg-blue-50 border-blue-500 text-blue-700 ring-1 ring-blue-500' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}
                    `}>

                    <option.icon
                    className={`w-6 h-6 mb-2 ${responseType === option.id ? 'text-blue-600' : 'text-gray-400'}`} />

                    {option.label}
                  </button>
                )}
              </div>
            </div>

            {responseType &&
            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                  label={responseType === 'none' ? '기한 날짜' : '답변 날짜'}
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)} />


                  {(responseType === 'paid' ||
                responseType === 'partial' ||
                responseType === 'counter') &&
                <Input
                  label={
                  responseType === 'counter' ? '제안 금액' : '수령 금액'
                  }
                  placeholder="0"
                  type="number"
                  leftIcon={<span className="text-gray-500">₩</span>}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)} />

                }
                </div>

                <Textarea
                label="메모 / 세부사항"
                placeholder="답변(또는 무응답)에 대한 구체적인 내용을 추가하세요..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)} />

              </div>
            }
          </div>
        </Card>

        <div className="flex justify-end">
          <Button
            size="lg"
            onClick={handleComplete}
            disabled={!responseType}
            rightIcon={<ArrowRight className="w-4 h-4" />}>

            해결 단계로 계속
          </Button>
        </div>
      </div>
    </div>);

}