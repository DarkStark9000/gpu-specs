// Writes data/gpus.csv from data/gpus.json: one row per GPU, one column per field, in the units of fields.mjs.
//   node scripts/build-csv.mjs           write the file
//   node scripts/build-csv.mjs --check   exit 1 if the committed file is stale
//
// A cell holds the number, "TBD" (the vendor publishes no value), "n/a" (the
// part lacks the feature) or nothing (the field does not apply to that part).
// Sources and quotes stay in the JSON; the CSV is for spreadsheets and quick reads.

import { readFileSync, writeFileSync } from "node:fs";

import { FIELDS, at } from "./fields.mjs";

const JSON_FILE = new URL("../data/gpus.json", import.meta.url);
const CSV_FILE = new URL("../data/gpus.csv", import.meta.url);

function cell(field) {
  if (field === undefined) return "";
  if (field.value === "TBD") return "TBD";
  if (field.value === null) return "n/a";
  return String(field.value);
}

function quoted(text) {
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

const data = JSON.parse(readFileSync(JSON_FILE, "utf8"));
const header = ["id", "vendor", "segment", ...FIELDS.map(([, , column]) => column)];
const rows = data.gpus.map((gpu) => [gpu.id, gpu.vendor, gpu.segment, ...FIELDS.map(([path]) => cell(at(gpu, path)))]);
const csv = `${[header, ...rows].map((row) => row.map(quoted).join(",")).join("\n")}\n`;

if (process.argv.includes("--check")) {
  let current = "";
  try {
    current = readFileSync(CSV_FILE, "utf8");
  } catch {
    // A missing file is stale too.
  }
  if (current !== csv) {
    console.error("data/gpus.csv is stale: run node scripts/build-csv.mjs");
    process.exit(1);
  }
  console.log("data/gpus.csv is current");
} else {
  writeFileSync(CSV_FILE, csv);
  console.log(`wrote data/gpus.csv: ${rows.length} rows, ${header.length} columns`);
}
