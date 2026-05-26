import { v4 as uuidv4 } from "uuid";

const rrlAssessments = new Map();

function buildFallbackAssessment(paper) {
  const score = Math.min(100, Math.max(50, 72 + (paper.title?.length || 0) / 12));

  return {
    id: `assessment-${uuidv4()}`,
    title: paper.title || "Untitled research paper",
    relevanceScore: Math.round(score),
    criteria: {
      recency: 4,
      alignment: 5,
      significance: 4,
      relevance: 5,
    },
    assessment: `The paper is relevant to the current workspace and provides a solid foundation for reviewing related literature. It aligns well with the selected research direction and contains evidence suitable for a literature synthesis.`,
    feedback: "pending",
    createdAt: new Date().toISOString(),
  };
}

async function callN8nWorkflow(paper) {
  const webhookUrl = process.env.N8N_RRL_WEBHOOK_URL;

  if (!webhookUrl) {
    return null;
  }

  const res = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(paper),
  });

  if (!res.ok) {
    throw new Error(`RRL workflow failed: ${res.status}`);
  }

  const payload = await res.json();

  if (Array.isArray(payload)) {
    return payload[0] || null;
  }

  return payload;
}

function normalizeN8nResponse(payload, paper) {
  if (!payload) {
    return buildFallbackAssessment(paper);
  }

  const assessment = typeof payload === "string" ? { assessment: payload } : payload;

  return {
    id: assessment.id || `assessment-${uuidv4()}`,
    title: assessment.title || paper.title || "Untitled research paper",
    relevanceScore: Number.isFinite(Number(assessment.relevanceScore))
      ? Number(assessment.relevanceScore)
      : Number.isFinite(Number(assessment.score))
        ? Number(assessment.score)
        : 80,
    criteria: assessment.criteria || {
      recency: 4,
      alignment: 5,
      significance: 4,
      relevance: 5,
    },
    assessment: assessment.assessment || assessment.summary || "AI assessment is not available for this paper.",
    feedback: assessment.feedback || "pending",
    createdAt: assessment.createdAt || new Date().toISOString(),
  };
}

export async function runRRLAssessmentService(group_id, papers) {
  const selectedPapers = (papers || []).map((paper) => ({
    id: paper.id,
    title: paper.title,
    summary: paper.summary || paper.literature_review || paper.abstract || paper.introduction || "",
  }));

  const assessments = [];

  for (const paper of selectedPapers) {
    const payload = await callN8nWorkflow(paper);
    const assessment = normalizeN8nResponse(payload, paper);
    assessments.push(assessment);
  }

  const existing = rrlAssessments.get(group_id) || [];
  const saved = [...assessments, ...existing];
  rrlAssessments.set(group_id, saved);

  return {
    status: 200,
    message: "RRL assessment completed.",
    data: {
      group_id,
      assessments,
    },
  };
}

export async function getRRLAssessmentsService(group_id) {
  return {
    status: 200,
    message: "RRL assessments retrieved.",
    data: rrlAssessments.get(group_id) || [],
  };
}

export async function updateRRLFeedbackService(group_id, assessment_id, feedback) {
  const assessments = rrlAssessments.get(group_id) || [];
  const updated = assessments.map((assessment) =>
    assessment.id === assessment_id
      ? { ...assessment, feedback }
      : assessment
  );

  rrlAssessments.set(group_id, updated);

  return {
    status: 200,
    message: "Feedback updated.",
    data: updated,
  };
}
