import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY || '';
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export async function generateWithGemini(prompt: string, modelName: string = 'gemini-1.5-flash'): Promise<string> {
  if (!genAI) {
    throw new Error('GEMINI_API_KEY is not configured in .env.local');
  }

  const model = genAI.getGenerativeModel({ model: modelName });
  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}
