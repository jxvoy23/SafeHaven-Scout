import React, { useState, useEffect } from 'react';
import Hero from './components/Hero';
import SearchForm from './components/SearchForm';
import ResultsView from './components/ResultsView';
import { SearchParams, SafetyScoutResponse, LoadingState } from './types';
import { analyzeSafety } from './services/geminiService';
import { AlertCircle, History, LogOut, LogIn, User as UserIcon } from 'lucide-react';

// Firebase Imports
import { signInWithPopup, signOut, onAuthStateChanged, User } from "firebase/auth";
import { auth, googleProvider, db } from "./firebaseConfig";
import { collection, addDoc, query, where, orderBy, getDocs, serverTimestamp, Timestamp, setDoc, doc } from "firebase/firestore";

// Define a type for our History Items
interface HistoryItem {
  id: string;
  searchCriteria: SearchParams;
  aiSummary: string;
  timestamp: Timestamp;
}

const App: React.FC = () => {
  // State for App Logic
  const [loadingState, setLoadingState] = useState<LoadingState>({ status: 'idle' });
  const [results, setResults] = useState<SafetyScoutResponse | null>(null);
  
  // State for Auth & Navigation
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<'home' | 'history'>('home');
  const [historyList, setHistoryList] = useState<HistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // 1. Listen for Authentication Changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setView('home'); // Send back to home if they log out
        setHistoryList([]);
      }
    });
    return () => unsubscribe();
  }, []);

  // 2. Auth Functions
  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Create/Update the 'users' collection in Firestore immediately
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        lastLogin: serverTimestamp()
      }, { merge: true }); // merge ensures we update lastLogin without deleting old data

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

  // 3. Fetch History Function
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

  // Toggle View Handler
  const toggleView = () => {
    if (view === 'home') {
      setView('history');
      fetchHistory();
    } else {
      setView('home');
    }
  };

  // 4. Main Search Logic (Updated with Saving)
  const handleSearch = async (params: SearchParams) => {
    setLoadingState({ status: 'loading' });
    setResults(null);
    try {
      // Call Gemini
      const data = await analyzeSafety(params);
      setResults(data);
      setLoadingState({ status: 'success' });

      // Save to Firestore if user is logged in
      if (user) {
        await addDoc(collection(db, "sessions"), {
          userId: user.uid,
          userEmail: user.email,
          searchCriteria: params,
          aiSummary: data.summary,
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

  return (
    <div className="min-h-screen pb-12 flex flex-col bg-slate-50">
      
      {/* --- Top Navigation Bar --- */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('home')}>
             <div className="bg-emerald-600 rounded p-1">
               <UserIcon className="w-5 h-5 text-white" /> 
             </div>
             <span className="font-bold text-slate-800 text-lg hidden sm:block">SafeHaven Scout</span>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <button 
                  onClick={toggleView}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                    ${view === 'history' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                  <History className="w-4 h-4" />
                  {view === 'history' ? 'Back to Search' : 'My History'}
                </button>
                
                <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
                  <img 
                    src={user.photoURL || ''} 
                    alt="Profile" 
                    className="w-8 h-8 rounded-full border border-slate-200"
                  />
                  <button 
                    onClick={handleLogout}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                    title="Sign Out"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </>
            ) : (
              <button 
                onClick={handleLogin}
                className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors shadow-sm"
              >
                <LogIn className="w-4 h-4" />
                Sign In to Save
              </button>
            )}
          </div>
        </div>
      </header>

      {/* --- Main Content Area --- */}
      <main className="flex-grow">
        
        {/* VIEW: History List */}
        {view === 'history' && user && (
          <div className="container mx-auto px-4 py-8 max-w-4xl animate-in fade-in slide-in-from-bottom-2">
            <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <History className="text-emerald-500" />
              Your Scouting History
            </h2>
            
            {historyLoading ? (
               <div className="text-center py-12 text-slate-400">Loading history...</div>
            ) : historyList.length === 0 ? (
               <div className="text-center py-12 bg-white rounded-xl border border-slate-200 border-dashed">
                 <p className="text-slate-500">No searches saved yet.</p>
                 <button onClick={() => setView('home')} className="text-emerald-600 font-medium mt-2 hover:underline">Start a new search</button>
               </div>
            ) : (
              <div className="space-y-4">
                {historyList.map((item) => (
                  <div key={item.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-lg text-slate-800">
                        {item.searchCriteria.city}, {item.searchCriteria.state}
                      </h3>
                      <span className="text-xs text-slate-400 font-mono">
                        {item.timestamp?.toDate().toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex gap-2 mb-3 text-xs">
                      <span className="bg-slate-100 px-2 py-1 rounded text-slate-600">Budget: ${item.searchCriteria.maxPrice}</span>
                      <span className="bg-slate-100 px-2 py-1 rounded text-slate-600">{item.searchCriteria.bedrooms} Beds</span>
                    </div>
                    <p className="text-slate-600 text-sm line-clamp-2">{item.aiSummary}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* VIEW: Search & Results (Home) */}
        {view === 'home' && (
          <>
            <Hero />
            
            <div className="container mx-auto px-4">
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
            </div>
          </>
        )}
      </main>

      <footer className="mt-auto py-8 text-center text-slate-400 text-sm border-t border-slate-200 bg-white">
        <p>&copy; {new Date().getFullYear()} SafeHaven Scout. AI Powered Real Estate Assistance.</p>
      </footer>
    </div>
  );
};

export default App;