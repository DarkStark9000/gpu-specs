// Checks data/gpus.json against the rules in README.md. Exits 1 and lists every problem.
//   node scripts/validate.mjs

import { readFileSync } from "node:fs";

import { FIELDS, REQUIRED, SEGMENTS, TIERS, VENDORS, at } from "./fields.mjs";

const FILE = new URL("../data/gpus.json", import.meta.url);
const text = readFileSync(FILE, "utf8");
const data = JSON.parse(text);
const problems = [];
const fail = (where, message) => problems.push(`${where}: ${message}`);

// Dashes U+2013 and U+2014 read as a different character to people and tools; the data uses ASCII hyphens.
// Built from code points so this file itself stays ASCII.
const DASHES = new RegExp(`[${String.fromCharCode(0x2013, 0x2014)}]`);
for (const [index, line] of text.split("\n").entries()) {
  if (DASHES.test(line)) fail(`line ${index + 1}`, "contains an en or em dash");
}

if (data.schemaVersion !== 1) fail("file", "schemaVersion must be 1");
if (!/^\d{4}-\d{2}-\d{2}$/.test(data.generated ?? "")) fail("file", "generated must be a YYYY-MM-DD date");

const sources = new Map();
for (const source of data.sources ?? []) {
  const where = `source ${source.id}`;
  if (sources.has(source.id)) fail(where, "duplicate id");
  sources.set(source.id, source);
  if (!/^https:\/\//.test(source.url ?? "")) fail(where, "url must be https");
  if (!source.title || !source.publisher) fail(where, "needs a title and a publisher");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(source.retrieved ?? "")) fail(where, "retrieved must be a YYYY-MM-DD date");
  if (!TIERS.includes(source.tier)) fail(where, `tier must be one of ${TIERS.join(", ")}`);
}

const used = new Set();
const ids = new Set();
const KNOWN = new Set(FIELDS.map(([path]) => path));

function checkCited(field, where) {
  if (!sources.has(field.source)) fail(where, `source ${field.source} does not resolve`);
  else used.add(field.source);
  if (typeof field.quote !== "string" || field.quote.trim() === "") fail(where, "needs the source's words in quote");
}

function checkField(field, path, unit, where) {
  if (field === undefined) {
    if (REQUIRED.has(path)) fail(where, "missing");
    return;
  }
  const { value } = field;
  if (value === "TBD") {
    if (!field.reason) fail(where, "TBD needs a reason");
    return;
  }
  if (value === null) {
    if (field.status !== "not-supported" || !field.reason) fail(where, "null means not-supported and needs a reason");
    return;
  }
  checkCited(field, where);
  if (unit === null) {
    if (typeof value !== "string" || value === "") fail(where, "must be text");
    return;
  }
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) fail(where, "must be a positive number");
  if (field.unit !== unit) fail(where, `unit must be ${unit}, not ${field.unit}`);
  if (path.startsWith("compute.") && field.dense !== true) fail(where, "compute values are dense only (dense: true)");
  if (field.derivedFromSparse === true && (typeof field.sparseValue !== "number" || !field.formula)) {
    fail(where, "a value derived from a sparse figure needs sparseValue and formula");
  }
  if (field.printed && (typeof field.printed.value !== "number" || !field.printed.unit)) {
    fail(where, "printed must hold the vendor's own value and unit");
  }
}

for (const gpu of data.gpus ?? []) {
  const where = `gpu ${gpu.id}`;
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(gpu.id ?? "")) fail(where, "id must be lowercase kebab-case");
  if (ids.has(gpu.id)) fail(where, "duplicate id");
  ids.add(gpu.id);
  if (!VENDORS.includes(gpu.vendor)) fail(where, `vendor must be one of ${VENDORS.join(", ")}`);
  if (!SEGMENTS.includes(gpu.segment)) fail(where, `segment must be one of ${SEGMENTS.join(", ")}`);
  for (const [path, unit] of FIELDS) checkField(at(gpu, path), path, unit, `${where} ${path}`);
  for (const group of ["memory", "compute", "interconnect"]) {
    for (const key of Object.keys(gpu[group] ?? {})) {
      const path = `${group}.${key}`;
      const node = gpu[group][key];
      if (node && typeof node === "object" && "value" in node && !KNOWN.has(path)) fail(where, `unknown field ${path}`);
    }
  }
}

// A source either backs a value or a decision recorded in NOTES.md (a conflict, an exclusion).
const notes = readFileSync(new URL("../NOTES.md", import.meta.url), "utf8");
for (const id of sources.keys()) {
  if (!used.has(id) && !notes.includes(id)) fail(`source ${id}`, "is cited by no value and named nowhere in NOTES.md");
}

if (problems.length > 0) {
  console.error(problems.join("\n"));
  console.error(`\n${problems.length} problems`);
  process.exit(1);
}
console.log(`ok: ${ids.size} GPUs, ${sources.size} sources`);
