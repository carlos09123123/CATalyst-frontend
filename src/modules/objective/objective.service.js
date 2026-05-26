import { v4 as uuidv4 } from "uuid";

const objectiveStore = new Map();

function normalizeTopicLabel(topic) {
  if (!topic) return "the selected research topic";
  return topic.toString().trim();
}

function normalizeGapLabel(gap) {
  if (!gap) return "the identified research gap";
  return gap.toString().trim();
}

function buildFallbackObjectives(gapText, topicText) {
  const topic = normalizeTopicLabel(topicText);
  const gap = normalizeGapLabel(gapText);

  return [
    `By the end of this semester, the study will specify how ${topic} can address ${gap} through a focused research design and measurable outcomes.`,
    `Within 12 weeks, the researcher will collect and analyze data that measures the impact of ${topic} on ${gap}.`,
    `The project will evaluate whether ${topic} improves current practice by comparing measurable indicators linked to ${gap}.`,
    `By the final submission, the study will produce a validated recommendation for ${topic} that directly resolves ${gap}.`,
  ];
}

async function callN8nWorkflow(payload) {
  const webhookUrl = process.env.N8N_OBJECTIVE_WEBHOOK_URL;

  if (!webhookUrl) {
    return null;
  }

  const res = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`Objective workflow failed: ${res.status}`);
  }

  return await res.json();
}

function normalizeN8nResponse(payload, gapText, topicText) {
  if (!payload) {
    return buildFallbackObjectives(gapText, topicText);
  }

  const objectives = Array.isArray(payload.objectives)
    ? payload.objectives
    : Array.isArray(payload)
      ? payload
      : buildFallbackObjectives(gapText, topicText);

  return objectives.map((objective) => (typeof objective === "string" ? objective : objective.value || objective.text || "")).filter(Boolean);
}

export async function generateObjectivesService(group_id, payload) {
  const gapText = payload.gap_text || payload.gap || "";
  const topicText = payload.topic_text || payload.topic || "";
  const objectives = await normalizeN8nResponse(
    await callN8nWorkflow({
      gap: gapText,
      topic: topicText,
      gap_id: payload.gap_id,
      topic_id: payload.topic_id,
    }),
    gapText,
    topicText,
  );

  const version = {
    id: `objective-${uuidv4()}`,
    group_id,
    gap: payload.gap || gapText,
    topic: payload.topic || topicText,
    objectives,
    createdAt: new Date().toISOString(),
    status: "generated",
  };

  const existing = objectiveStore.get(group_id) || [];
  objectiveStore.set(group_id, [version, ...existing]);

  return {
    status: 200,
    message: "SMART objectives generated.",
    data: {
      group_id,
      version,
      versions: objectiveStore.get(group_id),
    },
  };
}

export async function regenerateObjectivesService(group_id, payload) {
  return generateObjectivesService(group_id, payload);
}

export async function saveObjectiveVersionService(group_id, version) {
  const stored = objectiveStore.get(group_id) || [];
  const savedVersion = {
    ...version,
    id: version.id || `objective-${uuidv4()}`,
    group_id,
    createdAt: version.createdAt || new Date().toISOString(),
  };

  objectiveStore.set(group_id, [savedVersion, ...stored]);

  return {
    status: 200,
    message: "Objective version saved.",
    data: {
      group_id,
      version: savedVersion,
      versions: objectiveStore.get(group_id),
    },
  };
}

export async function getObjectiveHistoryService(group_id) {
  return {
    status: 200,
    message: "Objective history retrieved.",
    data: objectiveStore.get(group_id) || [],
  };
}
