import { useState, useRef, useEffect } from 'react';
import { Layout } from '../components/ui/Layout';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Plus, ArrowUp, Download, ChevronLeft, ChevronRight, Minus } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const A4_HEIGHT = 1123; // A4 용지 높이 (px)

export function GosoDocument() {
  const [complainant, setComplainant] = useState({ 
    name: '', 
    address: '', 
    phone: ''
  });
  const [defendant, setDefendant] = useState({ 
    name: '', 
    address: '', 
    phone: ''
  });
  const [complaintPurpose, setComplaintPurpose] = useState('');
  const [crimeFacts, setCrimeFacts] = useState('');
  const [complaintReason, setComplaintReason] = useState('');
  const [evidence, setEvidence] = useState<string[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isComplainantOpen, setIsComplainantOpen] = useState(false);
  const [isDefendantOpen, setIsDefendantOpen] = useState(false);
  const documentRef = useRef<HTMLDivElement>(null);
  const [pages, setPages] = useState<number[]>([1]);

  useEffect(() => {
    if (documentRef.current) {
      const contentHeight = documentRef.current.scrollHeight;
      const pageCount = Math.ceil(contentHeight / A4_HEIGHT) || 1;
      setPages(Array.from({ length: pageCount }, (_, i) => i + 1));
    }
  }, [complainant, defendant, complaintPurpose, crimeFacts, complaintReason, evidence]);

  const renderDocumentContent = () => {
    return (
      <div className="p-12 space-y-6 text-slate-800 leading-relaxed" ref={documentRef}>
        <h2 className="text-2xl font-bold text-center mb-8">고소장</h2>
        
        <div className="space-y-6 text-sm">
          {/* 고소인 */}
          <div>
            <p className="font-semibold mb-3">1. 고소인 (나)*</p>
            <div className="space-y-2">
              <p>성명: {complainant.name || '[고소인 성명]'}</p>
              <p>주소: {complainant.address || '[고소인 주소]'}</p>
              <p>연락처: {complainant.phone || '[고소인 연락처]'}</p>
            </div>
          </div>

          {/* 피고소인 */}
          <div>
            <p className="font-semibold mb-3">2. 피고소인 (상대방)*</p>
            <div className="space-y-2">
              <p>성명: {defendant.name || '[피고소인 성명] (모르면 "성명불상")'}</p>
              <p>주소: {defendant.address || '[피고소인 주소] (아는 정보만 기재)'}</p>
              <p>연락처: {defendant.phone || '[피고소인 연락처] (있는 경우)'}</p>
            </div>
          </div>

          {/* 고소 취지 */}
          <div>
            <p className="font-semibold mb-3">3. 고소 취지</p>
            <p className="leading-relaxed">
              {complaintPurpose || `피고소인을 [사기/폭행/모욕] 혐의로 고소하오니 처벌하여 주시기 바랍니다.`}
            </p>
          </div>

          {/* 범죄 사실 */}
          <div>
            <p className="font-semibold mb-3">4. 범죄 사실 (핵심)</p>
            <p className="text-xs text-gray-600 mb-2">※ 시간 순서대로 피고소인이 어떤 불법 행위를 했는지 구체적으로 서술하세요.</p>
            <div className="space-y-2 leading-relaxed">
              {crimeFacts ? (
                <p>{crimeFacts}</p>
              ) : (
                <p className="text-gray-500 italic">
                  예시: 피고소인은 202X년 X월 X일, 고소인에게 욕설을 하며 주먹으로 얼굴을 1회 가격하였습니다.
                </p>
              )}
            </div>
          </div>

          {/* 고소 이유 */}
          <div>
            <p className="font-semibold mb-3">5. 고소 이유</p>
            <p className="leading-relaxed">
              {complaintReason || '[왜 고소를 하게 되었는지 - 피해의 심각성, 반성 없음 등]'}
            </p>
          </div>

          {/* 증거 자료 */}
          <div>
            <p className="font-semibold mb-3">6. 증거 자료</p>
            <div className="space-y-1">
              {evidence.length > 0 ? (
                <ul className="list-disc list-inside space-y-1">
                  {evidence.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 italic">
                  [진단서, 녹취록, 사진, 문자 내역 등 첨부 목록을 작성하세요]
                </p>
              )}
            </div>
          </div>
        </div>

        {/* 안내 문구 */}
        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-xs text-yellow-800">
            <strong>💡 개발 Tip:</strong> 일반인은 '범죄 사실'을 법률 용어로 쓰기 어려워합니다. 따라서 AI가 "언제, 어디서, 누가, 무엇을 했나요?"라고 묻고, 이를 바탕으로 법률 문장으로 변환해 주는 기능이 들어가면 서비스의 핵심 가치가 될 것입니다.
          </p>
        </div>
      </div>
    );
  };

  const handleDownloadPDF = async () => {
    if (!documentRef.current) return;

    try {
      const canvas = await html2canvas(documentRef.current, {
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

      pdf.save('고소장.pdf');
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
            {/* Complainant Input */}
            <div className="border border-slate-200 rounded-lg">
              <button
                onClick={() => setIsComplainantOpen(!isComplainantOpen)}
                className="w-full flex items-center justify-between p-4 text-base font-bold text-slate-900 hover:bg-slate-50 transition-colors rounded-lg"
              >
                <span>고소인 (나)</span>
                {isComplainantOpen ? <Minus className="w-5 h-5 text-slate-600" /> : <Plus className="w-5 h-5 text-slate-600" />}
              </button>
              {isComplainantOpen && (
                <div className="px-4 pb-4 space-y-3">
                  <Input
                    label="성명"
                    value={complainant.name}
                    onChange={(e) => setComplainant({ ...complainant, name: e.target.value })}
                    placeholder="고소인 성명"
                  />
                  <Input
                    label="주소"
                    value={complainant.address}
                    onChange={(e) => setComplainant({ ...complainant, address: e.target.value })}
                    placeholder="고소인 주소"
                  />
                  <Input
                    label="연락처"
                    value={complainant.phone}
                    onChange={(e) => setComplainant({ ...complainant, phone: e.target.value })}
                    placeholder="고소인 연락처"
                  />
                </div>
              )}
            </div>

            {/* Defendant Input */}
            <div className="border border-slate-200 rounded-lg">
              <button
                onClick={() => setIsDefendantOpen(!isDefendantOpen)}
                className="w-full flex items-center justify-between p-4 text-base font-bold text-slate-900 hover:bg-slate-50 transition-colors rounded-lg"
              >
                <span>피고소인 (상대방)</span>
                {isDefendantOpen ? <Minus className="w-5 h-5 text-slate-600" /> : <Plus className="w-5 h-5 text-slate-600" />}
              </button>
              {isDefendantOpen && (
                <div className="px-4 pb-4 space-y-3">
                  <Input
                    label="성명"
                    value={defendant.name}
                    onChange={(e) => setDefendant({ ...defendant, name: e.target.value })}
                    placeholder="피고소인 성명"
                  />
                  <Input
                    label="주소"
                    value={defendant.address}
                    onChange={(e) => setDefendant({ ...defendant, address: e.target.value })}
                    placeholder="피고소인 주소"
                  />
                  <Input
                    label="연락처"
                    value={defendant.phone}
                    onChange={(e) => setDefendant({ ...defendant, phone: e.target.value })}
                    placeholder="피고소인 연락처"
                  />
                </div>
              )}
            </div>

            {/* 고소장 전용 필드 */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">고소 취지</label>
                <textarea
                  value={complaintPurpose}
                  onChange={(e) => setComplaintPurpose(e.target.value)}
                  placeholder="예: 피고소인을 [사기/폭행/모욕] 혐의로 고소하오니 처벌하여 주시기 바랍니다."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[80px] resize-none"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">범죄 사실 (시간 순서대로 구체적으로 서술)</label>
                <textarea
                  value={crimeFacts}
                  onChange={(e) => setCrimeFacts(e.target.value)}
                  placeholder="예: 피고소인은 202X년 X월 X일, 고소인에게 욕설을 하며 주먹으로 얼굴을 1회 가격하였습니다."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[120px] resize-none"
                  rows={5}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">고소 이유</label>
                <textarea
                  value={complaintReason}
                  onChange={(e) => setComplaintReason(e.target.value)}
                  placeholder="왜 고소를 하게 되었는지 (피해의 심각성, 반성 없음 등)"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[80px] resize-none"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">증거 자료</label>
                <div className="space-y-2">
                  {['진단서', '녹취록', '사진', '문자 내역', '기타'].map((item) => (
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
          </div>
        </div>

        {/* Right Document Preview */}
        <div className="flex-1 flex flex-col bg-slate-50">
          <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm">
            <h1 className="text-xl font-semibold text-slate-900">고소장</h1>
            <Button
              onClick={handleDownloadPDF}
              leftIcon={<Download className="w-4 h-4" />}
              className="bg-indigo-600 text-white hover:bg-indigo-700"
            >
              PDF 다운로드
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-8">
            <div className="max-w-4xl mx-auto">
              {pages.map((pageNum) => (
                <div
                  key={pageNum}
                  className="bg-white shadow-lg p-12 mb-8"
                  style={{
                    minHeight: `${A4_HEIGHT}px`,
                    maxHeight: `${A4_HEIGHT}px`,
                    overflow: 'hidden',
                    pageBreakAfter: pageNum < pages.length ? 'always' : 'auto',
                    breakAfter: pageNum < pages.length ? 'page' : 'auto'
                  }}
                >
                  {pageNum === 1 ? renderDocumentContent() : (
                    <div className="p-12 space-y-6 text-slate-800 leading-relaxed">
                      <p className="text-sm text-gray-500">(이어서)</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
