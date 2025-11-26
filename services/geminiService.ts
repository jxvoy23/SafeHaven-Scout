import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { SearchParams, SafetyScoutResponse } from "../types";

// Define the response schema for strict JSON output
// Note: SchemaType is used in the web SDK instead of Type
const scoutSchema = {
  type: SchemaType.OBJECT,
  properties: {
    summary: {
      type: SchemaType.STRING,
      description: "A friendly, reassuring summary of why these areas were chosen based on safety and budget.",
    },
    search_criteria: {
      type: SchemaType.OBJECT,
      properties: {
        city: { type: SchemaType.STRING },
        state: { type: SchemaType.STRING },
        price_max: { type: SchemaType.NUMBER },
        bedrooms_min: { type: SchemaType.NUMBER },
        recommended_zip_codes: {
          type: SchemaType.ARRAY,
          items: { type: SchemaType.STRING },
          description: "List of recommended zip codes.",
        },
      },
      required: ["city", "state", "price_max", "bedrooms_min", "recommended_zip_codes"],
    },
    safety_tips: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description: "General safety advice for renting in this city.",
    },
    neighborhoods: {
      type: SchemaType.ARRAY,
      description: "Detailed insights for the recommended areas.",
      items: {
        type: SchemaType.OBJECT,
        properties: {
          name: { type: SchemaType.STRING, description: "Name of the neighborhood or area" },
          zip_code: { type: SchemaType.STRING },
          insight: { type: SchemaType.STRING, description: "Specific safety and lifestyle insight for this area" },
          safety_score: { type: SchemaType.INTEGER, description: "A hypothetical safety score from 1-100 where 100 is safest" },
        },
        required: ["name", "zip_code", "insight", "safety_score"],
      },
    },
  },
  required: ["summary", "search_criteria", "safety_tips", "neighborhoods"],
};

export const analyzeSafety = async (params: SearchParams): Promise<SafetyScoutResponse> => {
  // Use the specific VITE_ env variable for the web build
  const apiKey = import.meta.env.VITE_API_KEY; 
  
  if (!apiKey) {
    throw new Error("API Key is missing. Check your .env file.");
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  const model = genAI.getGenerativeModel({
    // UPDATED: Using 'gemini-2.5-flash' because 1.5-flash is retired/deprecated
    model: "gemini-2.5-flash",
    systemInstruction: "You are a helpful, reassuring, and knowledgeable real estate safety expert. Prioritize safety and family-friendliness. Be honest about budget constraints if safety comes at a premium.",
  });

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
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: scoutSchema,
      },
    });

    const responseText = result.response.text();
    if (!responseText) {
      throw new Error("No response generated from AI.");
    }

    return JSON.parse(responseText) as SafetyScoutResponse;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};