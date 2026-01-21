import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/ui/Layout';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { FileText, MessageSquare, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export function Solution() {
  const navigate = useNavigate();

  // 예상 합의금 (실제로는 백엔드에서 계산)
  const estimatedAmount = '3,000,000원 ~ 5,000,000원';

  const advice = [
    '유사 판례를 분석한 결과, 이 사건은 합의를 통한 해결이 가장 효과적입니다.',
    '증거 자료를 잘 보관하시고, 가능하면 서면으로 모든 내용을 기록해 두세요.',
    '합의가 어려운 경우 법률 전문가와 상담을 받는 것을 권장합니다.'
  ];

  const handleDocumentSelect = (type: 'agreement' | 'notice' | 'complaint') => {
    // Document 페이지로 이동하면서 선택한 문서 유형 전달
    navigate('/document', { state: { documentType: type } });
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-6 py-16 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            상황 분석 결과
          </h1>
          <p className="text-xl text-gray-600">
            유사 판례를 바탕으로 분석한 결과입니다
          </p>
        </motion.div>

        {/* 예상 합의금 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <Card className="p-8 bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">예상 합의금</h2>
              <div className="text-4xl md:text-5xl font-extrabold text-indigo-600 mb-2">
                {estimatedAmount}
              </div>
              <p className="text-sm text-gray-600 mt-4">
                * 유사 판례 데이터를 기반으로 한 추정치입니다. 실제 합의금은 상황에 따라 달라질 수 있습니다.
              </p>
            </div>
          </Card>
        </motion.div>

        {/* 해결 방안 조언 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8"
        >
          <Card className="p-8">
            <div className="flex items-start gap-3 mb-6">
              <AlertCircle className="w-6 h-6 text-indigo-600 flex-shrink-0 mt-1" />
              <h2 className="text-2xl font-bold text-gray-900">문제 해결 방안</h2>
            </div>
            <ul className="space-y-4">
              {advice.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-semibold mt-0.5">
                    {idx + 1}
                  </span>
                  <p className="text-gray-700 leading-relaxed">{item}</p>
                </li>
              ))}
            </ul>
          </Card>
        </motion.div>

        {/* 문서 선택 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-8"
        >
          <Card className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              문서 작성하기
            </h2>
            <p className="text-gray-600 mb-8 text-center">
              상황에 맞는 문서를 선택하여 작성하세요
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* 합의서 */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleDocumentSelect('agreement')}
                className="p-6 bg-white border-2 border-gray-200 rounded-xl hover:border-indigo-500 hover:shadow-lg transition-all text-left group"
              >
                <div className="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center mb-4 group-hover:bg-indigo-500 transition-colors">
                  <FileText className="w-6 h-6 text-indigo-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">합의서</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  상대방과 합의할 때 사용하는 문서입니다. 합의 내용과 조건을 명확히 기록합니다.
                </p>
              </motion.button>

              {/* 내용증명서 */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleDocumentSelect('notice')}
                className="p-6 bg-white border-2 border-gray-200 rounded-xl hover:border-indigo-500 hover:shadow-lg transition-all text-left group"
              >
                <div className="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center mb-4 group-hover:bg-indigo-500 transition-colors">
                  <MessageSquare className="w-6 h-6 text-indigo-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">내용증명서</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  상대방에게 법적 내용을 공식적으로 전달할 때 사용합니다. 법적 효력이 있습니다.
                </p>
              </motion.button>

              {/* 고소장 */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleDocumentSelect('complaint')}
                className="p-6 bg-white border-2 border-gray-200 rounded-xl hover:border-indigo-500 hover:shadow-lg transition-all text-left group"
              >
                <div className="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center mb-4 group-hover:bg-indigo-500 transition-colors">
                  <AlertCircle className="w-6 h-6 text-indigo-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">고소장</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  법적 절차를 진행하기 위해 작성하는 공식 문서입니다. 신중하게 작성해야 합니다.
                </p>
              </motion.button>
            </div>
          </Card>
        </motion.div>

        {/* 하단 안내 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center text-sm text-gray-500"
        >
          <p>
            작성한 문서는 참고용으로만 사용하시고, 법적 효력이 필요한 경우 변호사와 상담하시기 바랍니다.
          </p>
        </motion.div>
      </div>
    </Layout>
  );
}
