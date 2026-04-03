import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// Try the current stable model name
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

try {
  const result = await model.generateContent("Say hello");
  console.log("SUCCESS:", result.response.text());
} catch (e) {
  console.error("FULL ERROR:", JSON.stringify(e, null, 2));
  console.error("MESSAGE:", e.message);
}
