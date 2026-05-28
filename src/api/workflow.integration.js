import { apiRequest } from "./http";

export async function consolidateGapsAPI(group_id, gap_ids) {
  return apiRequest("/integration/consolidate", {
    method: "POST",
    body: JSON.stringify({ group_id, gap_ids }),
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function getIntegratedGapsAPI(group_id) {
  return apiRequest(`/integration/integrated/${group_id}`);
}
