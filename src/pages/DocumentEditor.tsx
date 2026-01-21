import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCase } from '../context/CaseContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { QuestionCard } from '../components/case/QuestionCard';
import { ChecklistItem } from '../components/case/ChecklistItem';
import { ArrowLeft, Download, FileText, Scale, Send } from 'lucide-react';
export function DocumentEditor() {
  const navigate = useNavigate();
  const { caseData } = useCase();
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [activeQuestion, setActiveQuestion] = useState(0);
  // Simulated document generation
  const fullDocument = `
내용증명

발송일: ${new Date().toLocaleDateString('ko-KR')}

발신:
${caseData.parties.plaintiff || '[귀하의 성명]'}
[귀하의 주소]

수신:
${caseData.parties.defendant || '[채무자 성명]'}
[채무자 주소]

제목: 대여금 ₩${caseData.amount} 변제 청구

${caseData.parties.defendant || '귀하'}께,

본 내용증명은 ${caseData.incidentDate}에 대여한 금 ₩${caseData.amount}원의 변제를 정식으로 청구하기 위함입니다.

여러 차례 우호적으로 해결하려 시도했으나 아직 변제가 이루어지지 않았습니다. 이는 대여 계약 위반에 해당합니다.

본 내용증명 수령 후 14일 이내에 전액 ₩${caseData.amount}원을 변제해주시기 바랍니다. 기한 내 변제가 이루어지지 않을 경우, 법원에 민사소송을 제기하여 원금과 법정이자, 소송비용을 청구할 수 있음을 알려드립니다.

법정 절차 없이 원만히 해결되기를 바랍니다.

${caseData.parties.plaintiff}
  `.trim();
  // Typing effect
  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setDisplayedText(fullDocument.slice(0, index));
      index += 5; // Speed up typing
      if (index > fullDocument.length) {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, 20);
    return () => clearInterval(interval);
  }, [fullDocument]);
  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 h-16 flex-shrink-0 px-4 sm:px-6 flex items-center justify-between z-10">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/case/new')}
            className="mr-4">

            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">
              내용증명 초안
            </h1>
            <p className="text-xs text-gray-500">방금 저장됨</p>
          </div>
        </div>

        <div className="hidden md:flex items-center space-x-6">
          <div className="flex space-x-4 border-r border-gray-200 pr-6">
            <ChecklistItem
              label="당사자"
              isComplete={!!caseData.parties.defendant} />

            <ChecklistItem label="청구금액" isComplete={!!caseData.amount} />
            <ChecklistItem label="법적근거" isComplete={false} />
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/case/1/caselaw')}
            leftIcon={<Scale className="w-4 h-4" />}>

            판례 찾기
          </Button>
          <Button size="sm" leftIcon={<Download className="w-4 h-4" />}>
            PDF 다운로드
          </Button>
        </div>
      </header>

      {/* Main Content - Split Screen */}
      <div className="flex-grow flex overflow-hidden">
        {/* Left Panel: AI Assistant / Questions */}
        <div className="w-full md:w-[40%] bg-gray-50 border-r border-gray-200 flex flex-col overflow-y-auto p-4 sm:p-6">
          <div className="space-y-6 max-w-lg mx-auto w-full">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <SparklesIcon className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-sm font-medium text-blue-900">
                AI 법률 도우미
              </p>
            </div>

            <QuestionCard
              question="대여에 대한 추가 세부사항이 있나요?"
              helperText="이자 약정이 있었나요? 특정 상환 일정이 있었나요?"
              isActive={activeQuestion === 0}>

              <Textarea
                placeholder="예: 연 5% 이자로 합의했습니다..."
                className="mb-3" />

              <Button size="sm" onClick={() => setActiveQuestion(1)}>
                초안 업데이트
              </Button>
            </QuestionCard>

            <QuestionCard
              question="어떻게 변제받고 싶으신가요?"
              helperText="계좌이체, 수표, 또는 기타 방법을 명시하세요."
              isActive={activeQuestion === 1}>

              <Input placeholder="변제 방법..." className="mb-3" />
              <div className="flex gap-2">
                <Button size="sm" onClick={() => setActiveQuestion(2)}>
                  초안 업데이트
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveQuestion(0)}>

                  이전
                </Button>
              </div>
            </QuestionCard>

            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 mt-8">
              <h4 className="text-sm font-semibold text-blue-900 mb-2">제안</h4>
              <p className="text-sm text-blue-800 mb-3">
                구체적인 기한을 명시하면 응답률이 40% 증가합니다.
              </p>
              <Button variant="secondary" size="sm" className="w-full bg-white">
                14일 기한 추가
              </Button>
            </div>
          </div>
        </div>

        {/* Right Panel: Live Document Preview */}
        <div className="hidden md:block w-[60%] bg-gray-100 p-8 overflow-y-auto">
          <div className="max-w-3xl mx-auto bg-white shadow-lg min-h-[800px] p-12 rounded-sm relative">
            {isTyping &&
            <div className="absolute top-4 right-4 flex items-center space-x-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                </span>
                <span className="text-xs text-gray-400 font-medium">
                  작성 중...
                </span>
              </div>
            }
            <div className="prose prose-slate max-w-none font-serif whitespace-pre-wrap leading-relaxed text-gray-800">
              {displayedText}
              {isTyping &&
              <span className="animate-pulse inline-block w-1 h-5 bg-blue-600 ml-1 align-middle"></span>
              }
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Download Bar */}
      <div className="md:hidden bg-white border-t border-gray-200 p-4">
        <Button className="w-full" leftIcon={<Download className="w-4 h-4" />}>
          문서 다운로드
        </Button>
      </div>
    </div>);

}
function SparklesIcon({ className }: {className?: string;}) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round">

      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    </svg>);

}