import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCase } from '../context/CaseContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Timeline } from '../components/case/Timeline';
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Scale,
  Gavel,
  RefreshCw,
  Home } from
'lucide-react';
export function Resolution() {
  const navigate = useNavigate();
  const { caseData, updateCaseData } = useCase();
  const [resolutionType, setResolutionType] = useState<
    'settled' |
    'judgment-favor' |
    'judgment-against' |
    'dismissed' |
    'ongoing' |
    null>(
    caseData.resolutionType ? caseData.resolutionType : null);
  const [date, setDate] = useState(
    caseData.resolutionDate || new Date().toISOString().split('T')[0]
  );
  const [amount, setAmount] = useState(caseData.resolutionAmount || '');
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
    status: 'completed' as const
  },
  {
    id: '5',
    label: '해결',
    status: 'current' as const
  }];

  const handleComplete = () => {
    updateCaseData({
      resolutionType,
      resolutionDate: date,
      resolutionAmount: amount,
      status: 'resolved'
    });
    // In a real app, this might archive the case
    navigate('/');
  };
  const isSuccess =
  resolutionType === 'settled' || resolutionType === 'judgment-favor';
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/case/1/response')}
            className="pl-0 hover:bg-transparent hover:text-blue-600"
            leftIcon={<ArrowLeft className="w-4 h-4" />}>

            답변으로 돌아가기
          </Button>
        </div>

        <div className="mb-8">
          <Timeline steps={timelineSteps} />
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">사건 결과</h1>
          <p className="text-gray-600">
            최종 해결 내용을 기록하면 법적 과정의 완전한 기록을 보관할 수
            있습니다.
          </p>
        </div>

        <Card className="mb-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                현재 상태 또는 결과는 무엇인가요?
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                {
                  id: 'settled',
                  label: '법정 외 합의',
                  icon: CheckCircle,
                  color: 'text-green-600'
                },
                {
                  id: 'judgment-favor',
                  label: '승소 판결',
                  icon: Gavel,
                  color: 'text-green-600'
                },
                {
                  id: 'judgment-against',
                  label: '패소 판결',
                  icon: Gavel,
                  color: 'text-red-600'
                },
                {
                  id: 'dismissed',
                  label: '소 각하',
                  icon: XCircle,
                  color: 'text-gray-600'
                },
                {
                  id: 'ongoing',
                  label: '소송 진행 중',
                  icon: RefreshCw,
                  color: 'text-blue-600'
                }].
                map((option) =>
                <button
                  key={option.id}
                  onClick={() => setResolutionType(option.id as any)}
                  className={`
                      flex items-center p-4 rounded-xl border text-sm font-medium transition-all
                      ${resolutionType === option.id ? 'bg-blue-50 border-blue-500 text-blue-700 ring-1 ring-blue-500' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}
                    `}>

                    <option.icon
                    className={`w-5 h-5 mr-3 ${resolutionType === option.id ? option.color : 'text-gray-400'}`} />

                    {option.label}
                  </button>
                )}
              </div>
            </div>

            {resolutionType &&
            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                  label="해결 날짜"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)} />


                  {(resolutionType === 'settled' ||
                resolutionType === 'judgment-favor' ||
                resolutionType === 'judgment-against') &&
                <Input
                  label="최종 금액"
                  placeholder="0"
                  type="number"
                  leftIcon={<span className="text-gray-500">₩</span>}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)} />

                }
                </div>
              </div>
            }
          </div>
        </Card>

        {resolutionType && resolutionType !== 'ongoing' &&
        <div
          className={`rounded-xl p-6 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500 ${isSuccess ? 'bg-green-50 border border-green-100' : 'bg-gray-100 border border-gray-200'}`}>

            <div className="flex items-start">
              <div
              className={`p-2 rounded-full mr-4 ${isSuccess ? 'bg-green-100' : 'bg-gray-200'}`}>

                {isSuccess ?
              <CheckCircle className="w-6 h-6 text-green-600" /> :

              <Scale className="w-6 h-6 text-gray-600" />
              }
              </div>
              <div>
                <h3
                className={`text-lg font-semibold mb-1 ${isSuccess ? 'text-green-900' : 'text-gray-900'}`}>

                  {isSuccess ? '사건 해결을 축하드립니다!' : '사건 종결'}
                </h3>
                <p
                className={`${isSuccess ? 'text-green-700' : 'text-gray-600'}`}>

                  {isSuccess ?
                `법적 절차를 성공적으로 마치고 해결에 도달하셨습니다. 이는 큰 성과입니다.` :
                `이 결과를 기록하는 것이 중요합니다. 전문적으로 처리하기 위해 올바른 조치를 취하셨습니다.`}
                </p>

                <div className="mt-4 pt-4 border-t border-black/5 grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs uppercase tracking-wide opacity-60 font-semibold block mb-1">
                      원래 청구액
                    </span>
                    <span className="text-lg font-medium">
                      ₩{caseData.amount || '0'}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs uppercase tracking-wide opacity-60 font-semibold block mb-1">
                      최종 결과
                    </span>
                    <span className="text-lg font-medium">
                      ₩{amount || '0'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        }

        <div className="flex justify-end space-x-4">
          <Button
            variant="secondary"
            onClick={() => navigate('/')}
            leftIcon={<Home className="w-4 h-4" />}>

            홈으로
          </Button>
          <Button
            size="lg"
            onClick={handleComplete}
            disabled={!resolutionType}
            leftIcon={<CheckCircle className="w-4 h-4" />}>

            사건 종결
          </Button>
        </div>
      </div>
    </div>);

}