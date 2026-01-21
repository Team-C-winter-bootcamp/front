import React from 'react';
import { motion } from 'framer-motion';

interface ChatBubbleProps {
  message: string;
  sender: 'ai' | 'user';
  isTyping?: boolean;
}

export function ChatBubble({
  message,
  sender,
  isTyping = false
}: ChatBubbleProps) {
  const isAI = sender === 'ai';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`flex ${isAI ? 'justify-start' : 'justify-end'}`}
    >
      <div
        className={`max-w-[80%] sm:max-w-[70%] rounded-2xl px-4 py-3 ${
          isAI
            ? 'bg-white border border-gray-200 text-gray-900'
            : 'bg-[#4A90E2] text-white'
        }`}
      >
        {isTyping ? (
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        ) : (
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message}</p>
        )}
      </div>
    </motion.div>
  );
}
