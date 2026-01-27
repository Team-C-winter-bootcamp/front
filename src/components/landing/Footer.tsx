import { Github, MessageCircle, Youtube } from 'lucide-react';

const Footer = () => {
  const menus = [
    {
      title: '서비스',
      items: ['판례 검색', 'AI 상황 진단', '법률 문서 작성', '승소율 예측']
    },
    {
      title: '고객지원',
      items: ['자주 묻는 질문', '이용 가이드', '문의하기', '공지사항']
    },
    {
      title: '정책',
      items: ['이용약관', '개인정보 처리방침', '법적 고지']
    }
  ];

  return (
    <footer className="bg-slate-50 border-t border-slate-200 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 mb-20">
          <div className="lg:col-span-4">
            <span className="text-3xl font-black text-indigo-600 tracking-tighter mb-6 block">LAWDING</span>
            <p className="text-slate-500 text-lg leading-relaxed max-w-sm mb-10 font-medium">
              법률 전문가와 일반인을 위한 가장 똑똑한 AI 법률 파트너.<br />
              어렵게만 느껴졌던 법률 지식을 기술로 대중화합니다.
            </p>
            <div className="flex gap-4">
              {[Github, MessageCircle, Youtube].map((Icon, i) => (
                <button key={i} className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm">
                  <Icon size={20} />
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-3 gap-8">
            {menus.map((menu, idx) => (
              <div key={idx}>
                <h4 className="font-black text-slate-900 mb-6 uppercase tracking-wider text-sm">{menu.title}</h4>
                <ul className="space-y-4">
                  {menu.items.map((item, iIdx) => (
                    <li key={iIdx}>
                      <button className="text-slate-500 hover:text-indigo-600 transition-colors font-medium">
                        {item}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center pt-10 border-t border-slate-200">
          <p className="text-slate-400 text-sm mb-6 md:mb-0 font-medium">
            © 2026 Techeer - LAWDING Team. All rights reserved.
          </p>
          <div className="flex gap-8 text-sm font-bold text-slate-400">
            <button className="hover:text-slate-600 transition-colors">Privacy Policy</button>
            <button className="hover:text-slate-600 transition-colors">Terms of Service</button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
