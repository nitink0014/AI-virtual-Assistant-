import dotenv from "dotenv";
dotenv.config();

import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const geminiResponse = async (command, assistantName, userName) => {
  const prompt = `
You are ${assistantName}, an advanced AI voice assistant created by ${userName}.

Return ONLY valid JSON.

Format:

{
"type":"",
"action":"",
"userInput":"",
"response":"",
"data":{}
}

Available actions:

greeting
farewell
thanks
general
get-date
get-time
get-day
get-month
google_search
youtube_search
youtube_play
calculator_open
instagram_open
facebook_open
github_open
linkedin_open
weather

User command:

${command}
`;

  const models = [
    "gemini-3.6-flash",
    "gemini-flash-latest",
  ];

  for (const model of models) {
    try {
      console.log(`Trying Gemini model: ${model}`);

      const result = await ai.models.generateContent({
        model,
        contents: prompt,
      });

      console.log(`Gemini success: ${model}`);

      return result.text;
    } catch (error) {
      console.log(
        `Gemini error with ${model}:`,
        error?.status,
        error?.message
      );

      // Only retry/fallback for temporary server errors
      if (error?.status === 503 || error?.status === 429) {
        console.log(`Waiting before retry...`);
        await sleep(2000);
        continue;
      }

      throw error;
    }
  }

  throw new Error("All Gemini models are currently unavailable");
};

export default geminiResponse;