import React, { useState, useEffect } from 'react';
import { SearchParams } from '../types';
import { Search, MapPin, DollarSign, BedDouble, FileText, Sparkles } from 'lucide-react';

interface SearchFormProps {
  onSearch: (params: SearchParams) => void;
  isLoading: boolean;
  initialValues?: SearchParams; // <--- NEW PROP
}

const SearchForm: React.FC<SearchFormProps> = ({ onSearch, isLoading, initialValues }) => {
  const [formData, setFormData] = useState<SearchParams>({
    city: '',
    state: '',
    maxPrice: 2000,
    bedrooms: 2,
    preferences: ''
  });

  // <--- NEW: Update form when initialValues change (e.g. clicking "Reuse")
  useEffect(() => {
    if (initialValues) {
      setFormData(initialValues);
    }
  }, [initialValues]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'maxPrice' || name === 'bedrooms' ? Number(value) : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(formData);
  };

  return (
    <div className="glass-panel p-8 -mt-10 relative z-20 max-w-4xl mx-auto rounded-3xl border border-white/40 shadow-2xl backdrop-blur-xl bg-white/80">
      <div className="absolute -top-6 left-8 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg flex items-center gap-2">
        <Sparkles className="w-3 h-3" />
        AI Powered
      </div>
      
      <h2 className="text-2xl font-bold text-slate-800 mb-8 flex items-center gap-3">
        <Search className="w-6 h-6 text-emerald-600" />
        Start Your Scout
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Location Group */}
          <div className="space-y-5">
            <div>
              <label htmlFor="city" className="block text-sm font-bold text-slate-600 mb-2 uppercase tracking-wider">City</label>
              <div className="relative group">
                <MapPin className="absolute left-4 top-3.5 w-5 h-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                <input
                  type="text"
                  id="city"
                  name="city"
                  required
                  placeholder="e.g. Miami"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none text-lg"
                />
              </div>
            </div>

            <div>
              <label htmlFor="state" className="block text-sm font-bold text-slate-600 mb-2 uppercase tracking-wider">State</label>
              <input
                type="text"
                id="state"
                name="state"
                required
                maxLength={2}
                placeholder="e.g. FL"
                value={formData.state}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none uppercase font-mono text-lg"
              />
            </div>
          </div>

          {/* Details Group */}
          <div className="space-y-5">
            <div>
              <label htmlFor="maxPrice" className="block text-sm font-bold text-slate-600 mb-2 uppercase tracking-wider">Max Budget</label>
              <div className="relative group">
                <DollarSign className="absolute left-4 top-3.5 w-5 h-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                <input
                  type="number"
                  id="maxPrice"
                  name="maxPrice"
                  required
                  min={1}
                  value={formData.maxPrice}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none text-lg font-mono"
                />
              </div>
            </div>

            <div>
              <label htmlFor="bedrooms" className="block text-sm font-bold text-slate-600 mb-2 uppercase tracking-wider">Bedrooms</label>
              <div className="relative group">
                <BedDouble className="absolute left-4 top-3.5 w-5 h-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                <input
                  type="number"
                  id="bedrooms"
                  name="bedrooms"
                  required
                  min={0}
                  value={formData.bedrooms}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none text-lg font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="preferences" className="block text-sm font-bold text-slate-600 mb-2 uppercase tracking-wider">
            Preferences & Keywords
          </label>
          <div className="relative group">
            <FileText className="absolute left-4 top-3.5 w-5 h-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
            <input
              type="text"
              id="preferences"
              name="preferences"
              placeholder="e.g. near good schools, quiet streets, close to park"
              value={formData.preferences}
              onChange={handleChange}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none text-lg"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-4 px-6 rounded-xl text-white font-bold text-lg transition-all shadow-lg transform hover:scale-[1.02] active:scale-[0.98]
            ${isLoading 
              ? 'bg-slate-400 cursor-not-allowed opacity-70' 
              : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-500/30'
            }`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-3">
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Scouting Area...
            </span>
          ) : (
            'Find Safe Neighborhoods'
          )}
        </button>
      </form>
    </div>
  );
};

export default SearchForm;