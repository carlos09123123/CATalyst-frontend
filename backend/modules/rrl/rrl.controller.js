import supabase from '../../common/config/supabaseClient.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite" });

export const runAssessment = async (req, res) => {
  try {
    const { group_id, summary_ids } = req.body;
    
    if (!group_id || !summary_ids || summary_ids.length === 0) {
      return res.status(400).json({ error: "Missing group_id or summary_ids" });
    }

    // Fetch summaries from database
    const { data: summaries, error } = await supabase
      .from('summary_table')
      .select('id, summary, title')
      .in('id', summary_ids);

    if (error) throw error;
    if (!summaries || summaries.length === 0) {
      return res.status(404).json({ error: "Summaries not found" });
    }

    const results = [];

    // Process each summary
    for (const paper of summaries) {
      const prompt = `
        You are an expert academic Review of Related Literature (RRL) assessor.
        Please evaluate the following research summary based on four criteria: 
        Recency, Alignment to general tech trends, Significance, and Relevance.
        
        Summary:
        ${paper.summary}
        
        Provide your assessment strictly as a JSON object with the following structure:
        {
          "relevance_score": <a number from 1 to 100 representing overall relevance>,
          "recency_rating": "<High/Medium/Low> - <short reason>",
          "alignment_rating": "<High/Medium/Low> - <short reason>",
          "significance_rating": "<High/Medium/Low> - <short reason>",
          "relevance_rating": "<High/Medium/Low> - <short reason>",
          "full_assessment": "<A comprehensive 2-3 paragraph textual assessment of the literature>"
        }
        
        Output ONLY the JSON object, without markdown blocks.
      `;

      const aiResult = await model.generateContent(prompt);
      let responseText = aiResult.response.text().trim();
      const match = responseText.match(/\{[\s\S]*\}/);
      if (match) {
        responseText = match[0];
      }
      
      let parsedAssessment;
      try {
        parsedAssessment = JSON.parse(responseText);
      } catch (e) {
        console.error("Failed to parse Gemini output:", responseText);
        throw new Error("AI returned malformed JSON");
      }

      // Save to database
      const { data: savedRecord, error: insertError } = await supabase
        .from('rrl_assessment_table')
        .insert([{
          group_id,
          summary_id: paper.id,
          assessment_feedback: JSON.stringify(parsedAssessment) // Store full JSON in the text field for easy retrieval
        }])
        .select()
        .single();

      if (insertError) throw insertError;
      results.push({ ...savedRecord, paper_title: paper.title || 'Untitled Summary' });
    }

    res.json({ success: true, data: results });

  } catch (err) {
    console.error('RRL Assessment Error:', err);
    res.status(500).json({ error: err.message });
  }
};

export const getAssessments = async (req, res) => {
  try {
    const { groupId } = req.params;
    
    const { data: assessments, error } = await supabase
      .from('rrl_assessment_table')
      .select('*')
      .eq('group_id', groupId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const summaryIds = [...new Set((assessments || []).map((item) => item.summary_id).filter(Boolean))];
    let summaryMap = new Map();

    if (summaryIds.length > 0) {
      const { data: summaries, error: summaryError } = await supabase
        .from('summary_table')
        .select('id, title')
        .in('id', summaryIds);

      if (summaryError) throw summaryError;

      summaryMap = new Map((summaries || []).map((summary) => [summary.id, summary.title]));
    }

    const data = (assessments || []).map((item) => ({
      ...item,
      relevance_score: item.relevance_score ?? (() => {
        try {
          return item.assessment_feedback ? JSON.parse(item.assessment_feedback).relevance_score : null;
        } catch {
          return null;
        }
      })(),
      user_feedback: item.user_feedback ?? (() => {
        try {
          return item.assessment_feedback ? JSON.parse(item.assessment_feedback).user_feedback : null;
        } catch {
          return null;
        }
      })(),
      summary_title: summaryMap.get(item.summary_id) || 'Untitled Summary',
    }));

    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const submitFeedback = async (req, res) => {
  try {
    const { id, feedback } = req.body; // feedback: 'accept', 'reject', 'flag'

    const { data: existingRecord, error: fetchError } = await supabase
      .from('rrl_assessment_table')
      .select('assessment_feedback')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    let updatedAssessment = {};
    if (existingRecord?.assessment_feedback) {
      try {
        updatedAssessment = JSON.parse(existingRecord.assessment_feedback);
      } catch {
        updatedAssessment = {};
      }
    }

    updatedAssessment.user_feedback = feedback;
    
    const { data, error } = await supabase
      .from('rrl_assessment_table')
      .update({ assessment_feedback: JSON.stringify(updatedAssessment) })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
