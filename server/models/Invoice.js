const mongoose = require("mongoose");
const { Schema } = mongoose;

const invoiceSchema = new Schema(
  {
    userId: { type: String, required: true },
    date: { type: Date, default: Date.now },
    pdfUrl: { type: String, required: true },
    invoiceType: {
      type: String,
      required: true,
      enum: ["type1", "type2", "type3"],
      default: "type1",
    },
    template: {
      _id: { type: Schema.Types.ObjectId, ref: "Template" },
      company: {
        name: String,
        logo: String,
        address: String,
      },
    },
    // For airline invoices
    invoiceDetails: {
      bookingReference: String,
      passengerName: [String],
      passengers: [
        {
          passportNumber: String,
          nationality: String,
          dob: String,
          gender: String,
        },
      ],
    },
    // For car invoices
    carInvoiceDetails: {
      consigneeName: String,
      addressLine1: String,
      addressLine2: String,
      addressLine3: String,
      invoiceNo: String,
      description: String,
      items: [
        {
          make: String,
          model: String,
          chassisNo: String,
          year: String,
          hsCode: String,
          qty: String,
          fob: String,
          insurance: String,
          freight: String,
          cif: String,
        },
      ],
    },
    priceDetails: {
      totalAmount: String,
      paymentMethod: String,
      transactionId: String,
    },
  },
  { timestamps: true }
); // <- this line adds createdAt and updatedAt

module.exports = mongoose.model("Invoice", invoiceSchema);
