import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { CaseLawCard } from '../components/case/CaseLawCard';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import { ArrowLeft, Check, Scale } from 'lucide-react';
export function CaseLaw() {
  const navigate = useNavigate();
  const [selectedCase, setSelectedCase] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const cases = [
  {
    id: 1,
    title: '대법원 2018다234567',
    citation: '대법원 2018. 5. 15. 선고 2018다234567 판결',
    relevance: '문자메시지가 계약의 구속력 있는 증거로 인정된 사례',
    snippet:
    '...법원은 문자메시지 교환이 유효한 서면 합의를 구성한다고 판시하였으며, 필수 조건이 명확한 경우...',
    isUnfavorable: false,
    details: {
      facts:
      '원고가 피고에게 200만원을 송금. 피고는 문자메시지로 채무를 인정했으나 변제하지 않음.',
      reasoning:
      '전자적 의사표시도 당사자가 식별 가능하고 조건이 명확하면 민법상 서면 요건을 충족함.',
      conclusion: '원고 승소 판결.'
    }
  },
  {
    id: 2,
    title: '서울중앙지법 2015가단123456',
    citation: '서울중앙지방법원 2015. 3. 20. 선고 2015가단123456 판결',
    relevance: '구두 대여 계약의 소멸시효 관련 판례',
    snippet:
    '...구두 계약의 경우 소멸시효는 채무불이행일로부터 2년이며, 대여일이 아님...',
    isUnfavorable: true,
    details: {
      facts: '대여 후 3년이 경과. 서면 계약 없음.',
      reasoning: '구두 계약의 소멸시효가 만료됨.',
      conclusion: '소 각하.'
    }
  },
  {
    id: 3,
    title: '대법원 2020다567890',
    citation: '대법원 2020. 11. 10. 선고 2020다567890 판결',
    relevance: '서면 약정이 없어도 법정이자 청구 가능',
    snippet:
    '...계약서에 이자 조항이 없더라도 채무불이행 시점부터 법정이율 연 5%를 적용...',
    isUnfavorable: false,
    details: {
      facts: '개인 간 대여금 분쟁에서 이자 약정 여부 다툼.',
      reasoning: '민법은 채무불이행에 대해 법정이율 연 5%를 규정함.',
      conclusion: '원고에게 원금과 법정이자 지급 판결.'
    }
  }];

  const handleViewDetails = (caseItem: any) => {
    setSelectedCase(caseItem);
    setIsModalOpen(true);
  };
  const handleUseCase = () => {
    setIsModalOpen(false);
    navigate('/case/1/submit');
  };
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/case/1/document')}
            leftIcon={<ArrowLeft className="w-4 h-4" />}>

            편집기로 돌아가기
          </Button>
          <div className="flex items-center space-x-2">
            <Scale className="w-5 h-5 text-blue-600" />
            <span className="font-semibold text-gray-900">판례 추천</span>
          </div>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            관련 판례 발견
          </h1>
          <p className="text-gray-600">
            귀하의 상황과 유사한 3건의 판례를 찾았습니다. 이를 인용하면 법적
            주장을 강화할 수 있습니다.
          </p>
        </div>

        <div className="space-y-4">
          {cases.map((c) =>
          <CaseLawCard
            key={c.id}
            title={c.title}
            citation={c.citation}
            relevance={c.relevance}
            snippet={c.snippet}
            isUnfavorable={c.isUnfavorable}
            onViewDetails={() => handleViewDetails(c)} />

          )}
        </div>

        <div className="mt-8 flex justify-end">
          <Button
            variant="secondary"
            onClick={() => navigate('/case/1/submit')}>

            나중에 하기
          </Button>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedCase?.title}>

        {selectedCase &&
        <div className="space-y-6">
            <div className="flex items-center space-x-2 text-sm text-gray-500 font-mono mb-4">
              <span>{selectedCase.citation}</span>
              {selectedCase.isUnfavorable &&
            <Badge variant="warning">혼합 결과</Badge>
            }
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">사실관계</h4>
              <p className="text-gray-600 text-sm leading-relaxed">
                {selectedCase.details.facts}
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">판단 이유</h4>
              <p className="text-gray-600 text-sm leading-relaxed">
                {selectedCase.details.reasoning}
              </p>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <h4 className="font-semibold text-blue-900 mb-2">
                귀하의 사건에 적용
              </h4>
              <p className="text-blue-800 text-sm">
                {selectedCase.relevance} 이는 귀하의 사건에 유리한 선례입니다.
              </p>
            </div>

            <div className="flex justify-end pt-4">
              <Button
              onClick={handleUseCase}
              leftIcon={<Check className="w-4 h-4" />}>

                법적 근거로 사용
              </Button>
            </div>
          </div>
        }
      </Modal>
    </div>);

}