import { generateObjectivesService, regenerateObjectivesService, saveObjectiveVersionService, getObjectiveHistoryService } from "./objective.service.js";

export async function generateObjectivesController(req, res) {
  try {
    const result = await generateObjectivesService(req.body.group_id, req.body);

    return res.status(result.status).json({
      success: result.status < 400,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Unable to generate SMART objectives.",
    });
  }
}

export async function regenerateObjectivesController(req, res) {
  try {
    const result = await regenerateObjectivesService(req.body.group_id, req.body);

    return res.status(result.status).json({
      success: result.status < 400,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Unable to regenerate SMART objectives.",
    });
  }
}

export async function saveObjectiveVersionController(req, res) {
  try {
    const result = await saveObjectiveVersionService(req.body.group_id, req.body.version);

    return res.status(result.status).json({
      success: result.status < 400,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Unable to save objective version.",
    });
  }
}

export async function getObjectiveHistoryController(req, res) {
  try {
    const result = await getObjectiveHistoryService(req.params.group_id);

    return res.status(result.status).json({
      success: result.status < 400,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Unable to fetch objective history.",
    });
  }
}
