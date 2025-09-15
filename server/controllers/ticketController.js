const path = require("path");
const fs = require("fs");
const { extractTicketText } = require("../services/googleDocAiService");
const nlp = require("compromise");

//car service invoice format
exports.extractTicketData = async (req, res) => {
  let filePath;
  try {
    const file = req.file;
    filePath = path.join("/tmp/uploads", req.file.filename);
    const rawText = await extractTicketText(filePath);

    // Check if this is a standard format invoice by looking for key identifiers
    if (rawText.includes("INVOICE") || rawText.includes("SERVICE DETAILS:")) {
      const result = await handleStandardInvoice(rawText);

      // Clean up the uploaded file after processing
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error("Error deleting file:", err);
        }
      });

      return res.json(result);
    }

    // Continue with existing car service invoice format handling
    // Basic info
    const customerName =
      rawText.match(
        /[A-Z]+\s+[A-Z]+\/[A-Z]+(?:\s+[A-Z]+)?(?:\s+MR|MS|MRS)?/i
      )?.[0] || "";
    const bookingRef = rawText.match(/Booking Ref:\s*(\d+)/i)?.[1] || "";
    const invoiceNumber =
      rawText.match(/Invoice Number\s*\n\s*(\d+)/i)?.[1] || "";

    // Find the service type once - it will be the same for all services
    const serviceTypeMatch = rawText.match(
      /\b(TRANSPORT|RENTAL|MAINTENANCE|REPAIR|CLEANING)\b/
    );
    const serviceType = serviceTypeMatch ? serviceTypeMatch[1] : "TRANSPORT";

    const serviceDetails = [];

    // Split the text into sections by date headers
    const sections = rawText.split(/(?=\d{2}\s+[A-Z]{3}\s+\d{4}\s*\n)/);

    for (const section of sections) {
      // Extract date
      const dateMatch = section.match(/(\d{2}\s+[A-Z]{3}\s+\d{4})/);
      if (!dateMatch) continue;

      // Extract service number - looking for service codes followed by numbers
      const serviceMatch = section.match(
        /(?:SVC|CAR|TRP|RTL|MNT|RPR|CLN)\s*(\d+)/
      );
      if (!serviceMatch) continue;

      // Extract pickup info
      const pickupMatch = section.match(
        /([A-Z]{3})\s*\n([^,\n]+)\s*\n([^,\n]+),\s*([^\n]+)\s*\n(\d{2}\s+[A-Z]{3}\s+\d{4}\s+\d{2}:\d{2})/
      );

      // Extract dropoff info - look for the next location code after the pickup
      const dropoffMatch = section.match(
        /(?:.*?\n){5,10}([A-Z]{3})\s*\n([^,\n]+)\s*\n([^,\n]+),\s*([^\n]+)\s*\n(\d{2}\s+[A-Z]{3}\s+\d{4}\s+\d{2}:\d{2})/s
      );

      if (pickupMatch && dropoffMatch) {
        // Extract location
        const locationMatch = section.match(/Location:\s*([^\n]+)/);

        // Extract provider and status - look for any word or phrase between newlines that could be a service provider
        const providerMatch = section.match(
          /\n([A-Za-z\s]+(?:Services|Transport|Rental|Auto)?)\n/
        );
        const statusMatch = section.match(/Status:\s*([^\n]+)/);

        // Parse pickup and dropoff times
        const pickupDateTime = pickupMatch[5].match(
          /(\d{2}\s+[A-Z]{3}\s+\d{4})\s+(\d{2}:\d{2})/
        );
        const dropoffDateTime = dropoffMatch[5].match(
          /(\d{2}\s+[A-Z]{3}\s+\d{4})\s+(\d{2}:\d{2})/
        );

        serviceDetails.push({
          serviceNumber: serviceMatch[0].replace(/\s+/, " "),
          provider: providerMatch ? providerMatch[1].trim() : "",
          from: pickupMatch[1],
          fromLocation: `${pickupMatch[2].trim()}\n${pickupMatch[3].trim()}, ${pickupMatch[4].trim()}`,
          to: dropoffMatch[1],
          toLocation: `${dropoffMatch[2].trim()}\n${dropoffMatch[3].trim()}, ${dropoffMatch[4].trim()}`,
          startDate: pickupDateTime[1],
          startTime: pickupDateTime[2],
          endDate: dropoffDateTime[1],
          endTime: dropoffDateTime[2],
          location: locationMatch ? locationMatch[1].trim() : "",
          serviceType: serviceType,
          status: statusMatch ? statusMatch[1].trim() : "Confirmed",
        });
      }
    }

    // Clean up the uploaded file after processing
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error("Error deleting file:", err);
      }
    });

    return res.json({
      customerName,
      bookingReference: bookingRef,
      transactionId: invoiceNumber,
      serviceDetails,
    });
  } catch (error) {
    // Clean up the file even if there's an error
    if (filePath) {
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error("Error deleting file:", err);
        }
      });
    }
    console.error("DocAI error:", error);
    return res
      .status(500)
      .json({
        error: "Failed to extract service details",
        detail: error.message,
      });
  }
};

