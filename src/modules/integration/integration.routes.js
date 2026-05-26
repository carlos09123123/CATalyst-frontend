import express from "express";
import { previewIntegrationController, confirmIntegrationController, getIntegrationController } from "./integration.controller.js";

const router = express.Router();

router.post("/preview", previewIntegrationController);
router.post("/confirm", confirmIntegrationController);
router.get("/:group_id", getIntegrationController);

export default router;
