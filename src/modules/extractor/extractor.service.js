import { triggerExtractorWorkflow, insertExtractorRepo, getExtractorDataByGroupIdRepo } from "./extractor.repository.js";

function findMatchingValue(node, keys) {
  if (!node || typeof node !== "object") {
    return undefined;
  }

  if (Array.isArray(node)) {
    for (const item of node) {
      const found = findMatchingValue(item, keys);
      if (found !== undefined) {
        return found;
      }
    }
    return undefined;
  }

  for (const key of Object.keys(node)) {
    if (keys.includes(key)) {
      return node[key];
    }

    const nested = findMatchingValue(node[key], keys);
    if (nested !== undefined) {
      return nested;
    }
  }

  return undefined;
}

function normalizeExtractorResponse(result) {
  if (!result) {
    return null;
  }

  let payload = result;

  if (Array.isArray(payload)) {
    payload = payload[0] ?? null;
  }

  if (!payload || typeof payload !== "object") {
    return null;
  }

  const wrappers = ["data", "output", "result", "json", "body"];
  for (const wrapper of wrappers) {
    if (payload[wrapper] && typeof payload[wrapper] === "object") {
      payload = payload[wrapper];
      break;
    }
  }

  if (!payload || typeof payload !== "object") {
    return null;
  }

  const normalized = {
    title: findMatchingValue(payload, ["title", "Title", "paper_title", "paperTitle"]) ?? null,
    abstract: findMatchingValue(payload, ["abstract", "Abstract"]) ?? null,
    introduction: findMatchingValue(payload, ["introduction", "Introduction"]) ?? null,
    methodology: findMatchingValue(payload, ["methodology", "Methodology"]) ?? null,
    discussion: findMatchingValue(payload, ["discussion", "Discussion"]) ?? null,
    results: findMatchingValue(payload, ["results", "Results"]) ?? null,
    conclusion: findMatchingValue(payload, ["conclusion", "Conclusion"]) ?? null,
    keywords: findMatchingValue(payload, ["keywords", "Keywords"]) ?? null,
    literature_review: findMatchingValue(payload, ["literature_review", "literature review", "Literature Review", "Literature_Review"]) ?? null,
  };

  return normalized;
}

export async function runExtractorService(file, filename,group_id) {
  if (!file) {
    return { status: 400, message: "File is required" };
  }

  try {
    const result = await triggerExtractorWorkflow(file, filename);
    console.log("Extractor workflow raw response:", JSON.stringify(result, null, 2));
    const extractedData = normalizeExtractorResponse(result);
    console.log("Extractor normalized payload:", JSON.stringify(extractedData, null, 2));

    if (!extractedData) {
      return { status: 500, message: "Workflow response was empty or invalid" };
    }

    const insertedData = await insertExtractorRepo(group_id, extractedData);
    return { status: 200, message: "Workflow triggered successfully", data: insertedData || null };
  } catch (err) {
    console.error("Service error:", err);
    return { status: 500, message: "Failed to trigger workflow: " + err.message };
  }
}
export async function fetchExtractedDataUsingGroupIdService(groupId) {
  try {
    const data = await getExtractorDataByGroupIdRepo(groupId);
    if (!data || data.length === 0) {
      return { status: 404, message: "No data found for the given group ID" };
    }
    return { status: 200, message: "Data retrieved successfully", data: data };
  } catch (err) {
    console.error("Service error:", err);
    return { status: 500, message: "Failed to retrieve data: " + err.message };
  }   
}
