import React from 'react';

export const SearchSkeleton: React.FC = () => (
  <div className="glass-panel p-8 -mt-10 relative z-20 max-w-4xl mx-auto rounded-3xl border border-white/40 shadow-2xl backdrop-blur-xl bg-white/80 animate-pulse">
    <div className="h-8 bg-slate-200 rounded w-1/4 mb-8"></div>
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-5">
          <div className="h-4 bg-slate-200 rounded w-20"></div>
          <div className="h-12 bg-slate-200 rounded-xl"></div>
          <div className="h-4 bg-slate-200 rounded w-20"></div>
          <div className="h-12 bg-slate-200 rounded-xl"></div>
        </div>
        <div className="space-y-5">
          <div className="h-4 bg-slate-200 rounded w-24"></div>
          <div className="h-12 bg-slate-200 rounded-xl"></div>
          <div className="h-4 bg-slate-200 rounded w-24"></div>
          <div className="h-12 bg-slate-200 rounded-xl"></div>
        </div>
      </div>
      <div className="h-12 bg-slate-200 rounded-xl"></div>
      <div className="h-12 bg-emerald-200 rounded-xl"></div>
    </div>
  </div>
);

export const ResultsSkeleton: React.FC = () => (
  <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-pulse">
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
      <div className="h-4 bg-slate-200 rounded w-full mb-2"></div>
      <div className="h-4 bg-slate-200 rounded w-5/6"></div>
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <div className="h-8 bg-slate-200 rounded w-1/2"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="h-6 bg-slate-200 rounded w-3/4 mb-3"></div>
              <div className="h-4 bg-slate-200 rounded w-1/2 mb-4"></div>
              <div className="h-20 bg-slate-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-6">
        <div className="bg-blue-50 rounded-xl p-6">
          <div className="h-6 bg-blue-200 rounded w-2/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-4 bg-blue-200 rounded w-full"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

