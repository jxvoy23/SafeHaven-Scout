import React, { useState, useEffect, useRef } from 'react';
import Hero from './components/Hero';
import SearchForm from './components/SearchForm';
import ResultsView from './components/ResultsView';
import { SearchParams, SafetyScoutResponse, LoadingState, WeatherData } from './types'; // Added WeatherData
import { analyzeSafety } from './services/geminiService';
import { getWeather } from './services/weatherService'; // Import the new service
import { AlertCircle, History, LogOut, User as UserIcon, ShieldCheck, ArrowRight, Repeat, ExternalLink } from 'lucide-react';

import { signInWithPopup, signOut, onAuthStateChanged, User } from "firebase/auth";
import { auth, googleProvider, db } from "./firebaseConfig";
import { collection, addDoc, query, where, orderBy, getDocs, serverTimestamp, Timestamp, setDoc, doc } from "firebase/firestore";

interface HistoryItem {
  id: string;
  searchCriteria: SearchParams;
  aiSummary: string;
  timestamp: Timestamp;
}

const App: React.FC = () => {
  const [loadingState, setLoadingState] = useState<LoadingState>({ status: 'idle' });
  const [results, setResults] = useState<SafetyScoutResponse | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null); // New State for Weather
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<'home' | 'history'>('home');
  const [historyList, setHistoryList] = useState<HistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [reuseData, setReuseData] = useState<SearchParams | undefined>(undefined);
  
  const [isInAppBrowser, setIsInAppBrowser] = useState(false);

  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ua = navigator.userAgent || navigator.vendor || (window as any).opera;
    if ((ua.indexOf("Instagram") > -1) || (ua.indexOf("FBAN") > -1) || (ua.indexOf("FBAV") > -1)) {
      setIsInAppBrowser(true);
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthChecking(false);
      if (!currentUser) {
        setView('home'); 
        setHistoryList([]);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        lastLogin: serverTimestamp()
      }, { merge: true }); 
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const fetchHistory = async () => {
    if (!user) return;
    setHistoryLoading(true);
    try {
      const q = query(
        collection(db, "sessions"),
        where("userId", "==", user.uid),
        orderBy("timestamp", "desc")
      );
      const querySnapshot = await getDocs(q);
      const items: HistoryItem[] = [];
      querySnapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() } as HistoryItem);
      });
      setHistoryList(items);
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setHistoryLoading(false);
    }
  };

  const toggleView = () => {
    if (view === 'home') {
      setView('history');
      fetchHistory();
    } else {
      setView('home');
    }
  };

  const handleReuseSearch = (criteria: SearchParams) => {
    setReuseData(criteria);
    setView('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearch = async (params: SearchParams) => {
    setLoadingState({ status: 'loading' });
    setResults(null);
    setWeather(null); // Reset weather
    
    try {
      // Execute both API calls in parallel
      const [aiData, weatherData] = await Promise.all([
        analyzeSafety(params),
        getWeather(params.city)
      ]);

      setResults(aiData);
      setWeather(weatherData); // Store weather data
      setLoadingState({ status: 'success' });

      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);

      if (user) {
        await addDoc(collection(db, "sessions"), {
          userId: user.uid,
          userEmail: user.email,
          searchCriteria: params,
          aiSummary: aiData.summary,
          timestamp: serverTimestamp()
        });
      }
    } catch (error) {
      setLoadingState({ 
        status: 'error', 
        message: error instanceof Error ? error.message : "An unexpected error occurred while scouting."
      });
    }
  };

  const AnimatedBackground = () => (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-slate-50">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
    </div>
  );

  if (isInAppBrowser) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center px-6 text-center text-white">
        <ShieldCheck className="w-16 h-16 text-emerald-500 mb-6" />
        <h2 className="text-2xl font-bold mb-4">Open in Browser</h2>
        <p className="text-slate-300 mb-8 max-w-md">
          Instagram's built-in browser doesn't support secure Google Sign-In. 
          Please open this link in Safari or Chrome.
        </p>
        <div className="bg-white/10 p-4 rounded-xl border border-white/20 flex flex-col gap-2 items-center text-sm">
          <div className="flex items-center gap-2">
            <span className="bg-slate-800 p-1 rounded">•••</span> 
            <span>Tap the 3 dots at the top right</span>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 rotate-90" />
          <div className="flex items-center gap-2 font-bold text-emerald-400">
            <ExternalLink className="w-4 h-4" />
            Open in Browser
          </div>
        </div>
      </div>
    );
  }

  if (authChecking) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-emerald-600 font-medium">Loading SafeHaven...</div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900">
        <div className="absolute inset-0 opacity-20" style={{backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '30px 30px'}}></div>
        
        <div className="relative z-10 max-w-2xl animate-in fade-in zoom-in duration-700">
          <div className="bg-white/10 p-5 rounded-full w-28 h-28 mx-auto mb-8 flex items-center justify-center backdrop-blur-md border border-white/20 shadow-[0_0_40px_rgba(16,185,129,0.4)]">
             <ShieldCheck className="w-14 h-14 text-emerald-400" />
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-emerald-200 mb-6 tracking-tight drop-shadow-lg">
            SafeHaven Scout
          </h1>
          <p className="text-xl text-slate-200 mb-10 leading-relaxed font-light">
            Your AI-powered companion for finding safe, affordable, and family-friendly neighborhoods.
          </p>
          <button 
            onClick={handleLogin}
            className="group relative bg-emerald-500 hover:bg-emerald-400 text-white text-lg font-bold py-4 px-10 rounded-full transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(16,185,129,0.4)] flex items-center gap-3 mx-auto overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            <span className="relative">Get Started</span>
            <ArrowRight className="relative w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-12 flex flex-col relative font-sans text-slate-900">
      <AnimatedBackground />
      
      <header className="bg-white/70 backdrop-blur-md border-b border-white/40 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between relative">
          <div className="flex items-center gap-2 cursor-pointer group" onClick={() => setView('home')}>
             <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg p-1.5 shadow-md group-hover:shadow-lg transition-shadow">
               <UserIcon className="w-5 h-5 text-white" /> 
             </div>
             <span className="font-bold text-slate-800 text-lg hidden sm:block tracking-tight">SafeHaven Scout</span>
          </div>

          <span className="hidden md:block text-slate-600 font-medium absolute left-1/2 -translate-x-1/2">
            Welcome {user.displayName}
          </span>

          <div className="flex items-center gap-4">
            <button 
              onClick={toggleView}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all
                ${view === 'history' 
                  ? 'bg-emerald-100 text-emerald-800 shadow-inner' 
                  : 'text-slate-600 hover:bg-white/50 hover:text-slate-900'}`}
            >
              <History className="w-4 h-4" />
              {view === 'history' ? 'Back to Search' : 'My History'}
            </button>
            
            <div className="flex items-center gap-3 pl-3 border-l border-slate-300/50">
              {user.photoURL ? (
                <img src={user.photoURL} alt="Profile" className="w-9 h-9 rounded-full border-2 border-white shadow-sm ring-2 ring-slate-100" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center text-emerald-700 font-bold shadow-sm">
                  {user.displayName?.[0] || 'U'}
                </div>
              )}
              <button 
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50/50 rounded-full transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow relative z-10">
        {view === 'history' && user && (
          <div className="container mx-auto px-4 py-8 max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-3xl font-bold text-slate-800 mb-8 flex items-center gap-3">
              <History className="text-emerald-500 w-8 h-8" />
              Your History
            </h2>
            
            {historyLoading ? (
               <div className="text-center py-12 text-slate-400">Loading history...</div>
            ) : historyList.length === 0 ? (
               <div className="text-center py-16 glass-panel rounded-3xl">
                 <p className="text-slate-500 text-lg">No searches saved yet.</p>
                 <button onClick={() => setView('home')} className="text-emerald-600 font-bold mt-3 hover:underline">Start a new search</button>
               </div>
            ) : (
              <div className="grid gap-5">
                {historyList.map((item) => (
                  <div key={item.id} className="glass-card p-6 rounded-2xl relative group">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-bold text-xl text-slate-900">
                        {item.searchCriteria.city}, {item.searchCriteria.state}
                      </h3>
                      <span className="text-xs text-slate-500 font-mono bg-white/50 px-2 py-1 rounded-md border border-slate-200">
                        {item.timestamp?.toDate().toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex gap-2 mb-4 text-xs">
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-3 py-1 rounded-full font-medium">Budget: ${item.searchCriteria.maxPrice}</span>
                      <span className="bg-blue-50 text-blue-700 border border-blue-100 px-3 py-1 rounded-full font-medium">{item.searchCriteria.bedrooms} Beds</span>
                    </div>
                    <p className="text-slate-600 text-sm line-clamp-2 leading-relaxed mb-4">{item.aiSummary}</p>
                    
                    <button 
                      onClick={() => handleReuseSearch(item.searchCriteria)}
                      className="w-full mt-2 py-2 px-4 bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 font-medium rounded-xl transition-colors flex items-center justify-center gap-2 border border-slate-200 hover:border-emerald-200"
                    >
                      <Repeat className="w-4 h-4" />
                      Reuse & Edit Search
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {view === 'home' && (
          <>
            <Hero />
            <div className="container mx-auto px-4 relative z-20">
              <SearchForm 
                onSearch={handleSearch} 
                isLoading={loadingState.status === 'loading'} 
                initialValues={reuseData} 
              />
              
              {loadingState.status === 'error' && (
                <div className="max-w-4xl mx-auto mt-8 p-4 bg-red-50/90 backdrop-blur-sm border border-red-200 rounded-xl flex items-center gap-3 text-white animate-in fade-in slide-in-from-bottom-2 shadow-lg">
                  <AlertCircle className="w-6 h-6 flex-shrink-0" />
                  <div>
                    <p className="font-bold">Scouting failed</p>
                    <p className="text-sm opacity-90">{loadingState.message}</p>
                  </div>
                </div>
              )}

              {loadingState.status === 'success' && results && (
                <div ref={resultsRef}> 
                  <ResultsView data={results} weather={weather} /> 
                </div>
              )}

              {loadingState.status === 'idle' && (
                <div className="text-center mt-20 text-slate-400 animate-in fade-in duration-1000 delay-300">
                   <p className="text-sm font-medium uppercase tracking-[0.2em] mb-3 opacity-70">Ready to Scout</p>
                   <p className="text-slate-400 text-lg font-light">Enter your location and budget above to begin.</p>
                </div>
              )}
            </div>
          </>
        )}
      </main>

      <footer className="mt-auto py-8 text-center text-slate-500 text-sm border-t border-slate-200/50 bg-white/40 backdrop-blur-sm">
        <p>&copy; {new Date().getFullYear()} SafeHaven Scout. AI Powered Real Estate Assistance.</p>
      </footer>
    </div>
  );
};

export default App;