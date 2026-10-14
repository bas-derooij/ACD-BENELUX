// Run with: npm test
const test = require("node:test");
const assert = require("node:assert/strict");
const ExcelJS = require("exceljs");
const R = require("../docs/roadmap.js");

const HEADER = ["Domein", "Onderneming", "Naam", "Telefoonnummer", "Mailadres", "Website", "Locatie ",
  "Deelstaat", "Regio Duitsland", "Status", "Status informatie ", "Volgende actie ", "Laatste bezoek",
  "Demo-serre", "Notitie"];
const fill = (argb) => ({ type: "pattern", pattern: "solid", fgColor: { argb } });

// A small sheet in the same layout as the real roadmap (fictional data).
async function sampleWorkbook() {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Blad1");
  ws.getCell("A1").value = "ROADMAP ACD BENELUX";
  ws.getCell("A2").value = "Update datum:";
  ws.getRow(4).values = HEADER;
  const rows = [
    [["Dealer Galabau", "Test Galabau", "Max Muster", "+49 1", "a@b.de", "/", "Kastl", "Beieren", "Zuid-oosten", null,
      "1e gesprek", "Terugbellen", new Date(Date.UTC(2026, 3, 10)), "/", "Notitie"], "FFFFC000"],
    [["Merkambassadeur", "Groene Lead", "Anna", null, null, { text: "insta", hyperlink: "https://x" }, "Hamburg",
      "Hamburg", "Noorden", null, { richText: [{ text: "Samen" }, { text: "werking loopt" }] }], "FF00B050"],
    [["Merkambassadeur", "Rode Lead", "Bob"], "FFFF0000"],
    [["Beurs deelname", "/", "Galabau Messe", null, null, null, "Nürnberg", "Beieren"], "FF00B050"],
    [["Dealer Galabau", "Zonder kleur"], null],
  ];
  rows.forEach(([values, color], i) => {
    const row = ws.getRow(5 + i);
    row.values = values;
    if (color) row.getCell(10).fill = fill(color);
  });
  const buffer = await wb.xlsx.writeBuffer();
  const loaded = new ExcelJS.Workbook();
  await loaded.xlsx.load(buffer);
  return loaded;
}

test("readRoadmap imports every row and keeps the colour as status in the background", async () => {
  const res = R.readRoadmap(await sampleWorkbook());
  assert.deepEqual(res.leads.map((l) => [l.data.company, l.data.status]), [
    ["Test Galabau", "gesprek"],
    ["Groene Lead", "samenwerking"],
    ["Rode Lead", "geen"],
    ["Galabau Messe", "samenwerking"],
    ["Zonder kleur", undefined],
  ]);

  const [first, second, , fair] = res.leads.map((l) => l.data);
  assert.equal(first.category, "Dealer", "old Domein values are split");
  assert.equal(first.subcategory, "GaLa Bau", "subcategory is kept in the data");
  assert.equal(second.category, "Ambassadeur");
  assert.equal(second.subcategory, "");
  assert.equal(first.city, "Kastl");
  assert.equal(first.website, "", "'/' means empty");
  assert.equal(first.last_visit, "10/04/2026");
  assert.equal(first.status_info, "1e gesprek");
  assert.equal(first.next_action, "Terugbellen");
  assert.equal(first.notes, "Notitie");
  assert.ok(!("regio" in first) && !Object.values(first).includes("Zuid-oosten"), "column I is ignored");
  assert.equal(second.website, "insta");
  assert.equal(second.status_info, "Samenwerking loopt");
  assert.equal(fair.contact_name, "", "fairs: name column becomes the company");
});

test("a Categorie column is used as-is, with spelling variants normalised", async () => {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Roadmap");
  ws.getRow(4).values = ["Categorie", "Onderneming", "Concurrerende merken"];
  ws.getRow(5).values = ["premium  dealer", "X BV", "Janssens, euroserre"];
  ws.getRow(6).values = ["Certified assembler", "Y BV"];
  ws.getRow(7).values = ["Ambassador", "Z BV"];
  ws.getRow(8).values = ["DEALER", "W BV", "Lams; Nieuw Merk"];
  const loaded = new ExcelJS.Workbook();
  await loaded.xlsx.load(await wb.xlsx.writeBuffer());
  const leads = R.readRoadmap(loaded).leads.map((l) => [l.data.category, l.data.competitor_brands || ""]);
  assert.deepEqual(leads, [
    ["Premium Dealer", "Janssens, euroserre"],
    ["Certified Assembler", ""],
    ["Ambassadeur", ""],
    ["Dealer", "Lams; Nieuw Merk"],
  ]);
});

