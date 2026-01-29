import { useState, useRef, useEffect, Children } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Layout } from '../components/ui/Layout';
import { Button } from '../components/ui/Button';
import { Download, ArrowUp, RotateCcw, Loader2, ChevronLeft, Home } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import ReactMarkdown from 'react-markdown';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000';
const rightAlignLineRegex = /^\s*(작성일:|발신인:|갑:|을:)/;

type LocationState = {
  case_id?: number;
  precedent_id?: number | string;
};

type SseCallbacks = {
  onChunk: (chunk: string) => void;
  onComplete: (result: any) => void;
  onError: (err: unknown) => void;
};

async function fetchSSE(
  url: string,
  payload: any,
  callbacks: SseCallbacks,
  method: 'POST' | 'PATCH' = 'POST'
) {
  try {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    if (!response.body) throw new Error('ReadableStream not supported.');

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const blocks = buffer.split('\n\n');
      buffer = blocks.pop() || '';

      for (const block of blocks) {
        const trimmed = block.trim();
        if (!trimmed) continue;

        let eventName = 'message';
        let dataStr = '';

        for (const line of trimmed.split('\n')) {
          if (line.startsWith('event:')) eventName = line.replace('event:', '').trim();
          if (line.startsWith('data:')) dataStr += line.replace('data:', '').trim();
        }

        if (!dataStr) continue;

        try {
          const data = JSON.parse(dataStr);
          if (eventName === 'message') {
            callbacks.onChunk(data.content ?? data.chunk ?? '');
          } else if (eventName === 'done') {
            callbacks.onComplete(data.result ?? data);
          } else if (eventName === 'error') {
            callbacks.onError(data.error ?? data.message ?? 'unknown error');
          }
        } catch (e) {
          console.error('SSE Parse Error:', e);
        }
      }
    }
  } catch (error) {
    callbacks.onError(error);
  }
}

