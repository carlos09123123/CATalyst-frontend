import { v4 as uuidv4 } from "uuid";

const importedRecords = new Map();

function normalizeJsonPayload(payload) {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (payload?.records && Array.isArray(payload.records)) {
    return payload.records;
  }

  const entries = Object.entries(payload || {});
  return entries.map(([title, gap]) => ({
    title,
    gap,
    source: "json",
  }));
}

function parseCsv(content) {
  const lines = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return [];
  }

  const headers = lines[0].split(",").map((item) => item.trim().toLowerCase());
  const records = lines.slice(1).map((line) => {
    const values = line.split(",").map((value) => value.trim());
    const row = {};

    headers.forEach((header, index) => {
      row[header] = values[index] ?? "";
    });

    return row;
  });

  return records;
}

function normalizeRecord(record, fallbackSource = "upload") {
  const title = (record.title || record.Title || record.name || "").toString().trim();
  const gap = (record.gap || record.Gap || record.description || record.summary || "").toString().trim();
  const source = (record.source || record.Source || fallbackSource).toString().trim() || fallbackSource;

  return {
    id: record.id || `import-${uuidv4()}`,
    title,
    gap,
    source,
  };
}

function validateRecord(record) {
  const errors = [];

  if (!record.title) {
    errors.push("Missing title.");
  }

  if (!record.gap) {
    errors.push("Missing gap text.");
  }

  return errors;
}

function parseImportContent(filename, content) {
  if (!filename) {
    throw new Error("Missing file name.");
  }

  const lowerName = filename.toLowerCase();

  if (lowerName.endsWith(".json")) {
    const parsed = JSON.parse(content);
    return normalizeJsonPayload(parsed).map((record) => normalizeRecord(record));
  }

  if (lowerName.endsWith(".csv")) {
    return parseCsv(content).map((record) => normalizeRecord(record));
  }

  throw new Error("Unsupported file type. Please upload CSV or JSON.");
}

export async function previewImportedDataService(fileBuffer, filename, group_id) {
  const content = fileBuffer.toString("utf8");
  const records = parseImportContent(filename, content);
  const validRecords = [];
  const invalidRecords = [];

  for (const record of records) {
    const errors = validateRecord(record);
    if (errors.length > 0) {
      invalidRecords.push({
        ...record,
        errors,
      });
      continue;
    }

    validRecords.push({
      ...record,
      group_id,
      status: "pending",
      selected: true,
    });
  }

  return {
    status: 200,
    message: "Preview generated.",
    data: {
      group_id,
      records: validRecords,
      invalidRecords,
      summary: {
        total: records.length,
        valid: validRecords.length,
        invalid: invalidRecords.length,
      },
    },
  };
}

export async function confirmImportedDataService(group_id, records) {
  const normalized = (records || []).map((record) => ({
    ...normalizeRecord(record, record.source || "upload"),
    status: record.status || "accepted",
    selected: record.selected !== false,
    group_id,
  }));

  importedRecords.set(group_id, normalized);

  const accepted = normalized.filter((record) => record.status !== "rejected");
  const rejected = normalized.filter((record) => record.status === "rejected");

  return {
    status: 200,
    message: "Import confirmed.",
    data: {
      group_id,
      records: normalized,
      summary: {
        total: normalized.length,
        accepted: accepted.length,
        rejected: rejected.length,
      },
    },
  };
}

export async function getImportedDataService(group_id) {
  return {
    status: 200,
    message: "Imported records retrieved.",
    data: importedRecords.get(group_id) || [],
  };
}
