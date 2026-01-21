import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/landing/Navbar';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Timeline } from '../components/case/Timeline';
import { Download, ExternalLink, Home } from 'lucide-react';

export function SubmissionGuidancePage() {
  const navigate = useNavigate();
  const timelineSteps = [
    {
      id: '1',
      label: '초안 작성',
      status: 'completed' as const,
      date: '오늘'
    },
    {
      id: '2',
      label: '검토',
      status: 'current' as const,
      date: '대기 중'
    },
    {
      id: '3',
      label: '발송/제출',
      status: 'upcoming' as const
    },
    {
      id: '4',
      label: '응답',
      status: 'upcoming' as const
    },
    {
      id: '5',
      label: '해결',
      status: 'upcoming' as const
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Navbar />
      <div className="pt-24 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Download className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            문서 준비 완료
          </h1>
          <p className="text-slate-600">
            지급 요구서가 생성되어 저장되었습니다. 다음은 다음 단계입니다.
          </p>
        </div>

        <div className="mb-12">
          <Timeline steps={timelineSteps} />
        </div>

        <div className="grid gap-6 mb-8">
          <Card className="border-l-4 border-l-indigo-500 shadow-lg">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              권장 다음 단계
            </h3>
            <p className="text-slate-600 mb-4">
              이 지급 요구서를{' '}
              <span className="font-semibold">
                반송 영수증이 있는 등기 우편
              </span>
              으로 발송하세요. 이것은 피고인이 귀하의 요구를 받았다는 법적 증거를 제공합니다.
            </p>
            <Button
              variant="outline"
              size="sm"
              rightIcon={<ExternalLink className="w-4 h-4" />}
            >
              가장 가까운 우체국 찾기
            </Button>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              수수료 안내
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">
                  등기 우편 비용 (대략)
                </span>
                <span className="font-medium text-slate-900">약 ₩5,000</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">
                  반송 영수증 (전자)
                </span>
                <span className="font-medium text-slate-900">약 ₩3,000</span>
              </div>
              <div className="pt-3 border-t border-slate-100 flex justify-between text-sm font-semibold">
                <span>예상 총 비용</span>
                <span>약 ₩8,000</span>
              </div>
            </div>
          </Card>
        </div>

        <div className="flex justify-center space-x-4">
          <Button
            variant="secondary"
            onClick={() => navigate('/case')}
            leftIcon={<Home className="w-4 h-4" />}
          >
            홈으로 돌아가기
          </Button>
          <Button
            onClick={() => window.print()}
            leftIcon={<Download className="w-4 h-4" />}
          >
            최종 PDF 다운로드
          </Button>
        </div>
      </div>
      </div>
    </div>
  );
}
