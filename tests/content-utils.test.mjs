import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  formatMonth,
  isVisible,
  loadSettings,
  normalizeNews,
  normalizePublications,
  normalizeStudents,
  parseGvizResponse,
  safeUrl,
} from "../app/lib/content.ts";
import { readXlsxSheet } from "../app/lib/xlsx.ts";

const workbook = new URL(
  "../outputs/eusun-han-lab/Eusun-Han-Lab-content-template.xlsx",
  import.meta.url,
);

test("parses Google Visualization rows using row-one headers", () => {
  const source = 'google.visualization.Query.setResponse({"status":"ok","table":{"cols":[{"label":"Display Order"},{"label":"Name"}],"rows":[{"c":[{"v":2},{"v":"Ada"}]}]}});';
  assert.deepEqual(parseGvizResponse(source), [{ display_order: 2, name: "Ada" }]);
});

test("formats Google date values and sorts visible news newest first", () => {
  const news = normalizeNews([
    { month: "Date(2025,0,1)", content: "Older", visible: true },
    { month: "Date(2026,8,1)", content: "Newest", visible: "" },
    { month: "Date(2027,0,1)", content: "Hidden", visible: false },
  ]);
  assert.equal(formatMonth(news[0].month), "Sep 2026");
  assert.deepEqual(news.map((item) => item.content), ["Newest", "Older"]);
});

test("orders members and rejects unsafe links", () => {
  const students = normalizeStudents([
    { group: "Undergraduate", display_order: 2, name: "Second", personal_url: "javascript:alert(1)" },
    { group: "Visiting", display_order: 1, name: "Visitor" },
    { group: "Undergraduate", display_order: 1, name: "First", personal_url: "https://example.com" },
    { group: "Graduate", display_order: 1, name: "Graduate" },
  ]);
  assert.deepEqual(students.map((student) => student.name), ["First", "Second", "Visitor", "Graduate"]);
  assert.equal(students[0].personal_url, "https://example.com");
  assert.equal(students[1].personal_url, "");
  assert.equal(safeUrl("data:text/html,hello"), "");
  assert.equal(isVisible("FALSE"), false);
  assert.equal(isVisible(""), true);
});

test("orders publication groups by their first XLSX row", () => {
  const publications = normalizePublications([
    { category: "Journal", year: 2024, display_order: 2, title: "Older Journal" },
    { category: "International Conference", year: 2026, display_order: 1, title: "Conference" },
    { category: "Journal", year: 2025, display_order: 1, title: "Newer Journal" },
  ]);

  assert.deepEqual(publications.map((publication) => publication.title), [
    "Newer Journal",
    "Older Journal",
    "Conference",
  ]);
});

test("reads the local XLSX content source", async () => {
  const bytes = new Uint8Array(await readFile(workbook));
  const settings = readXlsxSheet(bytes, "Settings");
  const news = readXlsxSheet(bytes, "News");

  const labName = settings.find((row) => row.key === "lab_name");
  assert.equal(typeof labName?.value, "string");
  assert.ok(labName.value);
  assert.ok(Array.isArray(news));
});

test("uses the local XLSX when GOOGLE_SHEET_ID is empty locally", async () => {
  const previousSheetId = process.env.GOOGLE_SHEET_ID;
  const previousNodeEnv = process.env.NODE_ENV;
  process.env.GOOGLE_SHEET_ID = "";
  process.env.NODE_ENV = "development";

  try {
    const settings = readXlsxSheet(new Uint8Array(await readFile(workbook)), "Settings");
    const expected = settings.find((row) => row.key === "lab_name")?.value;
    const result = await loadSettings();
    assert.equal(result.data.lab_name, expected);
    assert.equal(result.demo, false);
  } finally {
    if (previousSheetId === undefined) delete process.env.GOOGLE_SHEET_ID;
    else process.env.GOOGLE_SHEET_ID = previousSheetId;
    if (previousNodeEnv === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = previousNodeEnv;
  }
});

test("uses Google Sheets when GOOGLE_SHEET_ID is set locally", async () => {
  const previousSheetId = process.env.GOOGLE_SHEET_ID;
  const previousFetch = globalThis.fetch;
  process.env.GOOGLE_SHEET_ID = "sheet-id";
  globalThis.fetch = async () => new Response(
    'google.visualization.Query.setResponse({"status":"ok","table":{"cols":[{"label":"key"},{"label":"value"}],"rows":[{"c":[{"v":"lab_name"},{"v":"Google Sheet Lab"}]}]}});',
  );

  try {
    const result = await loadSettings();
    assert.equal(result.data.lab_name, "Google Sheet Lab");
    assert.equal(result.demo, false);
  } finally {
    globalThis.fetch = previousFetch;
    if (previousSheetId === undefined) delete process.env.GOOGLE_SHEET_ID;
    else process.env.GOOGLE_SHEET_ID = previousSheetId;
  }
});
