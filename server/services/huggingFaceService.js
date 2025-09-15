const fs = require("fs");
const pdfParse = require("pdf-parse");
const axios = require("axios");
require("dotenv").config();
const validateInvoiceSchema = require("../utils/invoiceValidator");

async function extractTextFromPdf(filePath) {
  const dataBuffer = fs.readFileSync(filePath);
  const pdfData = await pdfParse(dataBuffer);
  return pdfData.text;
}

function safeParseJSON(text) {
  try {
    const cleaned = text
      .replace(/^```json\s*/i, "")
      .replace(/^```/, "")
      .replace(/```$/, "")
      .trim();

    // Extract only the JSON object portion
    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");
    if (firstBrace === -1 || lastBrace === -1)
      throw new Error("No JSON braces found");

    const jsonString = cleaned.substring(firstBrace, lastBrace + 1);
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Failed to parse structured data:", error);
    throw new Error("Invalid JSON format returned from model");
  }
}

async function extractStructuredData(text) {
  const prompt = `
Extract this car service invoice text into **strict valid JSON**. 
Only return the JSON object, no explanation, no markdown, no comments. 
Format:
{
  "bookingReference": "...",
  "customerName": ["..."],
  "transactionId": "...",
  "services": [
    {
      "serviceNumber": "...",
      "from": "...",
      "to": "...",
      "startTime": "...",
      "endTime": "...",
      "status": "...",
      "location": "...",
      "provider": "...",
      "serviceType": "..."
    }
  ]
}

TEXT:
${text}
`;

  const response = await axios.post(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      model: "mistralai/mistral-7b-instruct:free",
      messages: [
        {
          role: "system",
          content:
            "You are a strict extractor that returns only valid JSON with no extra text.",
        },
        { role: "user", content: prompt },
      ],
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );

  const content = response.data.choices[0].message.content.trim();
  const parsed = safeParseJSON(content);

  if (!parsed.bookingReference || !parsed.customerName || !parsed.services) {
    throw new Error("Parsed data missing required fields");
  }

  return validateInvoiceSchema(parsed);
}

module.exports = { extractTextFromPdf, extractStructuredData };
