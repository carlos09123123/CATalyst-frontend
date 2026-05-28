import supabase from '../../common/config/supabaseClient.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite" });

export const consolidateGaps = async (req, res) => {
  try {
    const { group_id, gap_ids } = req.body;
    
    if (!group_id || !gap_ids || gap_ids.length === 0) {
      return res.status(400).json({ error: 'group_id and gap_ids are required' });
    }

    // Fetch the text of the selected gaps
    const { data: gaps, error: fetchError } = await supabase
      .from('gap_table')
      .select('id, title, gap_analysis')
      .in('id', gap_ids);

    if (fetchError) throw fetchError;
    if (!gaps || gaps.length === 0) {
      return res.status(404).json({ error: 'No gaps found for the provided IDs' });
    }

    // Prepare text for Gemini
    let gapsText = "";
    gaps.forEach((gap, index) => {
      gapsText += `Gap ${index + 1} (${gap.title || 'Untitled'}):\n${gap.gap_analysis}\n\n`;
    });

    const prompt = `
      You are an expert academic researcher. 
      Read the following ${gaps.length} individual research gaps extracted from different literature:
      
      ${gapsText}
      
      Your task is to synthesize and consolidate these individual gaps into one single, cohesive, and comprehensive research gap. 
      Identify the overarching theme or missing link that connects them.
      
      Output ONLY the consolidated research gap text without any introductory or concluding remarks.
    `;

    const aiResult = await model.generateContent(prompt);
    const consolidatedText = aiResult.response.text().trim();

    // Save the consolidated gap as a new entry in gap_table so it can be used everywhere else
    const { data: savedRecord, error: insertError } = await supabase
      .from('gap_table')
      .insert([{
        group_id,
        gap_analysis: consolidatedText,
        title: 'Integrated Research Gap',
      }])
      .select()
      .single();

    if (insertError) throw insertError;

    res.json({
      success: true,
      data: savedRecord,
      message: 'Successfully integrated gaps'
    });

  } catch (err) {
    console.error('Integration Error:', err);
    res.status(500).json({ error: err.message });
  }
};

export const getIntegratedGaps = async (req, res) => {
  try {
    const { groupId } = req.params;
    // We can fetch gaps that have "Integrated" in the title or we can just fetch the latest integrated gap
    const { data, error } = await supabase
      .from('gap_table')
      .select('*')
      .eq('group_id', groupId)
      .ilike('title', '%Integrated%')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
