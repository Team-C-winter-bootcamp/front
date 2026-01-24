import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { CaseLawCard } from '../components/case/CaseLawCard';
import { ArrowLeft, Scale } from 'lucide-react';

export default function CaseLaw() {
  const navigate = useNavigate();
  const { id: caseId } = useParams<{ id: string }>();

  const cases = [
    {
      id: 1,
      title: '대법원 2018다234567',
      citation: '대법원 2018. 5. 15. 선고 2018다234567 판결',
      relevance: '문자메시지가 계약의 구속력 있는 증거로 인정된 사례',
      snippet:
        '...법원은 문자메시지 교환이 유효한 서면 합의를 구성한다고 판시하였으며, 필수 조건이 명확한 경우...',
      isUnfavorable: false,
    },
    {
      id: 2,
      title: '서울중앙지법 2015가단123456',
      citation: '서울중앙지방법원 2015. 3. 20. 선고 2015가단123456 판결',
      relevance: '구두 대여 계약의 소멸시효 관련 판례',
      snippet:
        '...구두 계약의 경우 소멸시효는 채무불이행일로부터 2년이며, 대여일이 아님...',
      isUnfavorable: true,
    },
    {
      id: 3,
      title: '대법원 2020다567890',
      citation: '대법원 2020. 11. 10. 선고 2020다567890 판결',
      relevance: '서면 약정이 없어도 법정이자 청구 가능',
      snippet:
        '...계약서에 이자 조항이 없더라도 채무불이행 시점부터 법정이율 연 5%를 적용...',
      isUnfavorable: false,
    },
  ];

  const handleViewDetails = (caseItem: any) => {
    navigate(`/judgment/${caseId}/${caseItem.id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/case/1/document')}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
          >
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
          {cases.map((c) => (
            <CaseLawCard
              key={c.id}
              title={c.title}
              citation={c.citation}
              relevance={c.relevance}
              snippet={c.snippet}
              isUnfavorable={c.isUnfavorable}
              onViewDetails={() => handleViewDetails(c)}
            />
          ))}
        </div>

        <div className="mt-8 flex justify-end">
          <Button
            variant="secondary"
            onClick={() => navigate('/case/1/submit')}
          >
            나중에 하기
          </Button>
        </div>
      </div>
    </div>
  );
}