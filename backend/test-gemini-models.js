import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GOOGLE_API_KEY}&pageSize=100`);
    const data = await response.json();
    data.models.forEach(m => console.log(m.name));
  } catch (err) {
    console.error("Failed:", err.message);
  }
}

run();
