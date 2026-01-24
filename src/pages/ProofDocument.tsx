import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Layout } from '../components/ui/Layout';
import { Button } from '../components/ui/Button';
import { Download, ArrowUp, RotateCcw } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { caseService } from '../api';
import type { StreamEventInfo, StreamEventChunk, StreamEventComplete } from '../api/types';

export default function ProofDocument() {
  const location = useLocation();
  const [chatInput, setChatInput] = useState('');
  const [documentContent, setDocumentContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [caseId, setCaseId] = useState<number | null>(null);
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'ai'; content: string }>>([]);
  const [chatHeight, setChatHeight] = useState(300);
  const [isResizing, setIsResizing] = useState(false);
  const documentRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const state = location.state as { caseId?: number } | null;
    if (state?.caseId) {
      setCaseId(state.caseId);
    }
  }, [location]);

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

  const handleSend = async () => {
    if (chatInput.trim().length < 15 || !caseId) return;

    const userMessage = chatInput.trim();
    setChatMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setChatInput('');
    setIsGenerating(true);

    try {
      const response = await caseService.generateDocument(caseId, {
        document_type: '내용증명',
        case_id: caseId,
      });

      if (response.status === 'success' && 'data' in response) {
        setDocumentContent(response.data.content);
        setIsGenerating(false);
        setIsStreaming(true);
        setChatMessages((prev) => [...prev, { 
          role: 'ai', 
          content: '법률문서생성 전용 AI입니다. 내용증명(대여금 청구용) 문서 생성을 시작하겠습니다. 발신인의 이름이 무엇인가요?' 
        }]);

        await caseService.modifyDocument(
          caseId,
          {
            document_id: response.data.document_id,
            user_answer: userMessage,
          },
          {
            onInfo: (event: StreamEventInfo) => {
              console.log('추출된 필드:', event.extracted_fields);
            },
            onChunk: (event: StreamEventChunk) => {
              setDocumentContent((prev) => prev + event.text);
            },
            onComplete: (event: StreamEventComplete) => {
              setIsStreaming(false);
              console.log('문서 수정 완료:', event);
            },
            onError: (error) => {
              setIsStreaming(false);
              console.error('문서 수정 오류:', error);
              alert('문서 생성 중 오류가 발생했습니다.');
            },
          }
        );
      } else {
        alert('문서 생성에 실패했습니다.');
        setIsGenerating(false);
      }
    } catch (error: any) {
      console.error('문서 생성 오류:', error);
      alert(error.message || '문서 생성 중 오류가 발생했습니다.');
      setIsGenerating(false);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const newHeight = window.innerHeight - e.clientY;
      const minHeight = 200;
      const maxHeight = window.innerHeight - 200;
      setChatHeight(Math.max(minHeight, Math.min(maxHeight, newHeight)));
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing]);

  const handleReset = () => {
    setChatInput('');
    setDocumentContent('');
    setIsGenerating(false);
    setIsStreaming(false);
    setChatMessages([]);
  };

  return (
    <Layout>
      <div className="h-[calc(100vh-65px)] -mt-5 bg-white flex flex-col overflow-hidden relative z-0">
        <header className="border-b border-gray-200 bg-white flex-shrink-0">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">내용증명서</h1>
              {documentContent && (
                <p className="text-sm text-gray-600 mt-1">제목 : {documentContent.match(/제목[：:]\s*(.+)/)?.[1] || '대여금 변제 청구'}</p>
              )}
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handleDownloadPDF}
                leftIcon={<Download className="w-4 h-4" />}
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                PDF 다운로드
              </Button>
              <Button
                onClick={handleReset}
                leftIcon={<RotateCcw className="w-4 h-4" />}
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                다시 하기
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content Area (Document Preview) */}
        {/* 수정됨: flex-1을 유지하되, 채팅창이 absolute가 되면서 이 영역은 항상 전체 높이를 차지하게 됨 */}
        <div className="flex-1 bg-gray-50 flex items-center justify-center p-8 overflow-auto min-h-0 pb-20">
          {documentContent ? (
            <div className="w-full max-w-4xl h-full flex flex-col">
              <div className="flex-1 bg-white p-12 space-y-6 text-slate-800 leading-relaxed shadow-lg rounded-lg overflow-y-auto custom-scrollbar">
                <div ref={documentRef}>
                  <h2 className="text-2xl font-bold text-center mb-8">내용증명</h2>
                  <div 
                    className="whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{ __html: documentContent }}
                  />
                </div>
                {isStreaming && (
                  <div className="flex justify-center gap-1 mt-4">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="w-full max-w-2xl -mt-16">
              <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                {isGenerating ? (
                  <>
                    <p className="text-gray-700 text-lg mb-4">문서를 생성하고 있습니다...</p>
                    <div className="flex justify-center gap-1 mt-4">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-gray-700 text-lg">
                      채팅창에 상황을 입력하시면 문서가 자동으로 생성이 됩니다!
                    </p>
                    <div className="flex justify-center gap-1 mt-4">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        <div 
          ref={chatContainerRef}
          className="bg-white border-t border-gray-200 flex flex-col absolute bottom-0 w-full z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]"
          style={{ height: `${chatHeight}px`, maxHeight: '60vh' }}
        >
          <div
            onMouseDown={handleMouseDown}
            className="h-2 bg-gray-200 hover:bg-gray-300 cursor-ns-resize flex items-center justify-center flex-shrink-0"
          >
            <div className="w-12 h-1 bg-gray-400 rounded"></div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            {chatMessages.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <p className="text-sm">AI와 대화를 시작하세요</p>
              </div>
            ) : (
              <div className="space-y-4">
                {chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        msg.role === 'user'
                          ? 'bg-gray-100 text-gray-800'
                          : 'bg-purple-100 text-gray-800'
                      }`}
                    >
                      {msg.role === 'ai' && (
                        <div className="text-xs font-semibold text-purple-700 mb-1">ChatGLD</div>
                      )}
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="border-t border-gray-200 p-4 flex-shrink-0">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && chatInput.trim().length >= 15) {
                      handleSend();
                    }
                  }}
                  placeholder="답변을 입력해주세요."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                />
                <button
                  onClick={handleSend}
                  disabled={chatInput.trim().length < 15 || isGenerating || isStreaming || !caseId}
                  aria-label="메시지 전송"
                  className={`p-3 rounded-lg transition-colors ${
                    chatInput.trim().length >= 15 && !isGenerating && !isStreaming && caseId
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <ArrowUp className="w-5 h-5" />
                </button>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                AI가 제공하는 답변은 제출한 정보를 기반으로 하므로, 참고용으로만 사용해 주세요.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
