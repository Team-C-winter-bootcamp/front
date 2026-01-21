import { useEffect, useState, useRef } from 'react';// 채팅 
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/ui/Layout';
import { ChatBubble } from '../components/ChatPage/ChatBubble';
import { Button } from '../components/ui/Button';
import { ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type Message = {
  id: string;
  text: string;
  sender: 'ai' | 'user';
};

type Step = {
  id: number;
  question: string;
  options: string[];
};

const steps: Step[] = [
  {
    id: 1,
    question:
      '옵션을 이해하는 데 도움을 드릴 수 있습니다. 먼저 이 상황에서 귀하의 역할을 알려주실 수 있나요?',
    options: [
      '저는 피해자/청구인입니다',
      '저는 피의자입니다',
      '저는 증인입니다',
      '기타'
    ]
  },
  {
    id: 2,
    question:
      '감사합니다. 최선의 안내를 위해 다음을 알려주세요: 이 사건을 보장할 수 있는 보험 정책이 있나요?',
    options: [
      '네, 저에게 보험이 있습니다',
      '상대방에게 보험이 있습니다',
      '보험이 관련되지 않았습니다',
      '확실하지 않습니다'
    ]
  },
  {
    id: 3,
    question: '알겠습니다. 사건 중에 신체적 부상을 입은 사람이 있나요?',
    options: [
      '네, 심각한 부상입니다',
      '네, 경미한 부상입니다',
      '부상이 없습니다',
      '해당 없음'
    ]
  },
  {
    id: 4,
    question:
      '알겠습니다. 지금 사용 가능한 문서화된 증거(사진, 이메일, 경찰 보고서)가 있나요?',
    options: [
      '네, 강력한 증거가 있습니다',
      '일부 증거가 있습니다',
      '서면 증거가 없습니다',
      '나중에 가져올 수 있습니다'
    ]
  }
];

export function CaseCreation() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init',
      text: "안녕하세요. 저는 여러분의 법률 도우미입니다. 여러분의 상황을 차분하고 명확하게 이해할 수 있도록 도와드리기 위해 여기 있습니다. 여기서 공유하는 모든 내용은 비공개입니다.",
      sender: 'ai'
    }
  ]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Initial delay for the first question
  useEffect(() => {
    if (currentStep === 0 && messages.length === 1) {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        setMessages((prev) => [
          ...prev,
          {
            id: `q-${steps[0].id}`,
            text: steps[0].question,
            sender: 'ai'
          }
        ]);
      }, 1500);
    }
  }, []);

  const handleOptionClick = (option: string) => {
    // Add user response
    setMessages((prev) => [
      ...prev,
      {
        id: `a-${Date.now()}`,
        text: option,
        sender: 'user'
      }
    ]);

    // Simulate AI thinking and next step
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      if (currentStep < steps.length - 1) {
        // Next question
        const nextStep = currentStep + 1;
        setCurrentStep(nextStep);
        setMessages((prev) => [
          ...prev,
          {
            id: `q-${steps[nextStep].id}`,
            text: steps[nextStep].question,
            sender: 'ai'
          }
        ]);
      } else {
        // Finish flow
        setMessages((prev) => {
          // 이미 finish 메시지가 있는지 확인
          if (prev.some(msg => msg.id === 'finish')) {
            return prev;
          }
          return [
            ...prev,
            {
              id: 'finish',
              text: "세부사항을 공유해 주셔서 감사합니다. 유사한 사건을 바탕으로 귀하의 상황을 분석했습니다. 요약과 권장 다음 단계를 준비했습니다.",
              sender: 'ai'
            }
          ];
        });
      }
    }, 1500);
  };

  const isFinished =
    currentStep === steps.length - 1 && messages.length > steps.length * 2 + 1;

  return (
    <Layout showNav={false}>
      <div className="max-w-3xl mx-auto flex flex-col h-screen bg-[#FAFAFA]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-10">
          <button
            onClick={() => navigate('/')}
            className="p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="text-center">
            <h2 className="font-semibold text-gray-900">사건 평가</h2>
            <p className="text-xs text-gray-400">비공개 및 기밀</p>
          </div>
          <div className="w-8" /> {/* Spacer */}
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <ChatBubble
                key={msg.id}
                message={msg.text}
                sender={msg.sender}
              />
            ))}
            {isTyping && (
              <ChatBubble key="typing" message="" sender="ai" isTyping={true} />
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area (Options) */}
        <div className="p-6 bg-white border-t border-gray-100">
          {!isFinished ? (
            <div className="max-w-2xl mx-auto">
              <p className="text-sm text-gray-400 mb-3 text-center">
                계속하려면 옵션을 선택하세요:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {steps[currentStep].options.map((option, idx) => (
                  <motion.button
                    key={idx}
                    initial={{
                      opacity: 0,
                      y: 10
                    }}
                    animate={{
                      opacity: 1,
                      y: 0
                    }}
                    transition={{
                      delay: idx * 0.1
                    }}
                    onClick={() => !isTyping && handleOptionClick(option)}
                    disabled={isTyping}
                    className="p-4 text-left text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:border-[#4A90E2] hover:bg-[#E8F0F7] hover:text-[#4A90E2] transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {option}
                  </motion.button>
                ))}
              </div>
            </div>
          ) : (
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.9
              }}
              animate={{
                opacity: 1,
                scale: 1
              }}
              className="text-center"
            >
              <Button
                size="lg"
                onClick={() => navigate('/search')}
                className="w-full sm:w-auto min-w-[200px] shadow-lg shadow-blue-500/20"
              >
                사건 요약 보기
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </Layout>
  );
}
