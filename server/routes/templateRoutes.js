const express = require("express");
const router = express.Router();
const templateController = require("../controllers/templateController.js");
const authRequired = require("../middlewares/authRequired");

router.post("/createTemplate", authRequired, templateController.createTemplate);
router.get(
  "/getTemplates/:userId",
  authRequired,
  templateController.getTemplates
);
router.get(
  "/getTemplateById/:id",
  authRequired,
  templateController.getTemplateById
);
router.put(
  "/updateTemplate/:id",
  authRequired,
  templateController.updateTemplate
);
router.delete(
  "/deleteTemplate/:id",
  authRequired,
  templateController.deleteTemplate
);

module.exports = router;
