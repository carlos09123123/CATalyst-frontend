import express from "express";
import { runRRLAssessmentController, getRRLAssessmentsController, updateRRLFeedbackController } from "./rrl.controller.js";

const router = express.Router();

router.post("/run", runRRLAssessmentController);
router.get("/:group_id", getRRLAssessmentsController);
router.post("/feedback", updateRRLFeedbackController);

export default router;
