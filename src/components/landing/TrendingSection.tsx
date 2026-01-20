
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const data = [
  { name: '지식재산권', value: 920, color: '#6366f1' },
  { name: '기업합병', value: 780, color: '#818cf8' },
  { name: '증권사기', value: 710, color: '#a5b4fc' },
  { name: '공정거래', value: 580, color: '#c7d2fe' },
  { name: '파산/회생', value: 490, color: '#e0e7ff' },
  { name: '부동산', value: 410, color: '#eef2ff' },
];

const TrendingSection: React.FC = () => {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3">Trending Legal Topics</h2>
          <p className="text-slate-500">현재 법률 시장에서 가장 주목받는 검색 키워드입니다.</p>
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
