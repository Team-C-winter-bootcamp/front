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
      'I can help you understand your options. First, could you tell me your role in this situation?',
    options: [
      'I am the victim / claimant',
      'I am the alleged offender',
      'I am a witness',
      'Other'
    ]
  },
  {
    id: 2,
    question:
      'Thank you. To give you the best guidance, I need to know: Is there any insurance policy that might cover this incident?',
    options: [
      'Yes, I have insurance',
      'The other party has insurance',
      'No insurance involved',
      "I'm not sure"
    ]
  },
  {
    id: 3,
    question: 'Understood. Was anyone physically injured during the incident?',
    options: [
      'Yes, serious injuries',
      'Yes, minor injuries',
      'No injuries',
      'Not applicable'
    ]
  },
  {
    id: 4,
    question:
      'Okay. Do you have any documented evidence (photos, emails, police reports) available right now?',
    options: [
      'Yes, I have strong evidence',
      'I have some evidence',
      'No written evidence',
      'I can get it later'
    ]
  }
];

export function CaseCreation() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init',
      text: "Hello. I'm your legal assistant. I'm here to help you understand your situation calmly and clearly. Everything you share here is private.",
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
        setMessages((prev) => [
          ...prev,
          {
            id: 'finish',
            text: "Thank you for sharing those details. I've analyzed your situation based on similar cases. I've prepared a summary and some recommended next steps for you.",
            sender: 'ai'
          }
        ]);
        // Show button to proceed after a moment
        setTimeout(() => {
          // This could be a state to show a "View Summary" button
        }, 1000);
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
            <h2 className="font-semibold text-gray-900">Case Assessment</h2>
            <p className="text-xs text-gray-400">Private & Confidential</p>
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
                Select an option to continue:
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
                onClick={() => navigate('/summary')}
                className="w-full sm:w-auto min-w-[200px] shadow-lg shadow-blue-500/20"
              >
                View Case Summary
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </Layout>
  );
}
