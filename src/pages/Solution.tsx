import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation, useParams, useSearchParams } from 'react-router-dom';
import { Layout } from '../components/ui/Layout';
import { Card } from '../components/ui/Card';
import { Scale, Gavel, TrendingDown, AlertCircle, FileText, Mail, Check, Star, Loader2, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { caseService } from '../api';
import { 
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, 
  RadarChart, PolarGrid, PolarAngleAxis, Radar, Tooltip, Cell, Legend
} from 'recharts';

export interface AnalysisData {
  outcome_prediction: {
    probability: string;
    expected_result: string;
    expected_compensation: string;
    estimated_duration: string;
    sentence_distribution: Array<{ name: string; value: number | string }>;
    radar_data: Array<{ subject: string; A: number; B: number; fullMark: number }>;
    compensation_distribution: Array<{ range: string; count: number | string; is_target?: string | boolean }>;
  };
  action_roadmap: Array<{ title: string; description: string }>;
  legal_foundation: {
    logic: string;
    relevant_precedents: Array<{ case_number: string; key_points: string[] }>;
  };
}

export default function Solution() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { precedentsId } = useParams<{ precedentsId: string }>();
  
  const state = location.state as { caseId?: number; precedentsId?: string } | null;
  const caseId = state?.caseId || Number(searchParams.get('case_id')) || null;

  // [캐싱 로직] 초기화 시 로컬 스토리지에서 먼저 데이터를 찾습니다.
  const [caseDetail, setCaseDetail] = useState<AnalysisData | null>(() => {
    if (caseId && precedentsId) {
      const savedData = localStorage.getItem(`analysis_${caseId}_${precedentsId}`);
      return savedData ? JSON.parse(savedData) : null;
    }
    return null;
  });

  // 데이터가 이미 있으면 로딩을 생략합니다.
  const [isLoading, setIsLoading] = useState(!caseDetail);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const fetchCaseDetail = async () => {
      if (!caseId || !precedentsId) {
        setIsLoading(false);
        setIsError(true);
        return;
      }

      // 이미 캐시된 데이터가 있다면 API 호출을 중단합니다.
      if (caseDetail) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const response = await caseService.getCaseDetail(precedentsId, caseId);
        const fetchedData = (response as any).data || response;
        
        // 브라우저에 데이터 저장 (새로고침 시 로딩 방지)
        localStorage.setItem(`analysis_${caseId}_${precedentsId}`, JSON.stringify(fetchedData));
        
        setCaseDetail(fetchedData);
      } catch (error) {
        console.error('API 호출 실패:', error);
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCaseDetail();
  }, [caseId, precedentsId, caseDetail]);

  const radarData = useMemo(() => caseDetail?.outcome_prediction?.radar_data || [], [caseDetail]);

  const pieData = useMemo(() => {
    const rawData = caseDetail?.outcome_prediction?.sentence_distribution || [];
    return rawData.map(item => ({
      name: item.name,
      value: typeof item.value === 'string' ? parseInt(item.value) || 0 : item.value
    })).filter(item => item.value > 0);
  }, [caseDetail]);

  const compensationTrendData = useMemo(() => {
    const rawData = caseDetail?.outcome_prediction?.compensation_distribution || [];
    
    // 데이터를 안전하게 숫자로 변환
    const processedData = rawData.map(item => ({
      ...item,
      count: Number(item.count) || 0
    }));

    // 1. 값(count) 기준으로 내림차순 정렬된 인덱스 맵 생성
    const sortedIndices = [...processedData].sort((a, b) => b.count - a.count);
    
    // 2. 진한색부터 연한색 순서 (Indigo 계열)
    const colors = [
      '#4338ca', // indigo-700
      '#4f46e5', // indigo-600
      '#6366f1', // indigo-500
      '#818cf8', // indigo-400
      '#a5b4fc', // indigo-300
      '#c7d2fe', // indigo-200
      '#e0e7ff', // indigo-100
    ];

    // 3. 각 데이터 항목에 순위에 맞는 색상 할당
    return processedData.map((item) => {
      const rank = sortedIndices.findIndex(si => si.range === item.range);
      return {
        ...item,
        fill: colors[Math.min(rank, colors.length - 1)]
      };
    });
  }, [caseDetail]);

  const recommendedDocument = useMemo(() => {
    if (!caseDetail?.outcome_prediction) return null;
    const prob = parseInt(caseDetail.outcome_prediction.probability) || 0;
    const radar = caseDetail.outcome_prediction.radar_data || [];
    const settlementScore = radar.find((d) => d.subject === '합의여부')?.A || 0;

    if (prob >= 80) return 'complaint';
    if (settlementScore >= 60) return 'agreement';
    return 'notice';
  }, [caseDetail]);

  const handleDocumentSelect = (type: 'agreement' | 'notice' | 'complaint') => {
    const pathMap = { agreement: '/document/agree', notice: '/document/proof', complaint: '/document/goso' };
    navigate(pathMap[type], { 
      state: { 
        case_id: caseId, 
        precedent_id: precedentsId 
      } 
    });
  };

  if (isLoading) return (
    <Layout><div className="py-48 text-center"><Loader2 className="mx-auto animate-spin text-indigo-500 mb-4" size={48} /><p className="font-black text-slate-600">데이터를 분석하고 있습니다...</p></div></Layout>
  );

  if (isError || !caseDetail) return (
    <Layout><div className="py-24 text-center"><AlertCircle className="mx-auto text-red-500 mb-4" size={48} /><h2 className="text-xl font-bold text-red-800">데이터 로드 실패</h2><p className="mt-2 text-slate-500">사건 번호나 ID가 올바르지 않습니다.</p></div></Layout>
  );

  const pieColors = ['#6366f1', '#818cf8', '#a5b4fc'];

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-6 py-12 font-sans">
        <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10 text-center">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight italic underline decoration-indigo-500 underline-offset-8">법례 심층 분석 결과</h1>
          <p className="text-slate-500 mt-6 text-sm font-medium tracking-wide">사건번호 {precedentsId} 기반 정밀 솔루션</p>
        </motion.header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-2 bg-white border-slate-200 shadow-sm border-l-4 border-l-indigo-500">
            <div className="flex items-center gap-2 mb-6"><Scale className="text-indigo-600" /> <h2 className="font-bold text-lg text-slate-800">사건 성격 대조 분석</h2></div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#cbd5e1" strokeWidth={1} />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 13, fontWeight: 800, fill: '#1e293b' }} />
                  <Radar 
                    name="내 사건" 
                    dataKey="A" 
                    stroke="#4338ca" 
                    strokeWidth={3} 
                    fill="#6366f1" 
                    fillOpacity={0.5} 
                  />
                  <Radar 
                    name="유사 판례" 
                    dataKey="B" 
                    stroke="#94a3b8" 
                    strokeWidth={2} 
                    fill="#cbd5e1" 
                    fillOpacity={0.2} 
                  />
                  <Tooltip />
                  <Legend align="right" verticalAlign="middle" layout="vertical" iconType="circle" />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="bg-white border border-slate-200 shadow-sm flex flex-col border-l-4 border-l-indigo-500">
            <div className="flex items-center gap-2 mb-6 text-slate-800"><Gavel className="text-indigo-500" /> <h2 className="font-bold text-lg">예상 형량 분포</h2></div>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} innerRadius={65} outerRadius={85} paddingAngle={8} dataKey="value" stroke="none">
                    {pieData.map((_, i) => (
                      <Cell key={`pie-cell-${i}`} fill={pieColors[i % pieColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-auto space-y-4">
              {pieData.map((item, i) => (
                <div key={i} className="flex justify-between items-center px-2">
                  <span className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: pieColors[i % pieColors.length] }} />
                    <span className="font-bold text-sm text-slate-900">{item.name}</span>
                  </span>
                  <span className="font-black text-lg text-slate-800">{item.value}%</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <Card className="p-8 bg-white border-slate-200 mb-8 shadow-sm border-l-4 border-l-indigo-500">
          <div className="flex items-center gap-2 mb-10 text-slate-800"><TrendingDown className="text-indigo-600" /> 
          <h2 className="font-bold text-xl">적정 합의금 산출 근거</h2></div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-10 items-center">
            <div className="md:col-span-3 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={compensationTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="range" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 12, fontWeight: 600 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <Tooltip cursor={{ fill: '#f8fafc' }} />
                  <Bar dataKey="count" radius={[10, 10, 0, 0]} barSize={65}>
                    {compensationTrendData.map((entry, index) => (
                      <Cell key={`bar-cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="md:col-span-2 relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
              <div className="relative bg-indigo-600 rounded-3xl p-10 text-white text-center shadow-2xl">
                <span className="inline-block px-4 py-1.5 bg-indigo-500/50 rounded-full text-sm font-bold uppercase mb-5 tracking-wider">AI 권고 합의금</span>
                <div className="text-2xl font-black leading-tight mb-4">{caseDetail.outcome_prediction?.expected_compensation}</div>
                <div className="text-base font-medium opacity-80 italic">{caseDetail.outcome_prediction?.expected_result}</div>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <Card className="bg-white border-slate-200 shadow-sm border-l-4 border-l-indigo-500 h-full">
            <div className="flex items-center gap-2 mb-6 text-slate-800">
              <Info className="text-indigo-500" size={20} />
              <h2 className="font-bold text-lg">AI 핵심 법리 판단</h2>
            </div>
            <div className="bg-slate-50 rounded-2xl h-[calc(100%-4rem)] overflow-auto p-4">
              <p className="text-slate-700 leading-relaxed text-md whitespace-pre-wrap font-medium">{caseDetail.legal_foundation?.logic}</p>
            </div>
          </Card>

          <Card className="bg-white border-slate-200 shadow-sm h-full border-l-4 border-l-indigo-500">
            <div className="flex items-center gap-2 mb-6 text-slate-800">
              <FileText className="text-indigo-500" size={20} />
              <h2 className="font-bold text-lg">참조 판례 정보</h2>
            </div>
            <div className="space-y-4">
              {caseDetail.legal_foundation?.relevant_precedents.map((prec, idx) => (
                <motion.div 
                  key={idx} 
                  whileHover={{ y: -4 }}
                  className="border border-slate-100 rounded-2xl p-4 hover:border-indigo-500 hover:shadow-md transition-all duration-300 group bg-white"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-slate-900 group-hover:text-indigo-600 text-md transition-colors">{prec.case_number}</span>
                    <span className="text-[11px] font-black text-slate-400">PRECEDENT</span>
                  </div>
                  <ul className="space-y-2">
                    {prec.key_points.map((point, pIdx) => (
                      <li key={pIdx} className="flex gap-2 text-sm text-slate-500 leading-snug"><span className="text-indigo-400 font-bold">•</span>{point}</li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </Card>
        </div>

        <Card className="bg-white border-slate-200 mb-12 shadow-sm p-8 border-l-4 border-l-indigo-500">
          <div className="text-center mb-12"><h2 className="text-2xl font-black text-slate-900 mb-2 underline decoration-indigo-500 underline-offset-8">필요 문서 즉시 작성</h2></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { type: 'agreement', title: '합의서', icon: Check, color: 'bg-emerald-50 text-emerald-600', reason: '원만한 합의 가능성이 높을 때' },
              { type: 'notice', title: '내용증명서', icon: Mail, color: 'bg-indigo-50 text-indigo-600', reason: '상대방에게 경고가 필요할 때' },
              { type: 'complaint', title: '고소장/탄원서', icon: FileText, color: 'bg-rose-50 text-rose-600', reason: '강력한 법적 처벌을 원할 때' }
            ].map((doc) => {
              const isRec = recommendedDocument === doc.type;
              return (
                <div 
                  key={doc.type} 
                  className={`relative rounded-3xl p-8 border transition-all flex flex-col hover:scale-[1.02] duration-300 group
                    ${isRec 
                      ? 'border-indigo-500 bg-white shadow-xl ring-2 ring-indigo-500/10' 
                      : 'border-slate-100 bg-slate-50 opacity-80 hover:opacity-100 hover:bg-white hover:border-indigo-500 hover:shadow-xl'
                    }`}
                >
                  {isRec && <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-4 py-1 rounded-full text-[10px] font-black flex items-center gap-1 shadow-lg"><Star size={12} fill="white" /> AI 추천</div>}
                  <div className={`w-14 h-14 ${doc.color} rounded-2xl flex items-center justify-center mb-6`}>{<doc.icon size={28} />}</div>
                  <h3 className="text-lg font-black text-slate-900 mb-2">{doc.title}</h3>
                  
                  {isRec && (
                    <div className="mb-8 p-3 bg-indigo-50 rounded-xl border border-indigo-100 text-[11px] text-indigo-700 font-bold italic">
                      💡 추천 이유: {doc.reason}
                    </div>
                  )}  
                  
                  <button 
                    onClick={() => handleDocumentSelect(doc.type as any)} 
                    className={`mt-auto w-full py-4 rounded-2xl text-sm font-black transition-all 
                      ${isRec 
                        ? 'bg-indigo-600 text-white shadow-lg' 
                        : 'bg-slate-200 text-slate-500 group-hover:bg-indigo-600 group-hover:text-white group-hover:shadow-lg'
                      }`}
                  >
                    작성 시작하기
                  </button>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </Layout>
  );
}