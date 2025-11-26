import { GoogleGenAI, Type, Schema } from "@google/genai";
import { SearchParams, SafetyScoutResponse } from "../types";

// Define the response schema for strict JSON output
const scoutSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    summary: {
      type: Type.STRING,
      description: "A friendly, reassuring summary of why these areas were chosen based on safety and budget.",
    },
    search_criteria: {
      type: Type.OBJECT,
      properties: {
        city: { type: Type.STRING },
        state: { type: Type.STRING },
        price_max: { type: Type.NUMBER },
        bedrooms_min: { type: Type.NUMBER },
        recommended_zip_codes: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "List of recommended zip codes.",
        },
      },
      required: ["city", "state", "price_max", "bedrooms_min", "recommended_zip_codes"],
    },
    safety_tips: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "General safety advice for renting in this city.",
    },
    neighborhoods: {
      type: Type.ARRAY,
      description: "Detailed insights for the recommended areas.",
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "Name of the neighborhood or area" },
          zip_code: { type: Type.STRING },
          insight: { type: Type.STRING, description: "Specific safety and lifestyle insight for this area" },
          safety_score: { type: Type.INTEGER, description: "A hypothetical safety score from 1-100 where 100 is safest" },
        },
        required: ["name", "zip_code", "insight", "safety_score"],
      },
    },
  },
  required: ["summary", "search_criteria", "safety_tips", "neighborhoods"],
};

export const analyzeSafety = async (params: SearchParams): Promise<SafetyScoutResponse> => {
  const apiKey = import.meta.env.VITE_API_KEY || process.env.API_KEY; 
  
  if (!apiKey) {
    throw new Error("API Key is missing. Check your .env file.");
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    Act as a Real Estate Safety Scout. 
    User is looking for housing in ${params.city}, ${params.state}.
    Budget: $${params.maxPrice} max.
    Bedrooms: ${params.bedrooms}.
    Additional preferences: ${params.preferences || "None"}.

    Task:
    1. Analyze the city to identify 3-5 specific neighborhoods or Zip Codes known for being safer and family-friendly, while trying to fit the budget.
    2. Provide a brief "Safety Insight" for each recommended area (e.g., "Low crime rate, good schools, but higher property tax").
    3. Return the response in strictly structured JSON format.
  `;

  try {
    const response = await ai.models.generateContent({
      // 2. UPDATE: Use a valid model name
      model: 'gemini-1.5-flash', 
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: scoutSchema,
        systemInstruction: "You are a helpful, reassuring, and knowledgeable real estate safety expert...",
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response generated from AI.");
    }

    return JSON.parse(text) as SafetyScoutResponse;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};