import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from './Navbar';
import Hero from './Hero';
import Features from './Features';
import Footer from './Footer';
import { ArrowRight, Sparkles } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen selection:bg-indigo-100 selection:text-indigo-900 overflow-x-hidden bg-white">
      <Navbar />
      
      <main>
        <Hero />
        
        <Features />
        
        {/* 하단 CTA 섹션 */}
        <section className="py-32 relative overflow-hidden bg-slate-900">
          {/* 배경 그래픽 장식 */}
          <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_30%,_#4f46e5_0%,_transparent_50%)]" />
            <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_70%,_#818cf8_0%,_transparent_50%)]" />
          </div>
          
          <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-bold mb-8 uppercase tracking-widest">
                <Sparkles size={16} />
                <span>Experience the Future of Law</span>
              </div>
              
              <h2 className="text-4xl md:text-6xl font-black text-white mb-8 leading-tight tracking-tight">
                복잡한 법률 업무를 <br />
                <span className="text-indigo-400">LAWDING</span>으로 해결하세요
              </h2>
              
              <p className="text-slate-400 text-xl md:text-2xl mb-14 max-w-2xl mx-auto leading-relaxed font-medium">
                지금 가입하시면 무료로 AI 판례 검색과 <br className="hidden md:block" />
                AI 법률 문서 요약 기능을 체험해 보실 수 있습니다.
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
                <motion.button 
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    navigate('/home')
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  className="group relative px-12 py-5 bg-indigo-600 text-white rounded-full font-black text-xl shadow-[0_20px_50px_-10px_rgba(79,70,229,0.5)] hover:bg-indigo-500 transition-all flex items-center gap-3"
                >
                  무료 체험 시작하기
                  <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" strokeWidth={3} />
                </motion.button>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default LandingPage;
