
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Hero from './Hero';
import Features from './Features';
import UseCases from './UseCases';
import TrendingSection from './TrendingSection';
import Footer from './Footer';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -100px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, observerOptions);

    // Select all text elements for scroll reveal animation
    const revealElements = document.querySelectorAll('h1, h2, h3, h4, h5, p, li, .reveal');
    revealElements.forEach(el => {
      el.classList.add('reveal');
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen selection:bg-indigo-100 selection:text-indigo-900 overflow-x-hidden">
      <Navbar />
      <main>
        <Hero />
        
        <TrendingSection />

        <Features />
        
        <UseCases />
        
        {/* Final CTA Section */}
        <section className="py-32 bg-indigo-600 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white"></path>
            </svg>
          </div>
          <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-8 leading-tight">
              법률 업무의 복잡함을 <br />
              LAWDING으로 단순하게 해결하세요.
            </h2>
            <p className="text-indigo-100 text-lg mb-12 opacity-90 leading-relaxed">
              지금 가입하시면 무료로 고급 법례 검색과 <br />
              AI 문서 요약 기능을 체험해 보실 수 있습니다.
            </p>
            <div className="flex justify-center">
              <button 
                onClick={() => {
                  navigate('/home')
                  setTimeout(() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }, 100)
                }}
                className="bg-white text-indigo-600 px-10 py-4 rounded-full font-bold text-lg hover:bg-slate-50 transition shadow-xl active:scale-95"
              >
                무료 체험 시작하기
              </button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;
