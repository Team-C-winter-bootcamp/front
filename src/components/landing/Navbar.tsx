
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser, SignedIn, SignedOut, UserButton } from '@clerk/clerk-react';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUser();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-8 py-4 border-b border-slate-200 bg-white/80 backdrop-blur-md shadow-sm">
      <button 
        onClick={() => navigate('/')}
        className="text-2xl font-black tracking-tighter text-indigo-600 hover:opacity-70 transition-opacity"
      >
        LAWDING
      </button>

      <div className="flex gap-4 items-center">
        <SignedIn>
          <span className="text-sm text-slate-700 font-light">
            환영합니다 {user?.firstName || user?.username}님!
          </span>
          <UserButton afterSignOutUrl="/" />
        </SignedIn>

        <SignedOut>
          <button 
            onClick={() => navigate('/login')}
            className="text-sm font-semibold text-slate-700 hover:text-indigo-600 transition"
          >
            로그인
          </button>
          <button 
            onClick={() => navigate('/signup')}
            className="bg-indigo-600 text-white px-5 py-2 rounded-full text-sm font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition active:scale-95"
          >
            회원가입
          </button>
        </SignedOut>
      </div>
    </nav>
  );
};

export default Navbar;
