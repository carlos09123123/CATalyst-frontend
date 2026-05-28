import mammoth from 'mammoth';
import fs from 'fs/promises';
import path from 'path';

async function parseDocx() {
  try {
    const docPath = path.resolve('../SDD-2526-sem2-it332-61.docx');
    const result = await mammoth.extractRawText({path: docPath});
    const text = result.value;
    const messages = result.messages;
    
    const outPath = path.resolve('../SDD-parsed.txt');
    await fs.writeFile(outPath, text, 'utf-8');
    
    console.log("Successfully extracted text to SDD-parsed.txt");
  } catch (err) {
    console.error("Error extracting docx:", err);
  }
}

parseDocx();
