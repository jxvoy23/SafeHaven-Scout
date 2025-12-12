# SafeHaven Scout 🛡️🏡

**AI-Powered Real Estate Safety Analyzer**

> **Course:** CSC 321: Programming Languages  
> **Assignment:** Full-Stack AI Integration Project

![SafeHaven Scout Banner](public/preview.png)

## 📖 Project Overview

SafeHaven Scout is an intelligent web application designed to empower renters and homebuyers with qualitative safety insights. Unlike traditional listing sites that focus solely on price and amenities, SafeHaven Scout leverages **Generative AI** to analyze crime trends, neighborhood vibes, and family-friendliness for specific cities.

The application provides users with a curated list of safe zip codes, detailed "Scout Summaries," and visual safety comparisons, all tailored to the user's specific budget and bedroom requirements.

## 🚀 Tech Stack

* **Frontend Framework:** React 19 (TypeScript) + Vite
* **Styling:** Tailwind CSS (Glassmorphism UI design)
* **Artificial Intelligence:** Google Gemini API (Model: `gemini-2.5-flash`)
* **Backend-as-a-Service:** Google Firebase
    * **Authentication:** Firebase Auth (Google Provider)
    * **Database:** Cloud Firestore (NoSQL)
    * **Hosting:** Firebase Hosting
* **Visualization:** Recharts (Data visualization library)
* **Icons:** Lucide React

---

## 🏗️ Architecture & Code Structure

This project demonstrates a modern **Serverless Architecture**, delegating backend logic to Firebase and AI processing to the client-side Gemini Web SDK.

### File Structure Breakdown

The codebase is organized to separate concerns between UI components, data services, and type definitions:

```text
src/
├── components/
│   ├── Hero.tsx          # Landing page visual component
│   ├── SearchForm.tsx    # Main input form (City, State, Budget, Preferences)
│   └── ResultsView.tsx   # Displays AI analysis, charts, and typing-effect summary
├── services/
│   └── geminiService.ts  # The core AI logic layer. Handles prompt engineering,
│                         # API calls to Google Gemini, and JSON schema validation.
├── types.ts              # TypeScript interfaces defining the shape of SearchParams
│                         # and the structured JSON response from the AI.
├── firebaseConfig.ts     # Firebase SDK initialization and service exports (Auth, DB).
├── App.tsx               # Main controller: Handles Auth state, Routing logic,
│                         # and orchestrates data flow between components.
├── index.css             # Tailwind imports and custom CSS animations (blobs/glass).
└── main.tsx              # Entry point
```

## Application Logic Flow
Authentication State: App.tsx uses a useEffect listener on onAuthStateChanged. If a user is not authenticated, the "Landing Gate" is shown. Upon login, the view creates a document in the Firestore users collection.

The AI Pipeline (geminiService.ts):

The app constructs a System Instruction instructing the model to act as a "Real Estate Safety Scout."

It sends a prompt containing the user's criteria.

Crucially, it enforces a Structured Output Schema (responseSchema) to ensure the AI returns strict JSON data (Safety Scores, Zip Codes, Summaries) rather than unstructured text. This allows the frontend to render charts programmatically.

Data Persistence:

Successful searches are automatically written to the sessions collection in Cloud Firestore.

Security Rules enforce that users can only read/write to documents tagged with their specific uid.

## 🌐 Website Structure & User Flow
The application logic is state-driven rather than route-driven, providing a seamless single-page application (SPA) experience.

1. Landing Page (Unauthenticated)
Visuals: Animated gradient background with a glassmorphism card.

Action: Users are presented with a "Get Started" call-to-action that triggers the Google Sign-In popup. No app functionality is accessible without authentication.

2. Dashboard / Search View (Authenticated Home)
Input: Users provide location data (City, State), financial constraints (Max Budget), and qualitative preferences (e.g., "near parks").

State Management: The SearchForm component manages local input state and passes the final criteria up to App.tsx upon submission.

3. Results View
Visualization: A dynamic Bar Chart compares the "Safety Scores" of recommended neighborhoods.

Insights:

Typewriter Effect Summary: The AI's general advice is rendered character-by-character for a conversational feel.

Neighborhood Cards: Individual glass cards display specific Zip Codes and safety highlights.

Safety Tips: A sidebar offers general renting advice for that specific city.

4. History View
Persistence: Fetches the user's past sessions from Firestore, ordered by timestamp.

Re-Use Feature: Users can click "Reuse & Edit Search" on any history item. This creates a feedback loop, populating the Search Form with historical data for refinement.

## 🛠️ Installation & Setup
To run this project locally:

Clone the repository:

Bash

git clone [https://github.com/YOUR_USERNAME/safehaven-scout.git](https://github.com/YOUR_USERNAME/safehaven-scout.git)
cd safehaven-scout
Install Dependencies:

Bash

npm install
Environment Variables: Create a .env.local file in the root directory and add your Gemini API key:

Code snippet

VITE_API_KEY=your_api_key_here
Run Development Server:

Bash

npm run dev
### 📄 License
This project was created for educational purposes for CSC 321.
