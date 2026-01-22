import { useState, useRef, useEffect } from 'react';
import { Layout } from '../components/ui/Layout';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Plus, Download, ChevronLeft, ChevronRight, Minus } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const A4_HEIGHT = 1123; // A4 용지 높이 (px)

export function ProofDocument() {
  const [sender, setSender] = useState({ 
    name: '', 
    address: ''
  });
  const [receiver, setReceiver] = useState({ 
    name: '', 
    address: ''
  });
  const [noticeTitle, setNoticeTitle] = useState('');
  const [factRelation, setFactRelation] = useState('');
  const [damageContent, setDamageContent] = useState('');
  const [noticeDemand, setNoticeDemand] = useState('');
  const [noticeDeadline, setNoticeDeadline] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSenderOpen, setIsSenderOpen] = useState(false);
  const [isReceiverOpen, setIsReceiverOpen] = useState(false);
  const documentRef = useRef<HTMLDivElement>(null);
  const [pages, setPages] = useState<number[]>([1]);

  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, '0');
  const day = String(currentDate.getDate()).padStart(2, '0');
  const formattedDate = `${year}년 ${month}월 ${day}일`;

  useEffect(() => {
    if (documentRef.current) {
      const contentHeight = documentRef.current.scrollHeight;
      const pageCount = Math.ceil(contentHeight / A4_HEIGHT) || 1;
      setPages(Array.from({ length: pageCount }, (_, i) => i + 1));
    }
  }, [sender, receiver, noticeTitle, factRelation, damageContent, noticeDemand, noticeDeadline]);

  const renderDocumentContent = () => {
    return (
      <div className="p-12 space-y-6 text-slate-800 leading-relaxed" ref={documentRef}>
        <h2 className="text-2xl font-bold text-center mb-8">내용증명</h2>
        
        <div className="space-y-6">
          {/* 발신인 */}
          <div>
            <p className="font-semibold mb-2">발신인 (보내는 사람)</p>
            <div className="space-y-1 text-sm">
              <p>성명: {sender.name || '[발신인 성명]'}</p>
              <p>주소: {sender.address || '[발신인 주소] (반송 시 필요)'}</p>
            </div>
          </div>

          {/* 수신인 */}
          <div>
            <p className="font-semibold mb-2">수신인 (받는 사람)</p>
            <div className="space-y-1 text-sm">
              <p>성명: {receiver.name || '[수신인 성명]'}</p>
              <p>주소: {receiver.address || '[수신인 주소] (정확해야 도달함)'}</p>
            </div>
          </div>

          {/* 제목 */}
          <div>
            <p className="font-semibold mb-2">제목</p>
            <p className="text-sm">{noticeTitle || '[예: 손해배상 청구의 건, 계약 이행 촉구의 건]'}</p>
          </div>

          {/* 본문 */}
          <div className="space-y-4 text-sm leading-relaxed">
            <p>1. <strong>사실 관계:</strong> {factRelation || '[언제, 어디서, 무슨 일이 있었는지 객관적 서술]'}</p>
            <p>2. <strong>피해 내용:</strong> {damageContent || '[상대방의 행위로 인해 내가 입은 구체적인 피해]'}</p>
            <p>3. <strong>요구 사항:</strong> {noticeDeadline ? `${noticeDeadline}까지` : '202X년 X월 X일까지'} {noticeDemand || '[금액 및 행동을 명시]'}을(를) 입금하라.</p>
            <p>4. <strong>최후통첩:</strong> 이행하지 않을 시 민·형사상 법적 조치를 취하겠다.</p>
          </div>

          {/* 날짜 및 서명 */}
          <div className="mt-8 text-right">
            <p className="text-sm mb-8">작성일: {formattedDate}</p>
            <p className="text-sm">발신인 (인)</p>
            <p className="text-sm mt-2">{sender.name || '[발신인 성명]'}</p>
          </div>

          {/* 안내 문구 */}
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-800">
              <strong>안내:</strong> 내용증명은 3부(우체국 보관용, 상대방 발송용, 본인 보관용)를 작성하는 것이 원칙입니다. 출력 시 3부를 준비하세요.
            </p>
          </div>
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

      pdf.save('내용증명서.pdf');
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
            {/* Sender Input */}
            <div className="border border-slate-200 rounded-lg">
              <button
                onClick={() => setIsSenderOpen(!isSenderOpen)}
                className="w-full flex items-center justify-between p-4 text-base font-bold text-slate-900 hover:bg-slate-50 transition-colors rounded-lg"
              >
                <span>발신인 (보내는 사람)</span>
                {isSenderOpen ? <Minus className="w-5 h-5 text-slate-600" /> : <Plus className="w-5 h-5 text-slate-600" />}
              </button>
              {isSenderOpen && (
                <div className="px-4 pb-4 space-y-3">
                  <Input
                    label="성명"
                    value={sender.name}
                    onChange={(e) => setSender({ ...sender, name: e.target.value })}
                    placeholder="발신인 성명"
                  />
                  <Input
                    label="주소"
                    value={sender.address}
                    onChange={(e) => setSender({ ...sender, address: e.target.value })}
                    placeholder="발신인 주소"
                  />
                </div>
              )}
            </div>

            {/* Receiver Input */}
            <div className="border border-slate-200 rounded-lg">
              <button
                onClick={() => setIsReceiverOpen(!isReceiverOpen)}
                className="w-full flex items-center justify-between p-4 text-base font-bold text-slate-900 hover:bg-slate-50 transition-colors rounded-lg"
              >
                <span>수신인 (받는 사람)</span>
                {isReceiverOpen ? <Minus className="w-5 h-5 text-slate-600" /> : <Plus className="w-5 h-5 text-slate-600" />}
              </button>
              {isReceiverOpen && (
                <div className="px-4 pb-4 space-y-3">
                  <Input
                    label="성명"
                    value={receiver.name}
                    onChange={(e) => setReceiver({ ...receiver, name: e.target.value })}
                    placeholder="수신인 성명"
                  />
                  <Input
                    label="주소"
                    value={receiver.address}
                    onChange={(e) => setReceiver({ ...receiver, address: e.target.value })}
                    placeholder="수신인 주소"
                  />
                </div>
              )}
            </div>

            {/* 내용증명서 전용 필드 */}
            <div className="space-y-4">
              <Input
                label="제목"
                value={noticeTitle}
                onChange={(e) => setNoticeTitle(e.target.value)}
                placeholder="예: 손해배상 청구의 건"
              />
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">사실 관계</label>
                <textarea
                  value={factRelation}
                  onChange={(e) => setFactRelation(e.target.value)}
                  placeholder="언제, 어디서, 무슨 일이 있었는지 객관적 서술"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[100px] resize-none"
                  rows={4}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">피해 내용</label>
                <textarea
                  value={damageContent}
                  onChange={(e) => setDamageContent(e.target.value)}
                  placeholder="상대방의 행위로 인해 내가 입은 구체적인 피해"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[100px] resize-none"
                  rows={4}
                />
              </div>
              <Input
                label="요구 사항 (금액 및 행동)"
                value={noticeDemand}
                onChange={(e) => setNoticeDemand(e.target.value)}
                placeholder="예: 3,000,000원을 입금하라"
              />
              <Input
                label="기한"
                type="date"
                value={noticeDeadline}
                onChange={(e) => setNoticeDeadline(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Right Document Preview */}
        <div className="flex-1 flex flex-col bg-slate-50">
          <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm">
            <h1 className="text-xl font-semibold text-slate-900">내용증명서</h1>
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