test("classifyColor", () => {
  assert.equal(R.classifyColor("FFC000"), "gesprek");
  assert.equal(R.classifyColor("FFA500"), "gesprek");
  assert.equal(R.classifyColor("00B050"), "samenwerking");
  assert.equal(R.classifyColor("4EA72E"), "samenwerking");
  assert.equal(R.classifyColor("FF0000"), "geen");
  assert.equal(R.classifyColor("FFFFFF"), null);
  assert.equal(R.classifyColor(null), null);
});

test("export can be imported again", async () => {
  const leads = [
    { company: "B BV", category: "Dealer", subcategory: "GaLa Bau", status: "gesprek", city: "Venlo", next_action: "Bellen",
      next_action_date: "2026-10-06", competitor_brands: ["Janssens", "Royal Well"] },
    { company: "A BV", category: "Ambassador", subcategory: "", status: "samenwerking", city: "Gent" }, // old name
    { company: "C", category: "Premium Dealer", subcategory: "", status: "gesprek", country: "BE" },
    { company: "D", category: "Certified Assembler", subcategory: "Monteur", status: "gesprek" },
  ];
  const wb = R.buildRoadmap(ExcelJS, leads, { groupBy: "category" });
  assert.deepEqual(wb.worksheets.map((w) => w.name), ["Overzicht", "Dealer", "Premium Dealer", "Certified Assembler", "Ambassador"]);
  const ws = wb.worksheets[0];
  const headers = ws.getRow(4).values.slice(1);
  assert.equal(headers[0], "Categorie");
  assert.ok(!headers.includes("Subcategorie") && !headers.includes("Status"), "hidden fields are not exported");
  assert.ok(headers.includes("Concurrerende merken"));
  assert.ok(headers.includes("Status informatie"));
  const col = (name) => headers.indexOf(name) + 1;
  assert.equal(ws.getRow(5).getCell(col("Onderneming")).value, "B BV", "sorted by category");
  assert.equal(ws.getRow(5).getCell(col("Concurrerende merken")).value, "Janssens, Royal Well");
  assert.equal(ws.getRow(6).getCell(col("Onderneming")).value, "C");

  const loaded = new ExcelJS.Workbook();
  await loaded.xlsx.load(await wb.xlsx.writeBuffer());
  const back = R.readRoadmap(loaded).leads.map((l) => l.data);
  assert.equal(back.length, 4);
  const b = back.find((l) => l.company === "B BV");
  assert.equal(b.category, "Dealer");
  assert.equal(b.competitor_brands, "Janssens, Royal Well");
  assert.equal(back.find((l) => l.company === "C").country, "België", "Land column is exported and read back");
  assert.equal(back.find((l) => l.company === "A BV").category, "Ambassadeur", "old names are renamed on import");
  assert.equal(b.next_action, "Bellen (tegen 06/10/2026)");
});

test("placeQueries translates Dutch state names and simplifies place names", () => {
  assert.deepEqual(R.placeQueries("Kastl", "Beieren")[0], { city: "Kastl", state: "Bayern" });
  assert.equal(R.germanState("Hessen (Frankfurt)"), "Hessen");
  assert.equal(R.germanState("Noordrijn Westfalen"), "Nordrhein-Westfalen");
  assert.equal(R.germanState("Opper-Oostenrijk"), "Oberösterreich");
  assert.equal(R.germanState("Tirol"), "Tirol");
  assert.deepEqual(R.placeQueries("Innsbruck", "Tirol")[0], { city: "Innsbruck", state: "Tirol" });
  const q = R.placeQueries("Muldestausee Ot Rösa", "Saksen-Anhalt").map((x) => x.city);
  assert.ok(q.includes("Muldestausee"));
  assert.ok(!R.placeQueries("Bad Bellingen", "").some((x) => x.city === "Bad"));
});
