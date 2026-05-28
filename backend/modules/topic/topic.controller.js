import supabase from '../../common/config/supabaseClient.js';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';

export const generateTopics = async (req, res) => {
  try {
    const { group_id, gaps, title } = req.body;

    if (!gaps) {
       return res.status(400).json({ error: 'Gaps text is required' });
    }

    // 1. Initialize LangChain OpenAI Model
    const model = new ChatGoogleGenerativeAI({
      model: 'gemini-2.5-flash',
      temperature: 0.7,
      apiKey: process.env.GOOGLE_API_KEY,
    });

    const prompt = `You are an academic advisor. Based on the following identified research gaps, generate 3 to 5 highly novel, specific, and actionable research topics or thesis titles that a student or researcher could pursue to address these gaps.\n\nGAPS:\n${gaps}`;

    const response = await model.invoke(prompt);
    const topicsText = response.content;

    // 2. Save to Supabase
    const { data, error } = await supabase
      .from('topic_table')
      .insert([{ group_id, topics: response.content, title }])
      .select();

    if (error) throw error;
    res.json({ success: true, data: data[0] });
  } catch (err) {
    console.error('Topic Suggester Error:', err);
    res.status(500).json({ error: err.message });
  }
};

export const getTopicsByGroupIdAPI = async (req, res) => {
  try {
    const { group_id } = req.params;
    const { data, error } = await supabase
      .from('topic_table')
      .select('*')
      .eq('group_id', group_id);

    if (error) throw error;
    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
