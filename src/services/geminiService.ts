import { GoogleGenAI, Type } from "@google/genai";
import { ChartData, DashaPeriod } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

export const interpretChart = async (chart: ChartData, userContext: string, language: string = "English") => {
  const prompt = `
    As an expert Vedic Astrologer (Jyotish), analyze the following birth chart data:
    Lagna Chart Planets: ${JSON.stringify(chart.planets)}
    Ayanamsha: ${chart.ayanamsha}
    
    Instruction/Context: ${userContext}
    
    Language Requirement: Provide the response COMPLETELY in ${language}. 
    
    Provide a deeply spiritual, sophisticated, and actionable reading. 
    Use clear headers or bullet points. Focus specifically on what is asked in the context.
    Keep the tone encouraging yet honest about karmic challenges.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
  });

  return response.text;
};

export const getKarmicRemedies = async (chart: ChartData, language: string = "English") => {
  const prompt = `
    As an expert Vedic Astrologer, suggest specific karmic remedies based on this birth chart:
    Planets: ${JSON.stringify(chart.planets)}
    
    Provide the response in ${language} as a JSON object with strictly these keys:
    {
      "gemstone": "Specific ritualistic gemstone guidance (name, weight, finger, day)",
      "mantra": "A powerful Vedic mantra with its correct pronunciation and chanting counts",
      "charity": "A specific act of service or donation aligned with the weakest or most afflicted planets"
    }
    Include ONLY the JSON. No preamble.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
  });

  try {
    const text = response.text;
    const cleanJson = text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleanJson);
  } catch (e) {
    console.error("Failed to parse remedies:", e);
    return {
      gemstone: "Consult your primary chart for gemstone guidance.",
      mantra: "Om Namah Shivaya (108 times daily)",
      charity: "Feed birds or stray animals on Saturdays."
    };
  }
};

export const getThumbInterpretation = async (pattern: string, language: string = "English") => {
  const prompt = `
    As an expert in Nadi Shastra (Ancient Palmistry), interpret the following thumb impression pattern: ${pattern}.
    
    Language Requirement: Provide the response COMPLETELY in ${language}.

    The patterns are:
    - Shankha (Conch): Symbolic of intuition, depth, and creative/spiritual leadership.
    - Chakra (Wheel): Symbolic of strategy, commerce, leadership, and abundance.
    - Padma (Lotus): Symbolic of healing, purity, calm, and service to humanity.
    - Gaja (Elephant): Symbolic of strength, perseverance, stability, and being a pillar for others.

    Provide a nuanced and personalized reading for a pattern of type "${pattern}". 
    Explain:
    1. The core personality traits associated with this pattern.
    2. Potential life paths or career directions.
    3. A specific spiritual or practical advice for someone with this thumb print.

    Keep the tone mystical, encouraging, and deeply insightful. Format with clear headers.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
  });

  return response.text;
};

export const getDailyMuhurta = async (date: Date, location: string) => {
  const prompt = `
    Calculate the personalized Muhurta (auspicious time) for ${date.toDateString()} at ${location}.
    Highlight:
    - Brahma Muhurta
    - Rahu Kaal (to be avoided)
    - Abhijit Muhurta
    - Choghadiya status for the day.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview", 
    contents: prompt,
  });

  return response.text;
};
