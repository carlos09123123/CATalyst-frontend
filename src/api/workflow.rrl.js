import { apiRequest } from "./http";

export async function runRRLAssessmentAPI(group_id, summary_ids) {
  return apiRequest(`/rrl/assess`, {
    method: "POST",
    body: JSON.stringify({ group_id, summary_ids }),
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function getRRLAssessmentsAPI(group_id) {
  return apiRequest(`/rrl/${group_id}`);
}

export async function submitRRLFeedbackAPI(id, feedback) {
  return apiRequest(`/rrl/feedback`, {
    method: "POST",
    body: JSON.stringify({ id, feedback }),
    headers: {
      "Content-Type": "application/json",
    },
  });
}
