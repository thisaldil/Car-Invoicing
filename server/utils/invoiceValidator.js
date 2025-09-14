function validateInvoiceSchema(data) {
  if (!data || typeof data !== "object")
    throw new Error("Invalid data: not an object");

  const validated = {
    bookingReference: String(data.bookingReference || "").trim(),
    transactionId: String(data.transactionId || "").trim(),
    passengerName: Array.isArray(data.passengerName)
      ? data.passengerName.map((name) => String(name).trim())
      : [String(data.passengerName || "").trim()],
    flights: [],
  };

  if (!Array.isArray(data.flights))
    throw new Error("Invalid data: 'flights' must be an array");

  validated.flights = data.flights.map((flight, i) => {
    if (typeof flight !== "object")
      throw new Error(`Flight #${i + 1} is not an object`);
    return {
      flightNumber: String(flight.flightNumber || "").trim(),
      from: String(flight.from || "").trim(),
      to: String(flight.to || "").trim(),
      departure: String(flight.departure || "").trim(),
      arrival: String(flight.arrival || "").trim(),
      status: String(flight.status || "").trim(),
      terminal: String(flight.terminal || "").trim(),
      airline: String(flight.airline || "").trim(),
      class: String(flight.class || "").trim(),
    };
  });

  return validated;
}

function validateCarInvoiceSchema(data) {
  if (!data || typeof data !== "object")
    throw new Error("Invalid data: not an object");

  const validated = {
    consigneeName: String(data.consigneeName || "").trim(),
    addressLine1: String(data.addressLine1 || "").trim(),
    addressLine2: String(data.addressLine2 || "").trim(),
    addressLine3: String(data.addressLine3 || "").trim(),
    invoiceNo: String(data.invoiceNo || "").trim(),
    description: String(data.description || "").trim(),
    invoiceType: String(data.invoiceType || "type1").trim(),
    items: [],
  };

  if (!Array.isArray(data.items))
    throw new Error("Invalid data: 'items' must be an array");

  validated.items = data.items.map((item, i) => {
    if (typeof item !== "object")
      throw new Error(`Item #${i + 1} is not an object`);
    return {
      make: String(item.make || "").trim(),
      model: String(item.model || "").trim(),
      chassisNo: String(item.chassisNo || "").trim(),
      year: String(item.year || "").trim(),
      hsCode: String(item.hsCode || "").trim(),
      qty: String(item.qty || "").trim(),
      fob: String(item.fob || "").trim(),
      insurance: String(item.insurance || "").trim(),
      freight: String(item.freight || "").trim(),
      cif: String(item.cif || "").trim(),
    };
  });

  return validated;
}

module.exports = { validateInvoiceSchema, validateCarInvoiceSchema };
