import { apiRequest } from "./http";

export async function generateObjectivesAPI(group_id, gap_id, topic_id) {
  return apiRequest(`/objective/generate`, {
    method: "POST",
    body: JSON.stringify({ group_id, gap_id, topic_id }),
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function getObjectivesAPI(group_id) {
  return apiRequest(`/objective/${group_id}`);
}

export async function saveObjectiveEditAPI(id, objectives) {
  return apiRequest(`/objective/${id}`, {
    method: "PUT",
    body: JSON.stringify({ objectives }),
    headers: {
      "Content-Type": "application/json",
    },
  });
}
