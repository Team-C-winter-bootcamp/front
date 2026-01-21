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
        'Insurance claims, property loss, and liability disputes from fire incidents.',
      icon: <Flame size={24} />
    },
    {
      id: 'labor',
      title: '근로/알바 계약서',
      description:
        'Slander, libel, and reputation damage issues online or offline.',
      icon: <MessageSquare size={24} />
    },
    {
      id: 'realestate',
      title: '부동산/임대차',
      description:
        'Physical altercations, personal injury claims, and self-defense cases.',
      icon: <ShieldAlert size={24} />
    },
    {
      id: 'fraud',
      title: '중고사기 온라인 모욕',
      description:
        'Boundary issues, landlord-tenant conflicts, and real estate disagreements.',
      icon: <Home size={24} />
    },
    {
      id: 'assault',
      title: '폭행/폭언',
      description:
        'Wrongful termination, harassment, wage theft, and contract disputes.',
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
              <span>AI-Powered Legal Guidance</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight leading-tight">
              Understand your legal options <br className="hidden md:block" />
              <span className="text-[#4A90E2]">before hiring a lawyer</span>
            </h1>
            <p className="text-xl text-gray-500 leading-relaxed mb-8">
              A calm, private space to explore your situation. Get clarity on
              your rights, potential outcomes, and next steps without the
              pressure.
            </p>
            <Button
              size="lg"
              onClick={() => navigate('/chat')}
              className="shadow-lg shadow-blue-500/20"
            >
              Start AI Legal Chat
            </Button>
            <p className="mt-4 text-sm text-gray-400">
              Free to start • No credit card required • Private & Secure
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
              description="Not sure where your case fits? Tell us what happened in your own words."
              icon={<Sparkles size={24} />}
              onClick={() => navigate('/chat')}
            />
          </motion.div>
        </motion.div>
      </div>
    </Layout>
  );
}
