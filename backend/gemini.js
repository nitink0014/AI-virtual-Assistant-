import dotenv from "dotenv";
dotenv.config();

import { GoogleGenAI } from "@google/genai";


const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const geminiResponse = async (command, assistantName, userName) => {
  const prompt = `You are ${assistantName}, a voice assistant created by ${userName}.

Return ONLY valid JSON:
{
"type":"",
"action":"",
"userInput":"",
"response":"",
"data":{}
}

Actions:
greeting, farewell, thanks, general, get-date, get-time, get-day,
get-month, google_search, youtube_search, youtube_play,
calculator_open, instagram_open, facebook_open, github_open,
linkedin_open, weather

Command: ${command}`;

  const result = await ai.models.generateContent({
    model: "gemini-3.6-flash",
    contents: prompt,
  });

  return result.text;
};

export default geminiResponse;
