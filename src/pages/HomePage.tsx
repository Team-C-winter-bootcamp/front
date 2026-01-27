import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/ui/Layout';
import { CategoryCard } from '../components/HomePage/CategoryCard';
import { Button } from '../components/ui/Button';
import {
  Wallet,
  Briefcase,
  Building,
  AlertTriangle,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function HomePage() {
  const navigate = useNavigate();
  const categories = [
    {
      id: 'money',
      title: '못받은 돈',
      description:
        '대여금 반환, 물품 대금 미지급, 손해배상금 청구 및 금전 채권 관련 분쟁.',
      icon: <Wallet size={24} />
    },
    {
      id: 'labor',
      title: '근로/알바 계약서',
      description:
        '부당 해고, 직장 내 괴롭힘, 임금 체불, 퇴직금 정산 및 근로계약 위반 분쟁.',
      icon: <Briefcase size={24} />
    },
    {
      id: 'realestate',
      title: '부동산/임대차',
      description:
        '전·월세 보증금 미반환, 층간 소음, 임대인-임차인 갈등 및 부동산 권리분쟁.',
      icon: <Building size={24} />
    },
    {
      id: 'fraud',
      title: '중고사기 온라인 모욕',
      description:
        '중고 거래 사기 피해, 온라인상 비방, 명예훼손(사이버 불링) 및 평판 훼손.',
      icon: <AlertTriangle size={24} />
    },
    {
      id: 'assault',
      title: '폭행/폭언',
      description:
        '신체적 다툼, 상해피해, 정당방위 주장 및 폭언으로 인한 위자료 청구 소송.',
      icon: <AlertCircle size={24} />
    }
  ];

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1, duration: 0.3 } }
  };
  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-6 py-16 md:py-24">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{
              opacity: 0,
              y: 10
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            transition={{
              duration: 0.3 // duration 단축으로 더 빠른 로딩
            }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight leading-tight">
            변호사 상담이 망설여질 땐?<br className="hidden md:block" />
              <span className="text-indigo-600">해답은 LAWDING</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-500 leading-relaxed mb-8 max-w-2xl mx-auto">
  변호사 선임 비용과 복잡한 절차 때문에 혼자 끙끙 앓고 계셨나요?<br className="hidden md:block" />
  부담 없이 상황을 진단하고 <span className="text-gray-700 font-semibold">최적의 법적 대응책</span>을 미리 확인해 보세요.
</p>
            <Button
              size="lg"
              onClick={() => navigate('/case')}
              className="shadow-lg shadow-indigo-500/20"
            >
              AI 법률 채팅 시작하기
            </Button>
          </motion.div>
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <h2 className="sr-only">사건 카테고리 선택</h2>
          {categories.map((cat) => (
            <motion.div key={cat.id} variants={item}>
              <CategoryCard
                title={cat.title}
                description={cat.description}
                icon={cat.icon}
                onClick={() => navigate('/case', { state: { category: cat.title } })}
              />
            </motion.div>
          ))}

          <motion.div variants={item}>
            <CategoryCard
              title="기타"
              description="사건이 어디에 해당하는지 확실하지 않나요? 직접 상황을 설명해 주세요."
              icon={<Sparkles size={24} />}
              onClick={() => navigate('/case', { state: { category: '기타' } })}
            />
          </motion.div>
        </motion.div>
      </div>
    </Layout>
  );
}
