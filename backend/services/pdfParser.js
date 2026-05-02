const fs = require('fs');
const pdfParse = require('pdf-parse');

/**
 * Extract text content from a PDF file
 * @param {string} filePath - Path to the PDF file
 * @returns {Promise<string>} Extracted text
 */
async function extractText(filePath) {
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdfParse(dataBuffer);
  return data.text.trim();
}

/**
 * Extract text and clean up the uploaded file
 * @param {string} filePath - Path to the PDF file
 * @returns {Promise<string>} Extracted text
 */
async function extractAndCleanup(filePath) {
  try {
    const text = await extractText(filePath);
    // Delete the uploaded file after extraction
    fs.unlinkSync(filePath);
    return text;
  } catch (error) {
    // Still try to clean up on error
    try { fs.unlinkSync(filePath); } catch (e) { /* ignore */ }
    throw error;
  }
}

module.exports = { extractText, extractAndCleanup };
