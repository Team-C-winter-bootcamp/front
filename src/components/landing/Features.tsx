import { motion } from 'framer-motion';
import { FeatureSection } from '../../types/landing';
import { CheckCircle2, Search, FileText, BarChart3, MessageSquare, ShieldCheck } from 'lucide-react';
import pick from '../../assets/pick.gif';
import checklist from '../../assets/checklist.gif';
import pan from '../../assets/pan.webp';
import solu from '../../assets/solu.webp';
import detail from '../../assets/detail.webp';

const features: (FeatureSection & { icon: any })[] = [
  {
    id: 'select',
    title: '분야별 맞춤 법률 가이드',
    description: '어떤 법률 고민을 안고 계신가요? 못 받은 돈부터 임대차 문제까지, 해결이 필요한 분야를 선택해주세요.',
    details: [
      '6가지 법률 분야 완벽 대응',
      '클릭 한 번으로 시작하는 맞춤 분석',
      '복잡한 기타 사건도 유연하게 처리'
    ],
    image: pick,
    icon: ShieldCheck
  },
  {
    id: 'matching',
    title: 'AI와 대화하듯 쉬운 상황 진단',
    description: '법률 용어를 몰라도 괜찮습니다. 겪으신 일을 친구에게 말하듯 편안하게 적어주시면 AI가 핵심 쟁점을 파악합니다.',
    details: [
      '직관적인 대화형 인터페이스',
      '구체적인 상황 묘사로 분석 정확도 UP'
    ],
    image: checklist,
    reverse: true,
    icon: MessageSquare
  },
  {
    id: 'precedent',
    title: '데이터로 증명하는 유사 판례 매칭',
    description: '내 사건은 법원에서 어떻게 판결 났을까요? 방대한 법률 데이터 속에서 가장 유사한 실제 판례를 찾아드립니다.',
    details: [
      'AI 알고리즘 기반 정밀 판례 매칭',
      '사건 유사도 점수로 신뢰성 확인',
      '판례 원문 및 핵심 쟁점 즉시 확인'
    ],
    image: pan,
    icon: Search
  },
  {
    id: 'summary',
    title: '3분 만에 이해하는 핵심 요약',
    description: '수십 페이지에 달하는 복잡한 판결문, 읽다가 포기하지 마세요. 어려운 법률 용어를 걷어내고 핵심 내용만 쉽게 요약해 드립니다.',
    details: [
      'AI 요약으로 판결 요지 즉시 파악',
      '난해한 법률 용어를 일상 언어로 해설',
      '사건의 승패 요인 한눈에 확인'
    ],
    image: detail,
    reverse: true,
    icon: FileText
  },
  {
    id: 'advice',
    title: '데이터로 보는 승소 가능성',
    description: '"얼마나 받을 수 있을까?" 막연한 추측 대신 눈에 보이는 데이터로 확인하세요. 유사 판례와 비교 분석하여 예상 형량부터 적정 합의금까지 구체적인 수치를 제시합니다.',
    details: [
      '내 사건 vs 유사 판례 5가지 지표 정밀 비교', 
      '빅데이터 기반 예상 형량 분포 및 적정 합의금 산출', 
      '판결을 꿰뚫는 AI 핵심 법리 판단과 근거 제공' 
    ],
    image: solu,
    icon: BarChart3
  },
  {
    id: 'draft',
    title: '법률 문서 자동 완성',
    description: '내용증명부터 고소장까지, 빈칸만 채우면 끝납니다. 전문 변호사가 감수한 양식으로 완벽한 법률 문서를 1분 만에 작성하세요.',
    details: [
      '표준 법률 문서 서식 제공',
      '분석된 정보를 반영한 빠른 문서 작성',
      '원터치로 PDF 다운로드'
    ],
    image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=2070&auto=format&fit=crop',
    reverse: true,
    icon: CheckCircle2
  }
];

const Features = () => {
  return (
    <section className="py-32 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-32"
        >
          <h2 className="text-4xl md:text-5xl font-black mb-6 text-slate-900 tracking-tight">강력한 주요 기능</h2>
          <div className="w-20 h-1.5 bg-indigo-600 mx-auto rounded-full"></div>
        </motion.div>

        {features.map((feature, idx) => (
          <div 
            key={feature.id} 
            className={`flex flex-col ${feature.reverse ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-16 md:gap-24 mb-40 last:mb-0`}
          >
            <motion.div 
              initial={{ opacity: 0, x: feature.reverse ? 40 : -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="flex-1"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm">
                  <feature.icon size={24} strokeWidth={2.5} />
                </div>
                <span className="text-indigo-600 font-black text-sm tracking-widest uppercase">Feature 0{idx + 1}</span>
              </div>
              
              <h3 className="text-3xl md:text-4xl font-black mb-8 text-slate-900 tracking-tight leading-tight">
                {feature.title}
              </h3>
              
              <p className="text-xl text-slate-500 mb-10 leading-relaxed font-medium">
                {feature.description}
              </p>
              
              <ul className="grid grid-cols-1 gap-5">
                {feature.details.map((detail, dIdx) => (
                  <motion.li 
                    key={dIdx} 
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + (dIdx * 0.1) }}
                    className="flex items-start gap-4 text-slate-700 group"
                  >
                    <div className="mt-1 flex-shrink-0 w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center transition-colors group-hover:bg-emerald-100">
                      <CheckCircle2 size={14} className="text-emerald-600 stroke-[3]" />
                    </div>
                    <span className="font-bold text-[17px] leading-snug">{detail}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9, x: feature.reverse ? -40 : 40 }}
              whileInView={{ opacity: 1, scale: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="flex-1 w-full"
            >
              <div className="relative group">
                <div className="absolute -inset-6 bg-gradient-to-br from-indigo-500/10 to-violet-500/10 rounded-[3rem] blur-2xl opacity-0 group-hover:opacity-100 transition duration-700"></div>
                <motion.div 
                  whileHover={{ y: -10, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="relative"
                >
                  <img 
                    src={feature.image} 
                    alt={feature.title} 
                    width={800}
                    height={600}
                    className="relative rounded-[2.5rem] shadow-2xl border-4 border-white z-10 w-full object-cover aspect-[4/3]"
                  />
                </motion.div>
              </div>
            </motion.div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Features;
