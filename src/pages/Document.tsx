import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/ui/Layout';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Button } from '../components/ui/Button';
import { X, Save, Star, Info } from 'lucide-react';

type DocumentType = 'notice' | 'agreement' | 'complaint' | null;

export function Document() {
  const navigate = useNavigate();
  const [documentType, setDocumentType] = useState<DocumentType>(null);
  const [perpetrator, setPerpetrator] = useState({ 
    name: '', 
    address: '', 
    phone: '',
    birthDate: '',
    occupation: '',
    officeAddress: '',
    homePhone: '',
    officePhone: '',
    email: ''
  });
  const [victim, setVictim] = useState({ 
    name: '', 
    address: '', 
    phone: '',
    birthDate: '',
    occupation: '',
    officeAddress: '',
    homePhone: '',
    officePhone: '',
    email: ''
  });
  const [contractDate, setContractDate] = useState('');
  const [leaseStart, setLeaseStart] = useState('');
  const [leaseEnd, setLeaseEnd] = useState('');
  const [property, setProperty] = useState('');
  const [deposit, setDeposit] = useState('');
  const [monthlyRent, setMonthlyRent] = useState('');
  const [showSample, setShowSample] = useState(true);
  const [relationship, setRelationship] = useState('');
  const [incidentDate, setIncidentDate] = useState('');
  const [incidentTime, setIncidentTime] = useState('');
  const [incidentPlace, setIncidentPlace] = useState('');
  const [policeStation, setPoliceStation] = useState('');
  const [evidence, setEvidence] = useState<string[]>([]);

  const renderDocument = () => {
    if (!documentType) {
      return (
        <div className="flex items-center justify-center h-full text-slate-400">
          문서 유형을 선택해주세요
        </div>
      );
    }

    if (documentType === 'notice') {
      return (
        <div className="p-12 space-y-6 text-slate-800 leading-relaxed">
          <h2 className="text-2xl font-bold text-center mb-8">내용증명</h2>
          
          <div className="space-y-6">
            <div>
              <p className="font-semibold mb-2">발신인</p>
              <p>성명: {victim.name || '김임차'}</p>
              <p>주소: {victim.address || '서울시 성동구 왕십리로 로폼 빌라 101동 101호'}</p>
              <p>전화번호: {victim.phone || '010-1111-2222'}</p>
            </div>

            <div>
              <p className="font-semibold mb-2">수신인</p>
              <p>성명: {perpetrator.name || '김임대'}</p>
            </div>

            <div>
              <p className="font-semibold mb-2">제목</p>
              <p>임대차 보증금 반환청구의 내용증명</p>
            </div>

            <div className="space-y-4 text-sm">
              <p>1. 귀하의 건승을 기원합니다.</p>
              <p>2. 본 발신인과 귀하는 임대차 계약을 체결하였으며, 귀하는 보증금 반환 의무가 있음에도 불구하고 이를 반환하지 아니하여, 이에 변제를 정식으로 청구하는 바입니다.</p>
              <div className="pl-4 space-y-2">
                <p>가. {contractDate ? `${contractDate}에` : '2024.07.01에'} 본 발신인(본 발신인)과 귀하(귀하)는 {property || '서울시 성동구 왕십리로 로폼 아파트'}에 대한 임대차 계약을 체결하였으며, 계약기간은 {leaseStart ? `${leaseStart}부터` : '2024.07.01부터'} {leaseEnd ? `${leaseEnd}까지` : '2025.07.01까지'}이며, 다음 조건으로 합의하였습니다:</p>
                <div className="pl-4 space-y-1">
                  <p>1) 임대차 보증금: {deposit ? `${deposit}원` : '50,000,000원'}</p>
                  <p>2) 월세: {monthlyRent ? `${monthlyRent}원` : '1,000,000원'}</p>
                </div>
                <p>나. 위 임대차 계약이 종료되었으므로, 귀하는 {deposit ? `${deposit}원` : '50,000,000원'}의 보증금을 본 발신인에게 반환할 의무가 있습니다.</p>
              </div>
              <p>3. 위 보증금을 {leaseEnd ? `${leaseEnd}까지` : '2025.07.01까지'} 반환해 주시기 바라며, 기한 내 반환이 없을 경우 법적 조치를 취할 수 있음을 알려드립니다.</p>
            </div>
          </div>
        </div>
      );
    }

    if (documentType === 'agreement') {
      return (
        <div className="p-12 space-y-6 text-slate-800">
          <h2 className="text-2xl font-bold text-center mb-8">합의서</h2>
          
          <div className="space-y-6">
            <div>
              <p className="font-semibold mb-3">피해자</p>
              <div className="space-y-2 text-sm">
                <p>성 명: {victim.name || '[피해자 성명]'}</p>
                <p>생년월일: [생년월일]</p>
                <p>주 소: {victim.address || '[피해자 주소]'}</p>
                <p>연락처: {victim.phone || '[피해자 연락처]'}</p>
              </div>
            </div>

            <div>
              <p className="font-semibold mb-3">가해자</p>
              <div className="space-y-2 text-sm">
                <p>성 명: {perpetrator.name || '[가해자 성명]'}</p>
                <p>생년월일: [생년월일]</p>
                <p>주 소: {perpetrator.address || '[가해자 주소]'}</p>
                <p>연락처: {perpetrator.phone || '[가해자 연락처]'}</p>
              </div>
            </div>

            <div className="text-sm leading-relaxed">
              <p>위 피해자는 {incidentDate ? `${incidentDate} ${incidentTime ? `${incidentTime}에` : ''}` : '20 년 월 일'} {incidentPlace ? `${incidentPlace}에서` : '시 구 동에서'} 발생한 사건과 관련하여 가해자와 금전적으로 (금 원정)에 원만히 합의하여 처벌을 원하지 않습니다. 추후 민, 형사상 어떤 이의도 제기하지 않음을 약속하기 위해 본 합의서에 서명 날인합니다.</p>
            </div>

            <div className="mt-8 text-right">
              <p className="text-sm">20 .</p>
              <p className="text-sm mt-4">피해자 (인)</p>
            </div>
          </div>
        </div>
      );
    }

    if (documentType === 'complaint') {
      return (
        <div className="p-12 space-y-6 text-slate-800">
          <h2 className="text-2xl font-bold text-center mb-4">고소장</h2>
          <p className="text-xs text-center mb-8">(고소장 기재사항 중 * 표시된 항목은 반드시 기재하여야 합니다.)</p>
          
          <div className="space-y-6 text-sm">
            <div>
              <p className="font-semibold mb-3">1. 고소인*</p>
              <div className="space-y-2">
                <p>성명 (상호대표자): {victim.name || '[고소인 성명]'}</p>
                <p>주민등록번호 (법인등록번호): [주민등록번호]</p>
                <p>주소 (주사무소 소재지): {victim.address || '[고소인 주소] (현 거주지)'}</p>
                <p>직업: {victim.occupation || '[직업]'}</p>
                <p>사무실 주소: {victim.officeAddress || '[사무실 주소]'}</p>
                <p>전화 (휴대폰): {victim.phone || '[휴대폰]'}</p>
                <p>전화 (자택): {victim.homePhone || '[자택 전화]'}</p>
                <p>전화 (사무실): {victim.officePhone || '[사무실 전화]'}</p>
                <p>이메일: {victim.email || '[이메일]'}</p>
                <div className="mt-3 space-y-2">
                  <p className="font-medium">대리인에 의한 고소:</p>
                  <div className="pl-4 space-y-1">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="w-4 h-4" />
                      <span>□ 법정대리인(성명: ,연락처 )</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="w-4 h-4" />
                      <span>□ 고소대리인(성명: 변호사 ,연락처 )</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <p className="font-semibold mb-3">2. 피고소인*</p>
              <div className="space-y-2">
                <p>성명: {perpetrator.name || '[피고소인 성명]'}</p>
                <p>주민등록번호: [주민등록번호]</p>
                <p>주소: {perpetrator.address || '[피고소인 주소] (현 거주지)'}</p>
                <p>직업: {perpetrator.occupation || '[직업]'}</p>
                <p>사무실 주소: {perpetrator.officeAddress || '[사무실 주소]'}</p>
                <p>전화 (휴대폰): {perpetrator.phone || '[휴대폰]'}</p>
                <p>전화 (자택): {perpetrator.homePhone || '[자택 전화]'}</p>
                <p>전화 (사무실): {perpetrator.officePhone || '[사무실 전화]'}</p>
                <p>이메일: {perpetrator.email || '[이메일]'}</p>
                <p>기타사항: [기타사항]</p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <Layout>
      <div className="flex h-screen bg-[#F5F3EB]">
        {/* Left Sidebar */}
        <div className="w-96 bg-white border-r border-[#CFB982] overflow-y-auto custom-scrollbar">
          <div className="p-6 space-y-6">
            {/* Document Type Selection */}
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-3">문서 유형 선택</h3>
              <div className="space-y-3">
                {[
                  { id: 'notice', label: '내용증명서' },
                  { id: 'agreement', label: '합의서' },
                  { id: 'complaint', label: '고소장' }
                ].map((type) => (
                  <label key={type.id} className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                    <input
                      type="radio"
                      name="documentType"
                      checked={documentType === type.id}
                      onChange={() => setDocumentType(type.id as DocumentType)}
                      className="w-4 h-4 text-indigo-600 border-slate-300 focus:ring-indigo-500"
                    />
                    <span className="text-sm font-medium text-slate-700">{type.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Perpetrator Input */}
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-3">가해자</h3>
              <div className="space-y-3">
                <Input
                  label="성명"
                  value={perpetrator.name}
                  onChange={(e) => setPerpetrator({ ...perpetrator, name: e.target.value })}
                  placeholder="가해자 성명"
                />
                <Input
                  label="생년월일"
                  type="date"
                  value={perpetrator.birthDate}
                  onChange={(e) => setPerpetrator({ ...perpetrator, birthDate: e.target.value })}
                />
                <Input
                  label="주소"
                  value={perpetrator.address}
                  onChange={(e) => setPerpetrator({ ...perpetrator, address: e.target.value })}
                  placeholder="가해자 주소"
                />
                <Input
                  label="직업"
                  value={perpetrator.occupation}
                  onChange={(e) => setPerpetrator({ ...perpetrator, occupation: e.target.value })}
                  placeholder="직업"
                />
                <Input
                  label="전화 (휴대폰)"
                  value={perpetrator.phone}
                  onChange={(e) => setPerpetrator({ ...perpetrator, phone: e.target.value })}
                  placeholder="휴대폰 번호"
                />
                <Input
                  label="전화 (자택)"
                  value={perpetrator.homePhone}
                  onChange={(e) => setPerpetrator({ ...perpetrator, homePhone: e.target.value })}
                  placeholder="자택 전화번호"
                />
                <Input
                  label="전화 (사무실)"
                  value={perpetrator.officePhone}
                  onChange={(e) => setPerpetrator({ ...perpetrator, officePhone: e.target.value })}
                  placeholder="사무실 전화번호"
                />
                <Input
                  label="이메일"
                  type="email"
                  value={perpetrator.email}
                  onChange={(e) => setPerpetrator({ ...perpetrator, email: e.target.value })}
                  placeholder="이메일 주소"
                />
              </div>
            </div>

            {/* Victim Input */}
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-3">피해자</h3>
              <div className="space-y-3">
                <Input
                  label="성명"
                  value={victim.name}
                  onChange={(e) => setVictim({ ...victim, name: e.target.value })}
                  placeholder="피해자 성명"
                />
                <Input
                  label="생년월일"
                  type="date"
                  value={victim.birthDate}
                  onChange={(e) => setVictim({ ...victim, birthDate: e.target.value })}
                />
                <Input
                  label="주소"
                  value={victim.address}
                  onChange={(e) => setVictim({ ...victim, address: e.target.value })}
                  placeholder="피해자 주소"
                />
                <Input
                  label="직업"
                  value={victim.occupation}
                  onChange={(e) => setVictim({ ...victim, occupation: e.target.value })}
                  placeholder="직업"
                />
                <Input
                  label="전화 (휴대폰)"
                  value={victim.phone}
                  onChange={(e) => setVictim({ ...victim, phone: e.target.value })}
                  placeholder="휴대폰 번호"
                />
                <Input
                  label="전화 (자택)"
                  value={victim.homePhone}
                  onChange={(e) => setVictim({ ...victim, homePhone: e.target.value })}
                  placeholder="자택 전화번호"
                />
                <Input
                  label="전화 (사무실)"
                  value={victim.officePhone}
                  onChange={(e) => setVictim({ ...victim, officePhone: e.target.value })}
                  placeholder="사무실 전화번호"
                />
                <Input
                  label="이메일"
                  type="email"
                  value={victim.email}
                  onChange={(e) => setVictim({ ...victim, email: e.target.value })}
                  placeholder="이메일 주소"
                />
              </div>
            </div>

            {/* 사건의 경위 */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-bold text-slate-900">사건의 경위</h3>
                <span className="text-xs text-slate-500">2 / 10</span>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">본인과 상대방의 관계</label>
                  <select
                    value={relationship}
                    onChange={(e) => setRelationship(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">---선택---</option>
                    <option value="가족">가족</option>
                    <option value="친구">친구</option>
                    <option value="지인">지인</option>
                    <option value="모르는사람">모르는 사람</option>
                    <option value="업무관계">업무 관계</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">사건이 일어난 날</label>
                    <Input
                      type="date"
                      value={incidentDate}
                      onChange={(e) => setIncidentDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">사건이 일어난 시각</label>
                    <Input
                      value={incidentTime}
                      onChange={(e) => setIncidentTime(e.target.value)}
                      placeholder="오후 10시 경"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">사건이 일어난 장소</label>
                  <select
                    value={incidentPlace}
                    onChange={(e) => setIncidentPlace(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">---선택---</option>
                    <option value="집">집</option>
                    <option value="사무실">사무실</option>
                    <option value="공공장소">공공장소</option>
                    <option value="온라인">온라인</option>
                    <option value="기타">기타</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 관할 경찰서 */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900">관할 경찰서</h3>
                  <Info className="w-4 h-4 text-slate-400" />
                </div>
                <span className="text-xs text-slate-500">7 / 10</span>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">직접 입력</label>
                <Input
                  value={policeStation}
                  onChange={(e) => setPoliceStation(e.target.value)}
                  placeholder="영등포경찰서 형사팀"
                />
              </div>
            </div>

            {/* 첨부할 증거 */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-bold text-slate-900">첨부할 증거</h3>
                <span className="text-xs text-slate-500">6 / 10</span>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-3">확보한 증거</p>
                <div className="space-y-2">
                  {[
                    '사건이 촬영된 CCTV 및 영상파일',
                    '목격자의 진술서',
                    '직접입력'
                  ].map((item) => (
                    <label key={item} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={evidence.includes(item)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setEvidence([...evidence, item]);
                          } else {
                            setEvidence(evidence.filter((e) => e !== item));
                          }
                        }}
                        className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                      />
                      <span className="text-sm text-slate-700">{item}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Additional Fields for Notice */}
            {documentType === 'notice' && (
              <div className="space-y-4">
                <Input
                  label="계약한 날"
                  type="date"
                  value={contractDate}
                  onChange={(e) => setContractDate(e.target.value)}
                />
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">임대차 계약기간</label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="date"
                      value={leaseStart}
                      onChange={(e) => setLeaseStart(e.target.value)}
                    />
                    <span>~</span>
                    <Input
                      type="date"
                      value={leaseEnd}
                      onChange={(e) => setLeaseEnd(e.target.value)}
                    />
                  </div>
                </div>
                <Input
                  label="임차한 대상"
                  value={property}
                  onChange={(e) => setProperty(e.target.value)}
                  placeholder="서울 강남구 테헤란로 1004 잘사는 빌리지 3층"
                />
                <Input
                  label="임차보증금"
                  value={deposit}
                  onChange={(e) => setDeposit(e.target.value)}
                  placeholder="100,000,000"
                />
                <Input
                  label="월세"
                  value={monthlyRent}
                  onChange={(e) => setMonthlyRent(e.target.value)}
                  placeholder="2,000,000"
                />
              </div>
            )}
          </div>
        </div>

        {/* Right Document Preview */}
        <div className="flex-1 flex flex-col bg-slate-50">
          {/* Header */}
          <div className="bg-white border-b border-[#CFB982] px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold text-slate-900">
                {documentType === 'notice' && '내용증명(보증금 반환 청구)'}
                {documentType === 'agreement' && '합의서'}
                {documentType === 'complaint' && '고소장'}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <Star className="w-5 h-5 text-slate-600" />
              </button>
              <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <span className="text-sm text-slate-700">법률문서 선택하기</span>
              </button>
            </div>
          </div>

          {/* Document Preview */}
          <div className="flex-1 overflow-y-auto p-8">
            <div className="max-w-4xl mx-auto bg-white shadow-lg min-h-[800px] p-12 relative">
              {showSample && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="text-6xl font-bold text-slate-200 opacity-20 rotate-[-45deg]">Sample</span>
                </div>
              )}
              <div className="relative z-10">
                {renderDocument()}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-white border-t border-[#CFB982] px-6 py-4 flex items-center justify-between">
            <button
              onClick={() => setShowSample(!showSample)}
              className="flex items-center gap-2 text-sm text-slate-700 hover:text-slate-900 transition-colors"
            >
              <X className="w-4 h-4" />
              샘플 문서 {showSample ? '닫기' : '열기'}
            </button>
            <Button
              onClick={() => {
                // Save functionality
                alert('문서가 저장되었습니다.');
              }}
              leftIcon={<Save className="w-4 h-4" />}
            >
              저장하기
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
