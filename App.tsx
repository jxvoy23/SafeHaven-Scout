import React, { useState } from 'react';
import Hero from './components/Hero';
import SearchForm from './components/SearchForm';
import ResultsView from './components/ResultsView';
import { SearchParams, SafetyScoutResponse, LoadingState } from './types';
import { analyzeSafety } from './services/geminiService';
import { AlertCircle } from 'lucide-react';

const App: React.FC = () => {
  const [loadingState, setLoadingState] = useState<LoadingState>({ status: 'idle' });
  const [results, setResults] = useState<SafetyScoutResponse | null>(null);

  const handleSearch = async (params: SearchParams) => {
    setLoadingState({ status: 'loading' });
    setResults(null);
    try {
      const data = await analyzeSafety(params);
      setResults(data);
      setLoadingState({ status: 'success' });
    } catch (error) {
      setLoadingState({ 
        status: 'error', 
        message: error instanceof Error ? error.message : "An unexpected error occurred while scouting."
      });
    }
  };

  return (
    <div className="min-h-screen pb-12 flex flex-col">
      <Hero />
      
      <main className="flex-grow container mx-auto px-4">
        <SearchForm onSearch={handleSearch} isLoading={loadingState.status === 'loading'} />
        
        {loadingState.status === 'error' && (
          <div className="max-w-4xl mx-auto mt-8 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700 animate-in fade-in slide-in-from-bottom-2">
            <AlertCircle className="w-6 h-6 flex-shrink-0" />
            <div>
              <p className="font-semibold">Scouting failed</p>
              <p className="text-sm">{loadingState.message}</p>
            </div>
          </div>
        )}

        {loadingState.status === 'success' && results && (
          <ResultsView data={results} />
        )}

        {loadingState.status === 'idle' && (
          <div className="text-center mt-16 text-slate-400">
             <p className="text-sm font-medium uppercase tracking-widest mb-2">Ready to Scout</p>
             <p className="text-slate-300">Enter your location and budget above to begin.</p>
          </div>
        )}
      </main>

      <footer className="mt-auto py-8 text-center text-slate-400 text-sm">
        <p>&copy; {new Date().getFullYear()} SafeHaven Scout. AI Powered Real Estate Assistance.</p>
      </footer>
    </div>
  );
};

export default App;