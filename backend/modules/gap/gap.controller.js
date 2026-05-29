import supabase from '../../common/config/supabaseClient.js';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';

export const analyzeGaps = async (req, res) => {
  try {
    const { id } = req.params;
    const { group_id, title } = req.body;

    // 1. Fetch summary from Supabase
    const { data: summaryDoc, error: fetchError } = await supabase
      .from('summary_table')
      .select('summary')
      .eq('id', id)
      .single();

    if (fetchError || !summaryDoc) {
      return res.status(404).json({ error: 'Summary document not found' });
    }

    const summaryText = summaryDoc.summary;
    const resolvedTitle = title?.trim() || `Gap Analysis ${id.substring(0, 8)}`;

    // 2. Initialize LangChain OpenAI Model
    const model = new ChatGoogleGenerativeAI({
      model: 'gemini-3.1-flash-lite',
      temperature: 0.5,
      apiKey: process.env.GOOGLE_API_KEY,
    });

    const prompt = `You are a critical research analyst. Review the following summary of a research paper and identify 3 to 5 potential "research gaps" (limitations, unaddressed questions, or future work opportunities). Format them as a clear bulleted list.\n\nSUMMARY:\n${summaryText}`;

    const response = await model.invoke(prompt);
    const gapAnalysisText = response.content;

    // 3. Save to Supabase
    const { data, error } = await supabase
      .from('gap_table')
      .insert([{ group_id, summary_id: id, gap_analysis: gapAnalysisText, title: resolvedTitle }])
      .select();

    if (error) throw error;
    res.json({ success: true, data: data[0] });
  } catch (err) {
    console.error('Gap Analysis Error:', err);
    res.status(500).json({ error: err.message });
  }
};

export const getGapsByGroupAPI = async (req, res) => {
  try {
    const { group_id } = req.params;
    const { data, error } = await supabase
      .from('gap_table')
      .select('*')
      .eq('group_id', group_id);

    if (error) throw error;
    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
