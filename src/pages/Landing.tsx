import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { FileText, MessageSquare, ShieldCheck } from 'lucide-react';
export function Landing() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <ShieldCheck className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">
                시비스리걸
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                소개
              </Button>
              <Button variant="ghost" size="sm">
                로그인
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-grow flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-3xl w-full text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight mb-6">
            법적 문제를 <br className="hidden sm:block" />
            <span className="text-blue-600">자신감 있게 해결하세요</span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            차분하고 친절한 방식으로 법률 문서를 작성하고 권리를 이해할 수
            있습니다. 복잡한 법률 용어 없이, 명확한 단계만 제공합니다.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
            <Button
              size="lg"
              className="w-full sm:w-auto text-lg h-14 px-8"
              onClick={() => navigate('/case/new')}
              leftIcon={<MessageSquare className="w-5 h-5" />}>

              법률 상담 시작하기
            </Button>
            <Button
              size="lg"
              variant="secondary"
              className="w-full sm:w-auto text-lg h-14 px-8"
              onClick={() => navigate('/case/new')}
              leftIcon={<FileText className="w-5 h-5" />}>

              문서 작성하기
            </Button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mb-4 text-blue-600">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">단계별 안내</h3>
              <p className="text-gray-600 text-sm">
                쉬운 한국어로 질문에 답하세요. 법률 형식은 저희가 처리합니다.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center mb-4 text-green-600">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">판례 분석</h3>
              <p className="text-gray-600 text-sm">
                관련 판례를 자동으로 추천받아 법적 근거를 강화하세요.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center mb-4 text-purple-600">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                즉시 문서 생성
              </h3>
              <p className="text-gray-600 text-sm">
                답변하는 동시에 법률 문서가 실시간으로 작성됩니다.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm">
            © 2024 시비스리걸. 법무법인이 아닙니다.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-gray-400 hover:text-gray-500 text-sm">
              개인정보처리방침
            </a>
            <a href="#" className="text-gray-400 hover:text-gray-500 text-sm">
              이용약관
            </a>
            <a href="#" className="text-gray-400 hover:text-gray-500 text-sm">
              문의하기
            </a>
          </div>
        </div>
      </footer>
    </div>);

}