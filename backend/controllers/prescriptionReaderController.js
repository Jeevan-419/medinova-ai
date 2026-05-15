const { createWorker } = require('tesseract.js');
const path = require('path');
const os = require('os');
const fs = require('fs');

// @desc    Analyze a prescription image
//          Primary: Gemini AI Vision | Fallback: Local Tesseract OCR
// @route   POST /api/prescription-reader/analyze
// @access  Private (Patient)
exports.analyzePrescription = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file uploaded.' });
    }

    const fileSizeKB = (req.file.size / 1024).toFixed(1);
    console.log(`[RxReader] Analyzing: ${req.file.originalname} (${fileSizeKB} KB, ${req.file.mimetype})`);

    // STEP 1: Try Gemini AI (best quality)
    const geminiResult = await tryGeminiAnalysis(req.file);
    if (geminiResult.success) {
      console.log('[RxReader] ✓ Analyzed via Gemini AI');
      return res.status(200).json({
        success: true,
        data: {
          analysis: geminiResult.text,
          method: 'Gemini AI',
          fileName: req.file.originalname,
          analyzedAt: new Date().toISOString(),
        },
      });
    }

    // STEP 2: Fallback to local Tesseract OCR
    console.log('[RxReader] Gemini unavailable. Using local Tesseract OCR...');
    const ocrText = await runTesseractOCR(req.file.buffer, req.file.mimetype, req.file.originalname);
    const formattedText = formatOCROutput(ocrText, req.file.originalname);

    console.log('[RxReader] ✓ Analyzed via Tesseract OCR');
    return res.status(200).json({
      success: true,
      data: {
        analysis: formattedText,
        method: 'OCR',
        fileName: req.file.originalname,
        analyzedAt: new Date().toISOString(),
      },
    });

  } catch (error) {
    console.error('[RxReader] Fatal error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Could not analyze the prescription. Please ensure the image is clear and well-lit.',
      error: error.message,
    });
  }
};

// ─────────────────────────────────────────────────────
// Gemini AI (primary — best quality, handles handwriting)
// ─────────────────────────────────────────────────────
async function tryGeminiAnalysis(file) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return { success: false };

  const prompt = `You are a medical assistant expert at reading handwritten and printed doctor prescriptions.
Analyze this prescription image carefully and extract ALL visible information into these sections:

## Patient Information
(name, age, date if visible)

## Doctor Information
(name, clinic/hospital, registration number if visible)

## Diagnosis / Chief Complaint
(what condition is being treated)

## Medications Prescribed
(for each medicine: name, dosage, frequency, duration, special instructions)

## Additional Instructions
(diet, rest, follow-up date, any warnings)

## Notes
(any other observations)

If a section is not visible, write: Not clearly visible
Be thorough and accurate. This is for medical record purposes.`;

  const base64 = file.buffer.toString('base64');
  const mimeType = file.mimetype;

  const MODELS = [
    'gemini-2.0-flash-lite',
    'gemini-2.0-flash',
    'gemini-1.5-flash',
    'gemini-1.5-pro',
  ];

  for (const modelName of MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${key}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }, { inlineData: { mimeType, data: base64 } }] }],
          generationConfig: { temperature: 0.1, maxOutputTokens: 2048 }
        })
      });

      const data = await response.json();
      if (data.error) {
        console.log(`[RxReader] Gemini ${modelName}: ${data.error.code}`);
        continue;
      }

      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text && text.trim().length > 10) return { success: true, text };

    } catch (e) {
      console.log(`[RxReader] Gemini ${modelName} error: ${e.message}`);
    }
  }

  return { success: false };
}

// ─────────────────────────────────────────────────────
// Tesseract OCR (fallback — local, no API, no quota)
// Writes buffer to temp file so Tesseract can read it reliably
// ─────────────────────────────────────────────────────
async function runTesseractOCR(imageBuffer, mimeType, originalName) {
  // Get extension from original filename or mime type
  let ext = path.extname(originalName).toLowerCase();
  if (!ext || ext === '.') {
    const mimeMap = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp' };
    ext = mimeMap[mimeType] || '.jpg';
  }

  // Write to temp file so Tesseract can access it reliably
  const tmpPath = path.join(os.tmpdir(), `rx_${Date.now()}${ext}`);
  fs.writeFileSync(tmpPath, imageBuffer);

  let worker = null;
  try {
    console.log('[RxReader] Starting Tesseract worker...');
    worker = await createWorker('eng', 1, {
      logger: () => {}, // suppress progress logs
    });

    console.log('[RxReader] Running OCR on:', tmpPath);
    const { data: { text, confidence } } = await worker.recognize(tmpPath);
    console.log(`[RxReader] OCR done. Confidence: ${confidence?.toFixed(1)}%`);

    return text || '';
  } finally {
    if (worker) await worker.terminate();
    // Clean up temp file
    try { fs.unlinkSync(tmpPath); } catch (_) {}
  }
}

// ─────────────────────────────────────────────────────
// Format raw OCR text into a readable structured output
// ─────────────────────────────────────────────────────
function formatOCROutput(rawText, fileName) {
  const lines = rawText
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 2);

  let output = `## 📋 Prescription — OCR Reading\n\n`;
  output += `> ℹ️ *Extracted using local OCR. Gemini AI quota has been temporarily exhausted (resets daily). The full AI analysis will be available again tomorrow.*\n\n`;
  output += `---\n\n`;

  if (lines.length === 0) {
    output += `**⚠️ No text could be extracted.**\n\n`;
    output += `Tips for a better result:\n`;
    output += `- Use a clearer, sharper photo\n`;
    output += `- Ensure good lighting (no shadows)\n`;
    output += `- Capture the prescription straight-on\n`;
    output += `- Try a higher resolution image\n`;
    return output;
  }

  output += `### Extracted Text\n\n`;
  lines.forEach(line => {
    output += `- ${line}\n`;
  });

  output += `\n---\n`;
  output += `\n> ⚠️ *Always verify all details with your doctor before taking any medication.*`;

  return output;
}
