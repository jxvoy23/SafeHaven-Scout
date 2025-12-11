export interface SearchParams {
  city: string;
  state: string;
  maxPrice: number;
  bedrooms: number;
  preferences: string;
}

export interface NeighborhoodInsight {
  name: string;
  zip_code: string;
  insight: string;
  safety_score: number; // 1-100 scale estimate
}

// --- NEW INTERFACES ---
export interface WeatherData {
  temperature: number;
  conditionCode: number;
  windSpeed: number;
  isDay: number;
}
// ----------------------

export interface SafetyScoutResponse {
  summary: string;
  search_criteria: {
    city: string;
    state: string;
    price_max: number;
    bedrooms_min: number;
    recommended_zip_codes: string[];
  };
  safety_tips: string[];
  neighborhoods: NeighborhoodInsight[];
}

export interface LoadingState {
  status: 'idle' | 'loading' | 'success' | 'error';
  message?: string;
}