import supabase from '../../common/config/supabaseClient.js';
import fs from 'fs';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const PDFParser = require('pdf2json');

function safeDecodeURI(str) {
  try {
    return decodeURIComponent(str);
  } catch {
    return str;
  }
}

function extractTextFromPDF(filePath) {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser();

    pdfParser.on('pdfParser_dataError', (err) => reject(err.parserError));

    pdfParser.on('pdfParser_dataReady', (pdfData) => {
      const text = pdfData.Pages
        .map(page =>
          page.Texts
            .map(t => safeDecodeURI(t.R.map(r => r.T).join('')))
            .join(' ')
        )
        .join('\n\n');
      resolve(text);
    });

    pdfParser.loadPDF(filePath);
  });
}

export const processExtraction = async (req, res) => {
  try {
    const { group_id } = req.body;
    const file = req.file;

    if (!file || !group_id) {
      return res.status(400).json({ error: 'File and group_id are required' });
    }

    // Extract text from PDF
    const extractedText = await extractTextFromPDF(file.path);

    // Remove the temporary file after parsing
    fs.unlinkSync(file.path);

    const { data, error } = await supabase
      .from('extractor_table')
      .insert([{ group_id, filename: file.originalname, extracted_text: extractedText }])
      .select();

    if (error) throw error;
    res.json({ success: true, data: data[0] });
  } catch (err) {
    console.error('Extractor error:', err);
    res.status(500).json({ error: err.message });
  }
};

export const getExtractedFilesByGroupAPI = async (req, res) => {
  try {
    const { group_id } = req.params;
    const { data, error } = await supabase
      .from('extractor_table')
      .select('*')
      .eq('group_id', group_id);

    if (error) throw error;
    // Wrap in { data: [] } to match frontend expectation
    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
