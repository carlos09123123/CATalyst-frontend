import express from "express";
import { generateObjectivesController, regenerateObjectivesController, saveObjectiveVersionController, getObjectiveHistoryController } from "./objective.controller.js";

const router = express.Router();

router.post("/generate", generateObjectivesController);
router.post("/regenerate", regenerateObjectivesController);
router.post("/save", saveObjectiveVersionController);
router.get("/:group_id", getObjectiveHistoryController);

export default router;
