import { runRRLAssessmentService, getRRLAssessmentsService, updateRRLFeedbackService } from "./rrl.service.js";

export async function runRRLAssessmentController(req, res) {
  try {
    const result = await runRRLAssessmentService(req.body.group_id, req.body.papers);

    return res.status(result.status).json({
      success: result.status < 400,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Unable to run RRL assessment.",
    });
  }
}

export async function getRRLAssessmentsController(req, res) {
  try {
    const result = await getRRLAssessmentsService(req.params.group_id);

    return res.status(result.status).json({
      success: result.status < 400,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Unable to fetch RRL assessments.",
    });
  }
}

export async function updateRRLFeedbackController(req, res) {
  try {
    const result = await updateRRLFeedbackService(req.body.group_id, req.body.assessment_id, req.body.feedback);

    return res.status(result.status).json({
      success: result.status < 400,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Unable to update RRL feedback.",
    });
  }
}
