import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

const Navbar = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-8 py-4 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/80 backdrop-blur-lg border-b border-slate-200 shadow-sm py-3' 
        : 'bg-transparent border-transparent py-5'
    }`}>
      <button 
        onClick={() => navigate('/')}
        className="text-2xl font-black tracking-tighter text-indigo-600 hover:opacity-70 transition-opacity"
      >
        LAWDING
      </button>

      <div className="flex gap-6 items-center">
        <button 
          onClick={() => navigate('/login')}
          className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors"
        >
          로그인
        </button>
        <button 
          onClick={() => navigate('/signup')}
          className="bg-indigo-600 text-white px-6 py-2.5 rounded-full text-sm font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-indigo-300 transition-all active:scale-95"
        >
          회원가입
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
