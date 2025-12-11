# SafeHaven Scout - Copilot Instructions

## Project Overview
SafeHaven Scout is a React + TypeScript + Vite frontend application that uses Google Gemini API for AI-powered real estate safety analysis. It's a full-stack serverless app with Firebase authentication and Firestore persistence.

## Architecture & Critical Patterns

### Core Data Flow
1. **Authentication Layer** (`App.tsx`, `firebaseConfig.ts`)
   - Firebase Auth with Google Sign-In provider
   - `onAuthStateChanged` listener in App.tsx root useEffect gates all authenticated views
   - Unauthenticated users see only Hero component; authenticated users access SearchForm and ResultsView

2. **AI Response Pipeline** (`services/geminiService.ts`)
   - Uses Gemini 2.5 Flash model with **structured output schema** (not free-text)
   - Schema enforces JSON compliance with `responseMimeType: "application/json"` and `responseSchema` object
   - **Critical**: Response validation checks for `neighborhoods.length > 0`, `summary`, and `safety_tips` before accepting
   - API key injected via `import.meta.env.VITE_API_KEY` (Vite convention, not `process.env`)

3. **Firestore Persistence** (`App.tsx` lines ~180-220)
   - Successful searches auto-save to `sessions` collection with user's `uid`
   - History view fetches past searches ordered by timestamp (newest first)
   - Security Rules ensure user isolation (documents scoped to `uid`)

### Component Architecture
- **Presentational Components**: Hero, SearchForm, ResultsView use props-down pattern
- **State Management**: All state lives in App.tsx; components are controlled
- **Toast System**: `ToastContainer` + `Toast` provide non-blocking notifications (success/error/info types)
- **Loading States**: `LoadingSkeleton` components replace content during API calls (better UX than spinners)
- **Error Boundary**: Wraps entire app to catch React rendering errors gracefully

### Type Definitions (`types.ts`)
- `SearchParams`: User input (city, state, maxPrice, bedrooms, preferences)
- `NeighborhoodInsight`: Single area with name, zip_code, insight, safety_score (1-100)
- `SafetyScoutResponse`: Full AI response with summary, search_criteria, safety_tips, neighborhoods array
- `LoadingState`: Tracks async operations with status ('idle'|'loading'|'success'|'error') and message

## Development Workflow

### Build & Run
```bash
npm run dev       # Vite dev server on http://localhost:3000
npm run build     # Creates dist/ for Firebase Hosting
npm run preview   # Serve dist/ locally before deploy
```

### Environment Setup
- **`.env.local`** must contain `VITE_API_KEY=your_gemini_key` (Vite loads with `VITE_` prefix only)
- Firebase config is **hardcoded** in `firebaseConfig.ts` (safe for client-side use)
- **No backend server**: All business logic runs client-side (Gemini API, Firebase SDK)

### Firebase Deployment
```bash
firebase deploy   # Deploys to Firebase Hosting (runs build first)
```

## Code Patterns & Conventions

### Error Handling
- **Gemini API**: Wrap in try-catch; validate response structure before JSON.parse
- **Firestore**: No explicit error handling in current code; consider adding try-catch for production
- **UI Errors**: Show via Toast (`showToast('message', 'error')`) rather than alerts
- **Retry Logic**: Error state includes retry button (see App.tsx `handleSearch` for pattern)

### Performance Optimizations
- `AnimatedBackground` memoized to prevent recreations on renders
- `useCallback` for handlers passed to child components (SearchForm, ResultsView)
- Results automatically scroll into view using `resultsRef` (smooth UX)
- Skeleton loaders during API calls prevent layout shift

### TypeScript Usage
- Strict types on all React components (`React.FC<Props>`)
- `SafetyScoutResponse` ensures type safety for AI responses
- Vite's `import.meta.env` typed as `Record<string, string>` (use non-null assertions if needed)

### Styling & Design
- **Tailwind CSS** for all styling (glassmorphism cards, blur effects)
- Animated blobs background via `@keyframes blob` in `index.css`
- Print-friendly styles in `index.css` for export feature
- Dark/light mode not currently implemented (all components assume light background)

## Common Tasks & Solutions

### Adding a New AI Feature
1. Extend `SearchParams` in `types.ts` with new field
2. Update `scoutSchema` in `geminiService.ts` to include new output property
3. Update `SafetyScoutResponse` interface to match schema
4. Add input field in `SearchForm.tsx`
5. Pass new field in prompt template (lines ~55-65 in geminiService.ts)

### Debugging AI Response Issues
- Add `console.log(responseText)` before `JSON.parse()` in geminiService.ts (line 85)
- Check schema alignment: SchemaType must match interface exactly
- Gemini sometimes adds markdown; strip with `.text().replace(/```json|```/g, '')`

### Handling Authentication Edge Cases
- Detect Instagram/Facebook in-app browser (already done, see `detectInAppBrowser`)
- OAuth flow shows popup; ensure app not blocked by browser popup filters
- Sign-out clears auth state and resets views in `useEffect` listener

### Adding New Firestore Collection
- Import collection/addDoc/query from "firebase/firestore"
- Use `serverTimestamp()` for automatic server time
- Wrap in `setLoadingState({ status: 'loading' })` → `.catch()` → `setLoadingState({ status: 'error', message })`

## Gotchas & Known Limitations

1. **Env Variables**: Vite only loads `VITE_` prefixed vars; `GEMINI_API_KEY` won't work unless aliased
2. **Schema Strictness**: If AI response misses a required field, entire request fails (no partial responses)
3. **No Tests**: Project has zero test coverage; add Jest + React Testing Library for production
4. **Hardcoded Gemini Model**: Using `gemini-2.5-flash` (check if newer versions available)
5. **No Rate Limiting**: Rapid API calls can exhaust free tier quota
6. **Single Page**: No route-based navigation; all state-driven via `view` state in App.tsx

## Key Files Reference
- **App.tsx** (479 lines): Main controller, auth flow, Firestore operations
- **geminiService.ts** (130 lines): AI prompt engineering, schema validation, JSON parsing
- **types.ts**: Type definitions imported everywhere
- **components/SearchForm.tsx**: User input capture and validation
- **components/ResultsView.tsx**: Display AI results with charts and typing effect
- **firebaseConfig.ts**: Firebase SDK initialization (don't modify auth config)
- **index.css**: Tailwind imports, keyframe animations, print styles
