import { useState, useRef, useEffect } from 'react';
import { Layout } from '../components/ui/Layout';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Plus, Download, ChevronLeft, ChevronRight, Minus, Edit2, Save, X } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const A4_HEIGHT = 1123; // A4 용지 높이 (px)

export function AgreeDocument() {
  const [perpetrator, setPerpetrator] = useState({ 
    name: '', 
    address: '', 
    phone: '',
    birthDate: ''
  });
  const [victim, setVictim] = useState({ 
    name: '', 
    address: '', 
    phone: '',
    birthDate: ''
  });
  const [caseNumber, setCaseNumber] = useState('');
  const [incidentDate, setIncidentDate] = useState('');
  const [incidentTime, setIncidentTime] = useState('');
  const [incidentPlace, setIncidentPlace] = useState('');
  const [settlementAmount, setSettlementAmount] = useState('');
  const [settlementDate, setSettlementDate] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isPerpetratorOpen, setIsPerpetratorOpen] = useState(false);
  const [isVictimOpen, setIsVictimOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [customContent, setCustomContent] = useState('');
  
  // documentRef 위치 변경을 위해 변수명 명확화 (viewModeRef)
  const documentRef = useRef<HTMLDivElement>(null); 
  const editableRef = useRef<HTMLDivElement>(null);
  const [pages, setPages] = useState<number[]>([1]);

  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, '0');
  const day = String(currentDate.getDate()).padStart(2, '0');
  const formattedDate = `${year}년 ${month}월 ${day}일`;

  // [수정됨] 편집 모드 진입 시 내용 주입 로직 개선
  useEffect(() => {
    if (isEditMode && editableRef.current) {
      // 에디터가 비어있을 때만 내용을 채움
      if (editableRef.current.innerHTML.trim() === '') {
        editableRef.current.innerHTML = customContent;
      }
    }
  }, [isEditMode, customContent]);

  // 페이지 분할을 위한 높이 계산
  useEffect(() => {
    const targetRef = isEditMode ? editableRef : documentRef;
    if (targetRef.current) {
      const contentHeight = targetRef.current.scrollHeight;
      const pageCount = Math.ceil(contentHeight / A4_HEIGHT) || 1;
      setPages(Array.from({ length: pageCount }, (_, i) => i + 1));
    }
  }, [perpetrator, victim, caseNumber, incidentDate, incidentTime, incidentPlace, settlementAmount, settlementDate, isEditMode, customContent]);

  const handleEditMode = () => {
    if (!isEditMode) {
      if (documentRef.current) {
        // [수정됨] 내부 HTML만 가져옴 (Wrapper의 스타일은 컨테이너에 있으므로 내용만 복사)
        const currentContent = documentRef.current.innerHTML;
        setCustomContent(currentContent);
        setIsEditMode(true);
      }
    } else {
      handleSaveEdit();
    }
  };

  const handleSaveEdit = () => {
    if (editableRef.current) {
      setCustomContent(editableRef.current.innerHTML);
    }
    setIsEditMode(false);
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
  };

  // [수정됨] 렌더링 함수: 패딩(p-12)과 ref 제거 (부모 컨테이너가 담당)
  const renderDocumentContent = (useCustom: boolean = false) => {
    if (useCustom && customContent) {
      return <div dangerouslySetInnerHTML={{ __html: customContent }} />;
    }
    
    return (
      // 기존에 있던 className="p-12..." 및 ref={documentRef} 제거
      <>
        <h2 className="text-2xl font-bold text-center mb-8">합의서</h2>
        
        {/* 사건 정보 */}
        {(caseNumber || incidentDate || incidentPlace) && (
          <div className="mb-6 pb-4 border-b border-gray-300">
            <p className="font-semibold mb-2">사건 정보</p>
            <div className="space-y-1 text-sm">
              {caseNumber && <p>사건 번호: {caseNumber}</p>}
              <p>사건 발생 일시: {incidentDate ? `${incidentDate} ${incidentTime ? `${incidentTime}` : ''}` : '[사건 발생 일시]'}</p>
              <p>사건 발생 장소: {incidentPlace || '[사건 발생 장소]'}</p>
            </div>
          </div>
        )}

        {/* 당사자 정보 */}
        <div className="space-y-6">
          <div>
            <p className="font-semibold mb-3">갑 (가해자)</p>
            <div className="space-y-2 text-sm">
              <p>성 명: {perpetrator.name || '[가해자 성명]'}</p>
              <p>주민등록번호 (또는 생년월일): {perpetrator.birthDate || '[주민등록번호 또는 생년월일]'}</p>
              <p>주 소: {perpetrator.address || '[가해자 주소]'}</p>
              <p>연락처: {perpetrator.phone || '[가해자 연락처]'}</p>
            </div>
          </div>

          <div>
            <p className="font-semibold mb-3">을 (피해자)</p>
            <div className="space-y-2 text-sm">
              <p>성 명: {victim.name || '[피해자 성명]'}</p>
              <p>주민등록번호 (또는 생년월일): {victim.birthDate || '[주민등록번호 또는 생년월일]'}</p>
              <p>주 소: {victim.address || '[피해자 주소]'}</p>
              <p>연락처: {victim.phone || '[피해자 연락처]'}</p>
            </div>
          </div>

          {/* 합의 내용 */}
          <div className="mt-8 space-y-4">
            <p className="font-semibold mb-3">합의 내용</p>
            <div className="space-y-3 text-sm leading-relaxed">
              <p>1. 갑은 을에게 금 {settlementAmount || '[합의금 액수]'}원을 {settlementDate ? `${settlementDate}까지` : '[지급 기일]까지'} 지급한다.</p>
              <p>2. 을은 갑의 처벌을 원하지 않는다.</p>
              <p>3. 향후 본 사건과 관련하여 민·형사상 어떠한 이의도 제기하지 않는다.</p>
            </div>
          </div>

          {/* 날짜 및 서명 */}
          <div className="mt-12 space-y-6">
            <div className="text-right">
              <p className="text-sm mb-8">작성일: {formattedDate}</p>
              <div className="flex justify-end gap-12">
                <div className="text-center">
                  <p className="text-sm mb-12">갑 (인)</p>
                  <p className="text-sm">{perpetrator.name || '[가해자 성명]'}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm mb-12">을 (인)</p>
                  <p className="text-sm">{victim.name || '[피해자 성명]'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* 안내 문구 */}
          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-xs text-yellow-800">
              <strong>안내:</strong> 합의서는 인감증명서가 첨부되어야 효력이 확실합니다. 인감증명서를 꼭 준비하세요.
            </p>
          </div>
        </div>
      </>
    );
  };

  const handleDownloadPDF = async () => {
    const targetRef = isEditMode ? editableRef : documentRef;
    if (!targetRef.current) return;

    try {
      const canvas = await html2canvas(targetRef.current, {
        // @ts-ignore
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save('합의서.pdf');
    } catch (error) {
      console.error('PDF 생성 실패:', error);
      alert('PDF 저장 중 오류가 발생했습니다.');
    }
  };

  return (
    <Layout>
      <div className="flex h-screen">
        {/* Left Sidebar */}
        <div className={`${isSidebarOpen ? 'w-96' : 'w-0'} bg-white border-r border-[#CFB982] overflow-hidden transition-all duration-300 relative`}>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`absolute top-4 ${isSidebarOpen ? 'right-4' : '-right-12'} z-50 w-8 h-8 bg-white border border-slate-300 rounded-lg shadow-md flex items-center justify-center hover:bg-slate-50 transition-all duration-300`}
          >
            {isSidebarOpen ? <ChevronLeft className="w-5 h-5 text-slate-600" /> : <ChevronRight className="w-5 h-5 text-slate-600" />}
          </button>
          
          <div className={`p-6 space-y-6 overflow-y-auto custom-scrollbar h-full ${!isSidebarOpen ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}>
            {/* Input Fields (Perpetrator, Victim, etc...) - 생략하지 않고 유지 */}
            <div className="border border-slate-200 rounded-lg">
              <button
                onClick={() => setIsPerpetratorOpen(!isPerpetratorOpen)}
                className="w-full flex items-center justify-between p-4 text-base font-bold text-slate-900 hover:bg-slate-50 transition-colors rounded-lg"
              >
                <span>갑 (가해자)</span>
                {isPerpetratorOpen ? <Minus className="w-5 h-5 text-slate-600" /> : <Plus className="w-5 h-5 text-slate-600" />}
              </button>
              {isPerpetratorOpen && (
                <div className="px-4 pb-4 space-y-3">
                  <Input label="성명" value={perpetrator.name} onChange={(e) => setPerpetrator({ ...perpetrator, name: e.target.value })} placeholder="가해자 성명" />
                  <Input label="생년월일" type="date" value={perpetrator.birthDate} onChange={(e) => setPerpetrator({ ...perpetrator, birthDate: e.target.value })} />
                  <Input label="주소" value={perpetrator.address} onChange={(e) => setPerpetrator({ ...perpetrator, address: e.target.value })} placeholder="가해자 주소" />
                  <Input label="연락처" value={perpetrator.phone} onChange={(e) => setPerpetrator({ ...perpetrator, phone: e.target.value })} placeholder="가해자 연락처" />
                </div>
              )}
            </div>

            <div className="border border-slate-200 rounded-lg">
              <button
                onClick={() => setIsVictimOpen(!isVictimOpen)}
                className="w-full flex items-center justify-between p-4 text-base font-bold text-slate-900 hover:bg-slate-50 transition-colors rounded-lg"
              >
                <span>을 (피해자)</span>
                {isVictimOpen ? <Minus className="w-5 h-5 text-slate-600" /> : <Plus className="w-5 h-5 text-slate-600" />}
              </button>
              {isVictimOpen && (
                <div className="px-4 pb-4 space-y-3">
                  <Input label="성명" value={victim.name} onChange={(e) => setVictim({ ...victim, name: e.target.value })} placeholder="피해자 성명" />
                  <Input label="생년월일" type="date" value={victim.birthDate} onChange={(e) => setVictim({ ...victim, birthDate: e.target.value })} />
                  <Input label="주소" value={victim.address} onChange={(e) => setVictim({ ...victim, address: e.target.value })} placeholder="피해자 주소" />
                  <Input label="연락처" value={victim.phone} onChange={(e) => setVictim({ ...victim, phone: e.target.value })} placeholder="피해자 연락처" />
                </div>
              )}
            </div>

            <div className="space-y-4">
              <Input label="사건 번호 (있을 경우)" value={caseNumber} onChange={(e) => setCaseNumber(e.target.value)} placeholder="사건 번호" />
              <Input label="사건 발생 일시" type="date" value={incidentDate} onChange={(e) => setIncidentDate(e.target.value)} />
              <Input label="사건 발생 시각" value={incidentTime} onChange={(e) => setIncidentTime(e.target.value)} placeholder="오후 10시 경" />
              <Input label="사건 발생 장소" value={incidentPlace} onChange={(e) => setIncidentPlace(e.target.value)} placeholder="사건 발생 장소" />
              <Input label="합의금 액수" value={settlementAmount} onChange={(e) => setSettlementAmount(e.target.value)} placeholder="예: 3,000,000" />
              <Input label="지급 기일" type="date" value={settlementDate} onChange={(e) => setSettlementDate(e.target.value)} />
            </div>
          </div>
        </div>

        {/* Right Document Preview */}
        <div className="flex-1 flex flex-col bg-slate-50">
          <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm">
            <h1 className="text-xl font-semibold text-slate-900">합의서</h1>
            <div className="flex gap-3">
              <Button
                onClick={handleEditMode}
                leftIcon={isEditMode ? <Save className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
                className={isEditMode ? "bg-indigo-600 text-white hover:bg-indigo-700" : "bg-gray-600 text-white hover:bg-gray-700"}
              >
                {isEditMode ? '저장하기' : '직접 수정하기'}
              </Button>
              {!isEditMode && (
                <Button
                  onClick={handleDownloadPDF}
                  leftIcon={<Download className="w-4 h-4" />}
                  className="bg-indigo-600 text-white hover:bg-indigo-700"
                >
                  PDF 다운로드
                </Button>
              )}
              {isEditMode && (
                <Button
                  onClick={handleCancelEdit}
                  leftIcon={<X className="w-4 h-4" />}
                  variant="outline"
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  취소
                </Button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-8">
            <div className="max-w-4xl mx-auto">
              {isEditMode ? (
                pages.map((pageNum) => (
                  <div
                    key={pageNum}
                    ref={pageNum === 1 ? editableRef : null}
                    contentEditable={pageNum === 1}
                    suppressContentEditableWarning={pageNum === 1}
                    // [수정됨] 편집 모드에서도 표준 모드와 동일한 스타일(패딩, 간격) 적용
                    className="bg-white shadow-lg p-12 space-y-6 mb-8 outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded text-slate-800 leading-relaxed"
                    style={{
                      minHeight: `${A4_HEIGHT}px`,
                      maxHeight: pageNum === 1 ? 'none' : `${A4_HEIGHT}px`,
                      overflow: pageNum === 1 ? 'visible' : 'hidden',
                      pageBreakAfter: pageNum < pages.length ? 'always' : 'auto',
                      breakAfter: pageNum < pages.length ? 'page' : 'auto'
                    }}
                    onInput={() => {
                      if (editableRef.current) {
                        const contentHeight = editableRef.current.scrollHeight;
                        const pageCount = Math.ceil(contentHeight / A4_HEIGHT) || 1;
                        setPages(Array.from({ length: pageCount }, (_, i) => i + 1));
                      }
                    }}
                  >
                    {pageNum === 1 ? null : (
                      <div className="p-12 space-y-6 text-slate-800 leading-relaxed">
                        <p className="text-sm text-gray-500">(이어서)</p>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                pages.map((pageNum) => (
                  <div
                    key={pageNum}
                    // [수정됨] documentRef를 최상위 컨테이너로 이동하여 PDF 저장 시 패딩 포함
                    ref={pageNum === 1 ? documentRef : null}
                    // [수정됨] 표준 모드에서도 편집 모드와 동일한 스타일 적용 (p-12, space-y-6)
                    className="bg-white shadow-lg p-12 space-y-6 mb-8 text-slate-800 leading-relaxed"
                    style={{
                      minHeight: `${A4_HEIGHT}px`,
                      maxHeight: `${A4_HEIGHT}px`,
                      overflow: 'hidden',
                      pageBreakAfter: pageNum < pages.length ? 'always' : 'auto',
                      breakAfter: pageNum < pages.length ? 'page' : 'auto'
                    }}
                  >
                    {pageNum === 1 ? renderDocumentContent(!isEditMode && customContent.length > 0) : (
                      <div className="space-y-6">
                        <p className="text-sm text-gray-500">(이어서)</p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}