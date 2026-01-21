import { useNavigate } from 'react-router-dom';
import { useCase } from '../context/CaseContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Timeline } from '../components/case/Timeline';
import { Download, ExternalLink, Home, ArrowRight } from 'lucide-react';
export function SubmissionGuidance() {
  const navigate = useNavigate();
  const { caseData } = useCase();
  const timelineSteps = [
  {
    id: '1',
    label: '작성',
    status: 'completed' as const,
    date: '완료'
  },
  {
    id: '2',
    label: '검토',
    status: 'current' as const,
    date: '오늘'
  },
  {
    id: '3',
    label: '발송/제출',
    status: 'upcoming' as const
  },
  {
    id: '4',
    label: '답변',
    status: 'upcoming' as const
  },
  {
    id: '5',
    label: '해결',
    status: 'upcoming' as const
  }];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Download className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            문서 준비 완료
          </h1>
          <p className="text-gray-600">
            내용증명이 생성되고 저장되었습니다. 다음 단계를 안내해드립니다.
          </p>
        </div>

        <div className="mb-12">
          <Timeline steps={timelineSteps} />
        </div>

        <div className="grid gap-6 mb-8">
          <Card className="border-l-4 border-l-blue-500">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              권장 다음 단계
            </h3>
            <p className="text-gray-600 mb-4">
              <span className="font-semibold">등기우편 배달증명</span>으로
              내용증명을 발송하세요. 이는 피고가 귀하의 청구를 수령했다는 법적
              증거가 됩니다.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => navigate('/case/1/send')}
                rightIcon={<ArrowRight className="w-4 h-4" />}>

                발송 준비 완료
              </Button>
              <Button
                variant="outline"
                size="sm"
                rightIcon={<ExternalLink className="w-4 h-4" />}>

                가까운 우체국 찾기
              </Button>
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              비용 안내
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">등기우편 비용 (대략)</span>
                <span className="font-medium text-gray-900">~4,400원</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">배달증명 (전자)</span>
                <span className="font-medium text-gray-900">~2,320원</span>
              </div>
              <div className="pt-3 border-t border-gray-100 flex justify-between text-sm font-semibold">
                <span>예상 총 비용</span>
                <span>~6,720원</span>
              </div>
            </div>
          </Card>
        </div>

        <div className="flex justify-center space-x-4">
          <Button
            variant="secondary"
            onClick={() => navigate('/')}
            leftIcon={<Home className="w-4 h-4" />}>

            홈으로
          </Button>
          <Button
            onClick={() => window.print()}
            leftIcon={<Download className="w-4 h-4" />}>

            최종 PDF 다운로드
          </Button>
        </div>
      </div>
    </div>);

}