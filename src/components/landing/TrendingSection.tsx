
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const data = [
  { name: '교통사고', value: 920, color: '#2563eb' },
  { name: '전세 보증금 분쟁', value: 850, color: '#3b82f6' },
  { name: '이혼/상속', value: 760, color: '#60a5fa' },
  { name: '사기/보이스피싱', value: 600, color: '#93c5fd' },
  { name: '명예훼손', value: 530, color: '#bfdbfe' },
  { name: '층간소음', value: 500, color: '#dbeafe' },
];

const TrendingSection = () => {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3">LAWDING과 함께라면 전문가의 도움없이 상황을 빠르게 대체할 수 있습니다!</h2>
          <p className="text-slate-500">최근 6개월 동안 가장 많이 검색된 법적 주제 TOP 6</p>
        </div>

        <div className="h-[350px] w-full bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 13}} dy={15} />
              <YAxis hide />
              <Tooltip 
                cursor={{fill: '#f8fafc'}}
                contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}}
              />
              <Bar dataKey="value" radius={[12, 12, 0, 0]} barSize={40}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
};

export default TrendingSection;
