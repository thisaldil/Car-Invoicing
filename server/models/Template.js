const mongoose = require("mongoose");
const { Schema } = mongoose;

const TemplateSchema = new Schema(
  {
    userId: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, default: "Custom invoice template" },
    isDefault: { type: Boolean, default: false },

    // company removed

    design: {
      accentColor: { type: String, default: "#3B82F6" },
      letterheadUrl: { type: String, default: "" },
      termsText: { type: String, default: "" },
      bottomLayerUrl: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Template", TemplateSchema);
