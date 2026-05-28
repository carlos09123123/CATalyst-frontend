import supabase from '../../common/config/supabaseClient.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite" });

export const generateObjectives = async (req, res) => {
  try {
    const { group_id, gap_id, topic_id } = req.body;
    
    if (!group_id || !gap_id || !topic_id) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Fetch Gap
    const { data: gapData, error: gapError } = await supabase
      .from('gap_table')
      .select('gap_analysis')
      .eq('id', gap_id)
      .single();
    if (gapError) throw gapError;

    // Fetch Topic
    const { data: topicData, error: topicError } = await supabase
      .from('topic_table')
      .select('topics')
      .eq('id', topic_id)
      .single();
    if (topicError) throw topicError;

    const prompt = `
      You are an expert academic researcher.
      Based on the following research GAP and chosen research TOPIC, generate 3 to 4 SMART (Specific, Measurable, Attainable, Relevant, Time-bound) research objectives.
      
      Research Gap:
      ${gapData.gap_analysis}
      
      Chosen Topic:
      ${topicData.topics}
      
      Output ONLY the objectives as a numbered list. Do not include any introductory or concluding text.
    `;

    const aiResult = await model.generateContent(prompt);
    const objectivesText = aiResult.response.text().trim();

    // Determine next version number
    const { data: existingVersions, error: countError } = await supabase
      .from('objective_table')
      .select('version')
      .eq('group_id', group_id)
      .eq('gap_id', gap_id)
      .eq('topic_id', topic_id)
      .order('version', { ascending: false })
      .limit(1);
      
    let nextVersion = 1;
    if (!countError && existingVersions && existingVersions.length > 0) {
      nextVersion = existingVersions[0].version + 1;
    }

    // Save to database
    const { data: savedRecord, error: insertError } = await supabase
      .from('objective_table')
      .insert([{
        group_id,
        gap_id,
        topic_id,
        objectives: objectivesText,
        version: nextVersion
      }])
      .select()
      .single();

    if (insertError) throw insertError;
    res.json({ success: true, data: savedRecord });

  } catch (err) {
    console.error('Objective Generation Error:', err);
    res.status(500).json({ error: err.message });
  }
};

export const getObjectives = async (req, res) => {
  try {
    const { groupId } = req.params;
    
    const { data, error } = await supabase
      .from('objective_table')
      .select(`
        *,
        gap_table(title, gap_analysis),
        topic_table(title, topics)
      `)
      .eq('group_id', groupId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const saveObjectiveEdit = async (req, res) => {
  try {
    const { id } = req.params;
    const { objectives } = req.body;
    
    // Instead of updating, we save a new version based on the old one
    const { data: original, error: fetchError } = await supabase
      .from('objective_table')
      .select('*')
      .eq('id', id)
      .single();
      
    if (fetchError) throw fetchError;
    
    const { data: newVersion, error: insertError } = await supabase
      .from('objective_table')
      .insert([{
        group_id: original.group_id,
        gap_id: original.gap_id,
        topic_id: original.topic_id,
        objectives: objectives,
        version: original.version + 1
      }])
      .select()
      .single();
      
    if (insertError) throw insertError;

    res.json({ success: true, data: newVersion });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
