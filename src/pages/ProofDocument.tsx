import { useState, useRef } from 'react';
import { Layout } from '../components/ui/Layout';
import { Button } from '../components/ui/Button';
import { Download, ArrowUp, RotateCcw } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export function ProofDocument() {
  const [chatInput, setChatInput] = useState('');
  const documentRef = useRef<HTMLDivElement>(null);

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

  const handleSend = () => {
    if (chatInput.trim().length >= 15) {
      // TODO: API 호출하여 문서 생성
      console.log('Sending:', chatInput);
    }
  };

  const handleReset = () => {
    setChatInput('');
    // TODO: 문서 초기화
  };

  return (
    <Layout>
      <div className="min-h-screen bg-white flex flex-col">
        {/* Header */}
        <header className="border-b border-gray-200 bg-white">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">내용증명서</h1>
              <div className="h-px bg-gray-200 mt-2"></div>
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

        {/* Main Content Area */}
        <div className="flex-1 bg-gray-50 flex items-center justify-center p-8">
          <div className="w-full max-w-2xl">
            <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
              <p className="text-gray-700 text-lg">
                채팅창에 상황을 입력하시면 문서가 자동으로 생성이 됩니다!
              </p>
              <div className="flex justify-center gap-1 mt-4">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Hidden Document for PDF Generation */}
        <div className="hidden">
          <div ref={documentRef} className="p-12 space-y-6 text-slate-800 leading-relaxed">
            <h2 className="text-2xl font-bold text-center mb-8">내용증명</h2>
            {/* 문서 내용은 API 응답으로 채워질 예정 */}
          </div>
        </div>

        {/* Chat Input Section */}
        <div className="bg-white border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="max-w-4xl mx-auto">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                사례를 입력해 주세요. (15자 이상)
              </label>
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
                  placeholder="상황을 자세히 설명해주세요..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                />
                <button
                  onClick={handleSend}
                  disabled={chatInput.trim().length < 15}
                  className={`p-3 rounded-lg transition-colors ${
                    chatInput.trim().length >= 15
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <ArrowUp className="w-5 h-5" />
                </button>
              </div>
              <p className="mt-3 text-xs text-gray-500">
                AI가 제공하는 답변은 제출한 정보를 기반으로 하므로, 참고용으로만 사용해 주세요.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
