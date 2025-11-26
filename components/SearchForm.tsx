import React, { useState } from 'react';
import { SearchParams } from '../types';
import { Search, MapPin, DollarSign, BedDouble, FileText } from 'lucide-react';

interface SearchFormProps {
  onSearch: (params: SearchParams) => void;
  isLoading: boolean;
}

const SearchForm: React.FC<SearchFormProps> = ({ onSearch, isLoading }) => {
  const [formData, setFormData] = useState<SearchParams>({
    city: '',
    state: '',
    maxPrice: 2000,
    bedrooms: 2,
    preferences: ''
  });

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
    <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 -mt-10 relative z-20 max-w-4xl mx-auto border border-slate-100">
      <h2 className="text-xl font-semibold text-slate-800 mb-6 flex items-center gap-2">
        <Search className="w-5 h-5 text-emerald-600" />
        Start Your Scout
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Location Group */}
          <div className="space-y-4">
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-slate-600 mb-1">City</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  id="city"
                  name="city"
                  required
                  placeholder="e.g. Miami"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label htmlFor="state" className="block text-sm font-medium text-slate-600 mb-1">State (2-letter code)</label>
              <input
                type="text"
                id="state"
                name="state"
                required
                maxLength={2}
                placeholder="e.g. FL"
                value={formData.state}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors uppercase"
              />
            </div>
          </div>

          {/* Details Group */}
          <div className="space-y-4">
            <div>
              <label htmlFor="maxPrice" className="block text-sm font-medium text-slate-600 mb-1">Max Budget</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <input
                  type="number"
                  id="maxPrice"
                  name="maxPrice"
                  required
                  min={1}
                  value={formData.maxPrice}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label htmlFor="bedrooms" className="block text-sm font-medium text-slate-600 mb-1">Bedrooms</label>
              <div className="relative">
                <BedDouble className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <input
                  type="number"
                  id="bedrooms"
                  name="bedrooms"
                  required
                  min={0}
                  value={formData.bedrooms}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="preferences" className="block text-sm font-medium text-slate-600 mb-1">
            Preferences & Keywords
          </label>
          <div className="relative">
            <FileText className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
            <input
              type="text"
              id="preferences"
              name="preferences"
              placeholder="e.g. near good schools, quiet streets, close to park"
              value={formData.preferences}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-3 px-6 rounded-xl text-white font-medium text-lg transition-all shadow-md
            ${isLoading 
              ? 'bg-slate-400 cursor-not-allowed' 
              : 'bg-emerald-600 hover:bg-emerald-700 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0'
            }`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
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