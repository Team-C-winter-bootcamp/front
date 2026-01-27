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
  Sparkles,
  ArrowRight
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
      icon: <Wallet size={26} />,
      colorClass: 'bg-emerald-50 text-emerald-600'
    },
    {
      id: 'labor',
      title: '근로/알바 계약서',
      description:
        '부당 해고, 직장 내 괴롭힘, 임금 체불, 퇴직금 정산 및 근로계약 위반 분쟁.',
      icon: <Briefcase size={26} />,
      colorClass: 'bg-blue-50 text-blue-600'
    },
    {
      id: 'realestate',
      title: '부동산/임대차',
      description:
        '전·월세 보증금 미반환, 층간 소음, 임대인-임차인 갈등 및 부동산 권리분쟁.',
      icon: <Building size={26} />,
      colorClass: 'bg-amber-50 text-amber-600'
    },
    {
      id: 'fraud',
      title: '중고사기 온라인 모욕',
      description:
        '중고 거래 사기 피해, 온라인상 비방, 명예훼손(사이버 불링) 및 평판 훼손.',
      icon: <AlertTriangle size={26} />,
      colorClass: 'bg-rose-50 text-rose-600'
    },
    {
      id: 'assault',
      title: '폭행/폭언',
      description:
        '신체적 다툼, 상해피해, 정당방위 주장 및 폭언으로 인한 위자료 청구 소송.',
      icon: <AlertCircle size={26} />,
      colorClass: 'bg-orange-50 text-orange-600'
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
      <div className="relative overflow-hidden bg-white">
        {/* 히어로 배경 장식 */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-indigo-50/40 via-transparent to-transparent -z-10" />
        <div className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none opacity-[0.02]" 
             style={{ backgroundImage: `radial-gradient(#4f46e5 0.5px, transparent 0.5px)`, backgroundSize: '24px 24px' }} />

        <div className="max-w-6xl mx-auto px-6 py-20 md:py-32 relative z-10">
          <div className="text-center max-w-4xl mx-auto mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-block px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-sm font-bold mb-6 tracking-wide uppercase">
                Next-Gen AI Legal Solution
              </div>
              <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-8 tracking-tight leading-[1.1]">
                변호사 상담이 망설여질 땐?<br />
                <span className="relative inline-block mt-2">
                  <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">
                    해답은 LAWDING
                  </span>
                  <motion.span 
                    className="absolute bottom-2 left-0 w-full h-4 bg-indigo-100/60 -z-10 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                  />
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-slate-500 leading-relaxed mb-12 max-w-3xl mx-auto font-medium">
                변호사 선임 비용과 복잡한 절차 때문에 혼자 고민하지 마세요.<br className="hidden md:block" />
                LAWDING AI가 당신의 상황을 정밀 진단하고 <span className="text-slate-900 font-bold underline underline-offset-4 decoration-indigo-200">최적의 법적 대응책</span>을 제시합니다.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    size="lg"
                    onClick={() => navigate('/case')}
                    className="px-10 py-8 text-xl font-black rounded-2xl bg-indigo-600 hover:bg-indigo-700 shadow-2xl shadow-indigo-500/30 group"
                  >
                    AI 법률 채팅 시작하기
                    <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          </div>

          <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-3 tracking-tight">상황별 맞춤 진단</h2>
              <p className="text-slate-500 font-bold">해당하는 카테고리를 선택하시면 AI 상담이 시작됩니다.</p>
            </div>
            <div className="h-px flex-1 bg-slate-100 hidden md:block mx-8 mb-4" />
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
                  colorClass={cat.colorClass}
                  onClick={() => navigate('/case', { state: { category: cat.title } })}
                />
              </motion.div>
            ))}

            <motion.div variants={item}>
              <CategoryCard
                title="기타"
                description="사건이 어디에 해당하는지 확실하지 않나요? 직접 상황을 설명해 주세요."
                icon={<Sparkles size={26} />}
                colorClass="bg-indigo-600 text-white"
                onClick={() => navigate('/case', { state: { category: '기타' } })}
              />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
