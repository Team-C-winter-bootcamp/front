import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/ui/Layout';
import { CategoryCard } from '../components/HomePage/CategoryCard';
import { Button } from '../components/ui/Button';
import {
  Flame,
  MessageSquare,
  ShieldAlert,
  Home,
  Briefcase,
  Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';

export function HomePage() {
  const navigate = useNavigate();
  const categories = [
    {
      id: 'money',
      title: '못받은 돈',
      description:
        '대여금 반환, 물품 대금 미지급, 손해배상금 청구 및 금전 채권 관련 분쟁.',
      icon: <Flame size={24} />
    },
    {
      id: 'labor',
      title: '근로/알바 계약서',
      description:
        '부당 해고, 직장 내 괴롭힘, 임금 체불, 퇴직금 정산 및 근로계약 위반 분쟁.',
      icon: <MessageSquare size={24} />
    },
    {
      id: 'realestate',
      title: '부동산/임대차',
      description:
        '전·월세 보증금 미반환, 층간 소음, 임대인-임차인 갈등 및 부동산 권리 분쟁.',
      icon: <ShieldAlert size={24} />
    },
    {
      id: 'fraud',
      title: '중고사기 온라인 모욕',
      description:
        '중고 거래 사기 피해, 온라인상의 비방, 명예훼손(사이버 불링) 및 평판 훼손 대응.',
      icon: <Home size={24} />
    },
    {
      id: 'assault',
      title: '폭행/폭언',
      description:
        '신체적 다툼, 상해 피해, 정당방위 주장 및 폭언으로 인한 위자료 청구 소송.',
      icon: <Briefcase size={24} />
    }
  ];

  const container = {
    hidden: {
      opacity: 0
    },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: {
      opacity: 0,
      y: 20
    },
    show: {
      opacity: 1,
      y: 0
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-6 py-16 md:py-24">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{
              opacity: 0,
              y: 20
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            transition={{
              duration: 0.5
            }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8F2ED] text-[#6B9B7F] text-sm font-medium mb-6">
              <Sparkles size={14} />
              <span>AI 기반 법률 상담</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight leading-tight">
              변호사 없이도 법률 문제를 <br className="hidden md:block" />
              <span className="text-[#4A90E2]">쉽게 해결하세요</span>
            </h1>
            <p className="text-xl text-gray-500 leading-relaxed mb-8">
              차분하고 사적인 공간에서 상황을 탐색하세요. 압박 없이 권리, 잠재적 결과, 다음 단계에 대한 명확성을 얻을 수 있습니다.
            </p>
            <Button
              size="lg"
              onClick={() => navigate('/chat')}
              className="shadow-lg shadow-blue-500/20"
            >
              AI 법률 채팅 시작하기
            </Button>
            <p className="mt-4 text-sm text-gray-400">
              무료로 시작 • 신용카드 불필요 • 사적이고 안전함
            </p>
          </motion.div>
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {categories.map((cat) => (
            <motion.div key={cat.id} variants={item}>
              <CategoryCard
                title={cat.title}
                description={cat.description}
                icon={cat.icon}
                onClick={() => navigate('/chat')}
              />
            </motion.div>
          ))}

          {/* "Other" Card */}
          <motion.div variants={item}>
            <CategoryCard
              title="기타"
              description="사건이 어디에 해당하는지 확실하지 않나요? 직접 상황을 설명해 주세요."
              icon={<Sparkles size={24} />}
              onClick={() => navigate('/chat')}
            />
          </motion.div>
        </motion.div>
      </div>
    </Layout>
  );
}
