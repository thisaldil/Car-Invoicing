const path = require("path");
const fs = require("fs");
const {
  extractTextFromPdf,
  extractStructuredData,
} = require("../services/huggingFaceService");

exports.handleOCR = async (req, res) => {
  try {
    const filePath = path.join("/tmp/uploads", req.file.filename);
    const rawText = await extractTextFromPdf(filePath);
    const structured = await extractStructuredData(rawText);

    const mappedInvoice = {
      bookingReference: structured.bookingReference || "",
      customerName: Array.isArray(structured.customerName)
        ? structured.customerName.map((p) =>
            typeof p === "string" ? p : p.name
          )
        : [structured.customerName || ""],
      transactionId: structured.transactionId || "",
      serviceDetails: (structured.services || []).map((s) => {
        const [startDate, startTime] = splitDateTime(s.startTime);
        const [endDate, endTime] = splitDateTime(s.endTime);
        return {
          serviceNumber: s.serviceNumber || "",
          from: s.from || "",
          to: s.to || "",
          startDate: startDate,
          startTime: startTime,
          endDate: endDate,
          endTime: endTime,
          serviceType: s.serviceType || "",
          provider: s.provider || "",
          location: s.location || "",
          status: s.status || "",
        };
      }),
    };

    fs.unlink(filePath, () => {});
    res.json(mappedInvoice);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to extract service info" });
  }
};

function splitDateTime(str) {
  if (!str || typeof str !== "string") return ["", ""];
  const match = str.match(/(\d{1,2}\s\w{3}\s\d{4})\s+(\d{2}:\d{2})/);
  return match ? [match[1], match[2]] : ["", str];
}
