import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCase } from '../context/CaseContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Timeline } from '../components/case/Timeline';
import { ArrowLeft, ArrowRight, Mail, Upload, CheckCircle } from 'lucide-react';
export function SendFile() {
  const navigate = useNavigate();
  const { caseData, updateCaseData } = useCase();
  const [method, setMethod] = useState<
    'mail' | 'court' | 'email' | 'hand' | null>(
    (caseData.sentMethod ?? null) as 'mail' | 'court' | 'email' | 'hand' | null);
  const [date, setDate] = useState(
    caseData.sentDate || new Date().toISOString().split('T')[0]
  );
  const [tracking, setTracking] = useState(caseData.trackingNumber || '');
  const [fileName, setFileName] = useState<string | null>(null);
  const timelineSteps = [
  {
    id: '1',
    label: 'Drafted',
    status: 'completed' as const
  },
  {
    id: '2',
    label: 'Review',
    status: 'completed' as const
  },
  {
    id: '3',
    label: 'Send/File',
    status: 'current' as const
  },
  {
    id: '4',
    label: 'Response',
    status: 'upcoming' as const
  },
  {
    id: '5',
    label: 'Resolution',
    status: 'upcoming' as const
  }];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFileName(e.target.files[0].name);
    }
  };
  const handleComplete = () => {
    updateCaseData({
      sentMethod: method,
      sentDate: date,
      trackingNumber: tracking,
      status: 'sent'
    });
    navigate('/case/1/response');
  };
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/case/1/submit')}
            className="pl-0 hover:bg-transparent hover:text-blue-600"
            leftIcon={<ArrowLeft className="w-4 h-4" />}>

            검토로 돌아가기
          </Button>
        </div>

        <div className="mb-8">
          <Timeline steps={timelineSteps} />
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            발송 기록하기
          </h1>
          <p className="text-gray-600">
            문서를 언제, 어떻게 발송했는지 기록하는 것은 법적 증거로 매우
            중요합니다.
          </p>
        </div>

        <Card className="mb-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                어떻게 문서를 발송했나요?
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                {
                  id: 'mail',
                  label: '등기우편',
                  icon: Mail
                },
                {
                  id: 'court',
                  label: '법원 제출',
                  icon: CheckCircle
                },
                {
                  id: 'email',
                  label: '이메일',
                  icon: Mail
                },
                {
                  id: 'hand',
                  label: '직접 전달',
                  icon: CheckCircle
                }].
                map((option) =>
                <button
                  key={option.id}
                  onClick={() => setMethod(option.id as any)}
                  className={`
                      flex items-center justify-center p-4 rounded-xl border text-sm font-medium transition-all
                      ${method === option.id ? 'bg-blue-50 border-blue-500 text-blue-700 ring-1 ring-blue-500' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}
                    `}>

                    <option.icon
                    className={`w-4 h-4 mr-2 ${method === option.id ? 'text-blue-600' : 'text-gray-400'}`} />

                    {option.label}
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="발송 날짜"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)} />


              {method === 'mail' &&
              <Input
                label="등기번호"
                placeholder="예: 9400 1000..."
                value={tracking}
                onChange={(e) => setTracking(e.target.value)} />

              }
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                증빙 자료 업로드 (선택사항)
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-blue-400 transition-colors cursor-pointer bg-gray-50">
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">

                      <span>파일 업로드</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        onChange={handleFileUpload} />

                    </label>
                    <p className="pl-1">또는 드래그 앤 드롭</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    {fileName ?
                    <span className="text-green-600 font-medium">
                        {fileName}
                      </span> :

                    '영수증, 사진, 또는 스크린샷'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <div className="flex justify-end">
          <Button
            size="lg"
            onClick={handleComplete}
            disabled={!method || !date}
            rightIcon={<ArrowRight className="w-4 h-4" />}>

            발송 완료로 표시
          </Button>
        </div>
      </div>
    </div>);

}