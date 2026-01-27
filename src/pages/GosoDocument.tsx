import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Layout } from '../components/ui/Layout';
import { Button } from '../components/ui/Button';
import { Download, ArrowUp, RotateCcw, Loader2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { caseService } from '../api';
import ReactMarkdown from 'react-markdown';

export default function GosoDocument() {
  const location = useLocation();
  const navigate = useNavigate();
  const [chatInput, setChatInput] = useState('');
  const [documentContent, setDocumentContent] = useState('');
  const [documentId, setDocumentId] = useState<number | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'ai'; content: string }>>([]);
  const [chatHeight, setChatHeight] = useState(300);
  const [isResizing, setIsResizing] = useState(false);

  const documentRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const { case_id, precedent_id } = (location.state as any) || {};

  useEffect(() => {
    const initDocument = async () => {
      if (!case_id || !precedent_id) {
        alert("사건 정보가 부족합니다. 분석 결과 페이지에서 다시 시도해주세요.");
        navigate(-1);
        return;
      }
      setIsGenerating(true);
      try {
        const response = await caseService.generateDocument('complaint', {
          case_id: Number(case_id),
          precedent: String(precedent_id),
        });
        if (response && response.document_id) {
          setDocumentId(response.document_id);
          setDocumentContent(response.content);
          setChatMessages([{ role: 'ai', content: '분석된 법리를 바탕으로 고소장 초안을 작성했습니다. 수정 사항을 말씀해주세요!' }]);
        }
      } catch (error) {
        alert('고소장 초안 생성 중 오류가 발생했습니다.');
      } finally {
        setIsGenerating(false);
      }
    };
    initDocument();
  }, [case_id, precedent_id, navigate]);

  const handleSend = async () => {
    if (chatInput.trim().length < 5 || !documentId) return;
    const userMessage = chatInput.trim();
    setChatMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setChatInput('');
    setIsStreaming(true);
    try {
      const response = await caseService.updateDocument('complaint', {
        document_id: documentId,
        user_request: userMessage,
      });
      if (response && response.content) {
        setDocumentContent(response.content);
        setChatMessages((prev) => [...prev, { role: 'ai', content: '요청하신 내용을 반영하여 고소장을 수정했습니다.' }]);
      }
    } catch (error) {
      alert('문서 수정 중 오류가 발생했습니다.');
    } finally {
      setIsStreaming(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!documentRef.current) return;

    try {
      // 문서 전체 캡처
      const canvas = await html2canvas(documentRef.current, { 
        scale: 2, 
        useCORS: true,
        backgroundColor: "#ffffff" // 배경 흰색 고정
      });
      
      const imgData = canvas.toDataURL('image/png');
      
      // A4 크기 기준 계산 (mm)
      const imgWidth = 210; // A4 너비
      const pageHeight = 297; // A4 높이
      const imgHeight = (canvas.height * imgWidth) / canvas.width; // 비율에 맞춘 전체 이미지 높이
      
      let heightLeft = imgHeight;
      let position = 0;

      const pdf = new jsPDF('p', 'mm', 'a4');

      // 첫 페이지 출력
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // 내용이 남았다면 페이지 추가 루프
      while (heightLeft > 0) {
        position -= pageHeight; // 이미지를 위로 올림
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`고소장_${case_id || 'draft'}.pdf`);
    } catch (error) {
      console.error(error);
      alert('PDF 저장 중 오류가 발생했습니다.');
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => { e.preventDefault(); setIsResizing(true); };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const newHeight = window.innerHeight - e.clientY;
      setChatHeight(Math.max(200, Math.min(window.innerHeight - 100, newHeight)));
    };
    const handleMouseUp = () => setIsResizing(false);
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing]);

  return (
    <Layout>
      <div className="h-[calc(100vh-65px)] -mt-5 bg-slate-50 flex flex-col overflow-hidden relative">
        <header className="border-b border-gray-200 bg-white flex-shrink-0">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">고소장 작성</h1>
              <p className="text-xs text-gray-500 mt-1">참조판례: {precedent_id || 'N/A'}</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleDownloadPDF} size="sm" className="bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-200/60">
                <Download className="w-4 h-4 mr-2" /> PDF 저장
              </Button>
              <Button onClick={() => window.location.reload()} size="sm" variant="outline">
                <RotateCcw className="w-4 h-4 mr-2" /> 초기화
              </Button>
            </div>
          </div>
        </header>

        <div className="flex-1 bg-slate-100 p-8 overflow-auto pb-40">
          {isGenerating ? (
            <div className="h-full flex flex-col items-center justify-center">
              <Loader2 className="animate-spin text-indigo-500 mb-4" size={48} />
              <p className="font-bold text-slate-600 text-lg">AI가 고소장을 작성 중입니다...</p>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto bg-white shadow-2xl rounded-sm p-[20mm] min-h-[297mm]" ref={documentRef}>
              <div className="font-serif text-slate-900 text-[11pt] leading-[1.8] whitespace-pre-wrap">
                <ReactMarkdown>{documentContent}</ReactMarkdown>
              </div>
            </div>
          )}
        </div>

        <div ref={chatContainerRef} className="bg-white border-t border-gray-200 flex flex-col absolute bottom-0 w-full z-10 shadow-lg" style={{ height: `${chatHeight}px` }}>
          <div onMouseDown={handleMouseDown} className="h-1.5 bg-gray-100 hover:bg-indigo-300 cursor-ns-resize transition-colors flex items-center justify-center">
             <div className="w-10 h-1 bg-gray-300 rounded-full" />
          </div>
          
          {/* --- 수정된 채팅 영역 --- */}
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            <div className="max-w-4xl mx-auto space-y-4">
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] p-3 rounded-xl text-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-800'}`}>
                    {msg.role === 'ai' && <div className="text-[10px] font-bold text-indigo-600 mb-1">AI 변호사</div>}
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))}
              {isStreaming && <div className="text-xs text-indigo-500 animate-pulse ml-2">문서를 업데이트하고 있습니다...</div>}
            </div>
          </div>
          {/* ---------------------- */}

          <div className="p-4 border-t bg-white">
            <div className="max-w-4xl mx-auto flex gap-2">
              <input className="flex-1 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 text-sm shadow-sm" value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} placeholder="수정하고 싶은 내용을 입력하세요..." />
              <button onClick={handleSend} disabled={isStreaming || chatInput.trim().length < 5} className="bg-indigo-600 text-white p-3 rounded-xl disabled:bg-slate-200 shadow-sm"><ArrowUp size={20} /></button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}