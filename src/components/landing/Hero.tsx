import { useNavigate } from 'react-router-dom'; 
import { motion } from 'framer-motion';
import main from '../../assets/main.webp';
import { ChevronDown, ArrowRight } from 'lucide-react';

const Hero = () => {
  const navigate = useNavigate(); 

  return (
    <header className="relative pt-40 pb-24 overflow-hidden bg-gradient-to-b from-slate-50 via-white to-white">
      {/* 배경 장식 */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-50/50 via-transparent to-transparent -z-10" />
      
      <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-8 leading-[1.1] text-slate-900 text-pretty">
            변호사 없이 법률 문제를 <br />
            <span className="relative inline-block mt-2">
              <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600">
                쉽게 해결하세요
              </span>
              <motion.span 
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ delay: 0.8, duration: 0.8 }}
                className="absolute bottom-2 left-0 h-4 bg-indigo-100/60 -z-10 rounded-full"
              />
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-500 mb-14 max-w-4xl mx-auto leading-relaxed font-medium">
            변호사 선임이 부담스러우신가요? <br className="hidden md:block" />
            간단한 질문과 상황 입력만으로 유사 판례를 찾고, 문서 작성을 도와드립니다.<br className="hidden md:block" />
            금전적, 시간적 부담 없이 <span className="text-slate-900 font-bold">스마트한 법률 해결</span>을 경험해보세요.
          </p>

          <div className="relative inline-flex group">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-violet-600 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                navigate('/home')
                setTimeout(() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }, 100)
              }}
              className="relative flex items-center justify-center gap-3 bg-indigo-600 text-white px-14 py-5 rounded-full font-black text-xl hover:bg-indigo-700 transition shadow-2xl shadow-indigo-500/40"
            >
              무료 체험 시작하기
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" strokeWidth={2.5} />
            </motion.button>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="mt-24 relative"
        >
          <motion.div
            animate={{ y: [0, -15, 0] }}
            transition={{ 
              repeat: Infinity, 
              duration: 4,
              ease: "easeInOut"
            }}
            className="relative z-10"
          >
            <img 
              src={main}
              alt="Dashboard Preview" 
              width={900}
              height={600}
              className="rounded-[2.5rem] shadow-[0_20px_70px_-15px_rgba(79,70,229,0.25)] border-4 border-white mx-auto transform -rotate-1 hover:rotate-0 transition-transform duration-700"
            />
          </motion.div>
          
          {/* 장식용 블러 */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-full bg-indigo-100/30 blur-[100px] -z-10 rounded-full" />
        </motion.div>

        {/* 스크롤 유도 */}
        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="mt-20 flex flex-col items-center gap-2 text-slate-400 font-bold"
        >
          <span className="text-xs uppercase tracking-widest">Scroll Down</span>
          <ChevronDown size={20} />
        </motion.div>
      </div>
    </header>
  );
};

export default Hero;