//standard invoice format
async function handleStandardInvoice(rawText) {
  const lines = rawText
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  let bookingReference = "";
  let email = "";
  let customerNames = [];
  let serviceDetails = [];

  // Extract booking reference
  const bookingRefMatch = rawText.match(/BOOKING REF:\s*([A-Z0-9]+)/i);
  bookingReference = bookingRefMatch ? bookingRefMatch[1].trim() : "";

  // Extract email
  const emailMatch = rawText.match(
    /EMAIL ADDRESS:\s*([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})/i
  );
  email = emailMatch ? emailMatch[1].trim() : "";

  // Extract customer names
  const customerStartIndex = lines.findIndex((line) =>
    line.includes("SERVICE PREPARED FOR:")
  );
  if (customerStartIndex !== -1) {
    for (let i = customerStartIndex + 1; i < lines.length; i++) {
      const line = lines[i];
      if (/^(DAY|DATE|SERVICE|STOP|VEHICLE|TYPE|DURATION|SERVICES)/i.test(line))
        break;
      if (line.match(/[A-Z]+\/[A-Z]+(?:\s+[A-Z]+)?\s*(MR|MS|MRS)/i)) {
        customerNames.push(line);
      }
    }
  }

  // Extract service details
  const servicePattern =
    /([A-Z]{3})\s+(\d{4})\s+([A-Z]{3})\s+(\d{4})\s+([A-Z]{2,3}\s*\d+)\s+([A-Z]+)/g;
  const serviceSections = rawText.split(/DAY\s+DATE/).slice(1);

  for (const section of serviceSections) {
    let match;
    while ((match = servicePattern.exec(section)) !== null) {
      const [_, from, startTime, to, endTime, serviceNumber, serviceType] =
        match;
      const status = section.includes("CONFIRMED") ? "Confirmed" : "Unknown";
      const durationMatch = section.match(/\d+HR\s+\d+MIN/);
      const duration = durationMatch
        ? durationMatch[0].replace(/\s+/g, " ")
        : "";

      serviceDetails.push({
        serviceNumber: serviceNumber.trim(),
        provider: serviceNumber.split(" ")[0].trim(),
        from: from.trim(),
        to: to.trim(),
        startTime: formatTime(startTime),
        endTime: formatTime(endTime),
        serviceType: serviceType.trim(),
        status: status.trim(),
        duration: duration,
        services: section.includes("MEALS") ? "MEALS" : "NO MEALS",
      });
    }
  }

  return {
    bookingReference,
    email,
    customerNames,
    serviceDetails,
  };
}

// Helper function to format time
function formatTime(time) {
  return time.replace(/(\d{2})(\d{2})/, "$1:$2");
}
