import React from 'react';
import { SafetyScoutResponse } from '../types';
import { Shield, CheckCircle, Info, MapPin } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface ResultsViewProps {
  data: SafetyScoutResponse;
}

const ResultsView: React.FC<ResultsViewProps> = ({ data }) => {
  // Prepare data for the safety chart
  const chartData = data.neighborhoods.map(n => ({
    name: n.name.split(' ')[0], // Shorten name for x-axis
    full_name: n.name,
    score: n.safety_score,
  }));

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-700 slide-in-from-bottom-4">
      
      {/* Summary Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-emerald-50 px-6 py-4 border-b border-emerald-100 flex items-center gap-3">
          <Shield className="text-emerald-600 w-6 h-6" />
          <h2 className="text-xl font-bold text-emerald-900">Scout Summary</h2>
        </div>
        <div className="p-6">
          <p className="text-slate-700 leading-relaxed text-lg">{data.summary}</p>
          <div className="mt-6 flex flex-wrap gap-3">
             <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-slate-100 text-slate-700 border border-slate-200">
               Budget: ${data.search_criteria.price_max}
             </span>
             <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-slate-100 text-slate-700 border border-slate-200">
               Beds: {data.search_criteria.bedrooms_min}+
             </span>
             <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-slate-100 text-slate-700 border border-slate-200">
               Location: {data.search_criteria.city}, {data.search_criteria.state}
             </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Neighborhood Cards */}
        <div className="lg:col-span-2 space-y-6">
           <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
             <MapPin className="w-6 h-6 text-emerald-500" />
             Recommended Areas
           </h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {data.neighborhoods.map((area, idx) => (
               <div key={idx} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-shadow flex flex-col h-full">
                 <div className="flex justify-between items-start mb-3">
                   <div>
                     <h4 className="font-bold text-lg text-slate-900">{area.name}</h4>
                     <span className="text-sm font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                       {area.zip_code}
                     </span>
                   </div>
                   <div className="flex flex-col items-center justify-center bg-emerald-50 text-emerald-700 rounded-lg p-2 min-w-[3.5rem]">
                     <span className="text-xs font-semibold uppercase tracking-tighter">Score</span>
                     <span className="text-xl font-bold">{area.safety_score}</span>
                   </div>
                 </div>
                 <p className="text-slate-600 text-sm flex-grow">{area.insight}</p>
               </div>
             ))}
           </div>

           {/* Visualization */}
           <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mt-6">
              <h4 className="font-semibold text-slate-700 mb-4">Safety Score Comparison</h4>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <XAxis dataKey="name" tick={{fontSize: 12}} stroke="#94a3b8" />
                    <YAxis hide domain={[0, 100]} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      cursor={{fill: 'transparent'}}
                    />
                    <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.score > 85 ? '#10b981' : '#34d399'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
           </div>
        </div>

        {/* Sidebar: Safety Tips & Disclaimer */}
        <div className="space-y-6">
          <div className="bg-blue-50 rounded-xl border border-blue-100 p-6">
            <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
              <Info className="w-5 h-5" />
              Safety Tips for {data.search_criteria.city}
            </h3>
            <ul className="space-y-3">
              {data.safety_tips.map((tip, idx) => (
                <li key={idx} className="flex items-start gap-3 text-blue-800 text-sm">
                  <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-600" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-slate-100 rounded-xl p-6 text-xs text-slate-500 leading-relaxed border border-slate-200">
            <p className="font-semibold mb-2 text-slate-600">Disclaimer</p>
            The safety scores and insights provided are estimates generated by AI based on general data patterns. 
            Real estate market conditions and neighborhood safety can change rapidly. 
            Always verify information with local police departments, check official crime statistics, 
            and visit the neighborhood personally at different times of day before making a decision.
          </div>
        </div>

      </div>
    </div>
  );
};

export default ResultsView;