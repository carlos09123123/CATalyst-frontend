import supabase from '../../common/config/supabaseClient.js';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';

export const generateSummary = async (req, res) => {
  try {
    const { id } = req.params;
    const { group_id, title } = req.body;

    // 1. Fetch extracted text from Supabase
    const { data: extractedDoc, error: fetchError } = await supabase
      .from('extractor_table')
      .select('extracted_text')
      .eq('id', id)
      .single();

    if (fetchError || !extractedDoc) {
      return res.status(404).json({ error: 'Extracted document not found' });
    }

    const rawText = extractedDoc.extracted_text;

    // 2. Initialize LangChain OpenAI Model
    const model = new ChatGoogleGenerativeAI({
      model: 'gemini-3.1-flash-lite',
      temperature: 0.3,
      apiKey: process.env.GOOGLE_API_KEY,
    });

    const prompt = `You are an expert research assistant. Read the following academic text and provide a concise, structured summary highlighting the main objectives, methodology, key findings, and conclusions.\n\nTEXT:\n${rawText.substring(0, 50000)}`;

    const response = await model.invoke(prompt);
    const summaryText = response.content;

    // 3. Save to Supabase
    const { data, error } = await supabase
      .from('summary_table')
      .insert([{ group_id, original_id: id, summary: summaryText, title }])
      .select();

    if (error) throw error;
    res.json({ success: true, data: data[0] });
  } catch (err) {
    console.error('Summary Error:', err);
    res.status(500).json({ error: err.message });
  }
};

export const getSummaryByGroupAPI = async (req, res) => {
  try {
    const { group_id } = req.params;
    const { data, error } = await supabase
      .from('summary_table')
      .select('*')
      .eq('group_id', group_id);

    if (error) throw error;
    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
