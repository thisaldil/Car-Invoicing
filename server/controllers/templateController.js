const User = require("../models/User");
const axios = require("axios");
const nodemailer = require("nodemailer");
const Invoice = require("../models/Invoice");
const Template = require("../models/Template.js");

// ============ helpers ============
function pickTemplateBody(body = {}) {
  const out = {
    name: body.name,
    description: body.description,
    isDefault: !!body.isDefault,
    design: {
      accentColor: body?.design?.accentColor,
      letterheadUrl: body?.design?.letterheadUrl,
      termsText: body?.design?.termsText,
      bottomLayerUrl: body?.design?.bottomLayerUrl,
    },
  };
  return out;
}

function buildDesignSet(design = {}) {
  const set = {};
  if (design.accentColor !== undefined)
    set["design.accentColor"] = design.accentColor;
  if (design.letterheadUrl !== undefined)
    set["design.letterheadUrl"] = design.letterheadUrl;
  if (design.termsText !== undefined)
    set["design.termsText"] = design.termsText;
  if (design.bottomLayerUrl !== undefined)
    set["design.bottomLayerUrl"] = design.bottomLayerUrl;
  return set;
}

//save template
exports.createTemplate = async (req, res) => {
  try {
    const b = pickTemplateBody(req.body);

    if (!b.name) {
      return res.status(400).json({ error: "name is required" });
    }

    const doc = new Template({
      userId: req.userId, // enforce ownership from auth
      name: b.name,
      description: b.description ?? "Custom invoice template",
      isDefault: !!b.isDefault,
      design: {
        accentColor: b.design.accentColor ?? "#3B82F6",
        letterheadUrl: b.design.letterheadUrl ?? "",
        termsText: b.design.termsText ?? "",
        bottomLayerUrl: b.design.bottomLayerUrl ?? "",
      },
    });

    const saved = await doc.save();
    return res.status(201).json(saved);
  } catch (err) {
    // Cast/validation errors -> 400; others -> 500
    const code =
      err?.name === "ValidationError" || err?.name === "CastError" ? 400 : 500;
    return res
      .status(code)
      .json({ error: "Failed to save template", detail: err.message });
  }
};

//get all templates by user id
exports.getTemplates = async (req, res) => {
  try {
    const { userId } = req.params;
    if (req.userId !== userId) {
      return res.status(403).json({ error: "Access denied" });
    }

    const templates = await Template.find({ userId })
      .sort({ updatedAt: -1 })
      .lean();

    return res.status(200).json(templates);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch templates" });
  }
};

//get template by id
exports.getTemplateById = async (req, res) => {
  try {
    const t = await Template.findById(req.params.id).lean();
    if (!t) return res.status(404).json({ error: "Template not found" });

    // Template.userId is a String in your schema
    if (req.userId !== String(t.userId)) {
      return res.status(403).json({ error: "Access denied" });
    }

    return res.status(200).json(t);
  } catch (err) {
    const code = err?.name === "CastError" ? 400 : 500;
    return res.status(code).json({ error: "Failed to fetch template" });
  }
};

//update template by id
exports.updateTemplate = async (req, res) => {
  try {
    const current = await Template.findById(req.params.id);
    if (!current) return res.status(404).json({ error: "Template not found" });

    if (req.userId !== String(current.userId)) {
      return res.status(403).json({ error: "Access denied" });
    }

    // Whitelist updates
    const b = pickTemplateBody(req.body);
    const $set = {};

    if (b.name !== undefined) $set.name = b.name;
    if (b.description !== undefined) $set.description = b.description;
    if (b.isDefault !== undefined) $set.isDefault = !!b.isDefault;

    Object.assign($set, buildDesignSet(b.design));

    const updated = await Template.findByIdAndUpdate(
      req.params.id,
      { $set },
      { new: true, runValidators: true, omitUndefined: true }
    );

    return res.status(200).json(updated);
  } catch (err) {
    const code =
      err?.name === "ValidationError" || err?.name === "CastError" ? 400 : 500;
    return res
      .status(code)
      .json({ error: "Failed to update template", detail: err.message });
  }
};

//delete template by id
exports.deleteTemplate = async (req, res) => {
  try {
    const t = await Template.findById(req.params.id);
    if (!t) return res.status(404).json({ error: "Template not found" });

    if (req.userId !== String(t.userId)) {
      return res.status(403).json({ error: "Access denied" });
    }

    await Template.findByIdAndDelete(req.params.id);
    return res.status(200).json({ message: "Template deleted successfully" });
  } catch (err) {
    const code = err?.name === "CastError" ? 400 : 500;
    return res.status(code).json({ error: "Failed to delete template" });
  }
};