export default function AgreeDocument() {
  const location = useLocation();
  const navigate = useNavigate();
  const [chatInput, setChatInput] = useState('');
  const [documentContent, setDocumentContent] = useState('');
  const [displayedContent, setDisplayedContent] = useState('');
  const [documentId, setDocumentId] = useState<number | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'ai'; content: string }>>([]);
  const [chatHeight, setChatHeight] = useState(300);
  const [isResizing, setIsResizing] = useState(false);

  const documentRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const contentScrollRef = useRef<HTMLDivElement>(null);
  const displayedLengthRef = useRef(0);
  const streamBufferRef = useRef('');
  const initRequestedRef = useRef(false);

  const state = location.state as LocationState;
  const case_id = state?.case_id;
  const precedent_id = state?.precedent_id;

  useEffect(() => {
    const initDocument = async () => {
      if (!case_id || !precedent_id) {
        alert("사건 정보가 부족합니다. 분석 결과 페이지에서 다시 시도해주세요.");
        navigate(-1);
        return;
      }
      if (initRequestedRef.current) return;
      initRequestedRef.current = true;
      setIsGenerating(true);
      streamBufferRef.current = '';
      setDocumentContent('');
      await fetchSSE(
        `${API_BASE}/documents/agreement/`,
        {
          case_id: Number(case_id),
          precedent: String(precedent_id),
        },
        {
          onChunk: (chunk) => {
            if (!chunk) return;
            if (chunk.length >= streamBufferRef.current.length && chunk.startsWith(streamBufferRef.current)) {
              streamBufferRef.current = chunk;
            } else {
              streamBufferRef.current += chunk;
            }
            setDocumentContent(streamBufferRef.current);
          },
          onComplete: (result) => {
            if (result?.document_id) setDocumentId(result.document_id);
            setChatMessages([{ role: 'ai', content: '분석된 판례를 바탕으로 합의서 초안을 작성했습니다. 수정 사항을 말씀해주세요!' }]);
            setIsGenerating(false);
          },
          onError: () => {
            alert('합의서 초안 생성 중 오류가 발생했습니다.');
            setIsGenerating(false);
          },
        },
        'POST'
      );
    };
    initDocument();
  }, [case_id, precedent_id, navigate]);

  useEffect(() => {
    if (documentContent.length === 0) {
      displayedLengthRef.current = 0;
      setDisplayedContent('');
      return;
    }
    if (displayedLengthRef.current >= documentContent.length) return;
    const interval = setInterval(() => {
      displayedLengthRef.current += 1;
      setDisplayedContent(documentContent.slice(0, displayedLengthRef.current));
      if (displayedLengthRef.current >= documentContent.length) {
        clearInterval(interval);
      }
    }, 15);//타이핑 속도 
    return () => clearInterval(interval);
  }, [documentContent]);

  useEffect(() => {
    if (!contentScrollRef.current) return;
    contentScrollRef.current.scrollTop = contentScrollRef.current.scrollHeight;
  }, [displayedContent]);

  const handleSend = async () => {
    if (isStreaming || isGenerating || chatInput.trim().length < 5 || !documentId) return;
    const userMessage = chatInput.trim();
    setChatMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setChatInput('');
    setIsStreaming(true);
    streamBufferRef.current = '';
    setDocumentContent('');
    await fetchSSE(
      `${API_BASE}/documents/agreement/`,
      {
        document_id: documentId,
        user_request: userMessage,
      },
      {
        onChunk: (chunk) => {
          if (!chunk) return;
          if (chunk.length >= streamBufferRef.current.length && chunk.startsWith(streamBufferRef.current)) {
            streamBufferRef.current = chunk;
          } else {
            streamBufferRef.current += chunk;
          }
          setDocumentContent(streamBufferRef.current);
        },
        onComplete: () => {
          setChatMessages((prev) => [...prev, { role: 'ai', content: '요청하신 내용을 반영하여 합의서를 업데이트했습니다.' }]);
          setIsStreaming(false);
        },
        onError: () => {
          alert('문서 수정 중 오류가 발생했습니다.');
          setIsStreaming(false);
        },
      },
      'PATCH'
    );
  };

  const handleDownloadPDF = async () => {
    if (!documentRef.current) return;

    try {
      const canvas = await html2canvas(documentRef.current, { 
        scale: 2, 
        useCORS: true,
        backgroundColor: "#ffffff"
      });
      
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 210; 
      const pageHeight = 297; 
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 0;
      const pdf = new jsPDF('p', 'mm', 'a4');

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position -= pageHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`합의서_${case_id || 'draft'}.pdf`);
    } catch (error) {
      console.error(error);
      alert('PDF 저장 중 오류가 발생했습니다.');
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
    <Layout showNav={false}>
      <div className="h-screen bg-slate-50 flex flex-col overflow-hidden relative text-slate-900">
        <header className="border-b border-gray-200 bg-white flex-shrink-0">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex gap-1 mr-2">
                <button onClick={() => navigate(-1)} className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition" title="뒤로 가기">
                  <ChevronLeft size={20} />
                </button>
                <button onClick={() => navigate('/')} className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition hover:text-indigo-600" title="홈으로 가기">
                  <Home size={20} />
                </button>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">합의서 작성</h1>
                <p className="text-xs text-gray-500 mt-1">참조판례: {precedent_id || 'N/A'}</p>
              </div>
            </div>
            <div className="flex gap-2 text-sm">
              <Button onClick={handleDownloadPDF} size="md" className="bg-indigo-600 text-white hover:bg-indigo-700 shadow-md">
                <Download className="w-4 h-4 mr-2" /> PDF 저장
              </Button>
              <Button onClick={() => window.location.reload()} size="md" variant="outline">
                <RotateCcw className="w-4 h-4 mr-2" /> 초기화
              </Button>
            </div>
          </div>
        </header>

        <div ref={contentScrollRef} className="flex-1 bg-slate-100 p-8 overflow-auto pb-40">
          {isGenerating ? (
            <div className="h-full flex flex-col items-center justify-center">
              <Loader2 className="animate-spin text-indigo-500 mb-4" size={48} />
              <p className="font-bold text-slate-600 text-lg">AI가 합의서를 작성 중입니다...</p>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto bg-white shadow-2xl rounded-sm p-[20mm] min-h-[297mm]" ref={documentRef}>
              <div className="font-serif text-slate-900 text-[11pt] leading-[1.8] whitespace-pre-wrap">
                <ReactMarkdown
                  components={{
                    p: ({ children }) => {
                      const plainText = Children.toArray(children)
                        .map((child) => (typeof child === 'string' ? child : ''))
                        .join('');
                      const isRightAligned = rightAlignLineRegex.test(plainText);
                      return (
                        <p className={isRightAligned ? 'text-right' : undefined}>
                          {children}
                        </p>
                      );
                    },
                  }}
                >
                  {displayedContent}
                </ReactMarkdown>
              </div>
            </div>
          )}
        </div>

        <div ref={chatContainerRef} className="bg-white border-t border-gray-200 flex flex-col absolute bottom-0 w-full z-10 shadow-lg" style={{ height: `${chatHeight}px` }}>
          <div onMouseDown={handleMouseDown} className="h-1.5 bg-gray-100 hover:bg-indigo-300 cursor-ns-resize transition-colors flex items-center justify-center">
             <div className="w-10 h-1 bg-gray-300 rounded-full" />
          </div>
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            <div className="max-w-4xl mx-auto space-y-4">
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] p-3 rounded-xl text-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-800'}`}>
                    {msg.role === 'ai' && <div className="text-[14px] font-bold text-indigo-600 mb-1">LAWDING</div>}
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))}
              {isStreaming && <div className="text-xs text-indigo-500 animate-pulse ml-2">문서를 업데이트하고 있습니다...</div>}
            </div>
          </div>
          <div className="p-4 border-t bg-white">
            <div className="max-w-4xl mx-auto flex gap-2">
              <input 
                className="flex-1 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 text-sm shadow-sm" 
                value={chatInput} 
                onChange={(e) => setChatInput(e.target.value)} 
                onKeyDown={(e) => e.key === 'Enter' && handleSend()} 
                placeholder="수정하고 싶은 내용을 입력하세요..." 
              />
              <button 
                onClick={handleSend} 
                disabled={isStreaming || chatInput.trim().length < 5} 
                className="bg-indigo-600 text-white p-3 rounded-xl disabled:bg-slate-200 shadow-sm cursor-pointer"
              >
                <ArrowUp size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
