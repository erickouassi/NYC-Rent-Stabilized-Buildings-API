const fetch = require("node-fetch");

const SHEET_URL =
  "https://opensheet.elk.sh/10u3-PThnIy9cGqISt0vC2TOngcDH31PGmMpoIGzRd2Y/All";

let dataset = null;

/* Build JustFix WhoOwnsWhat URL dynamically */
function buildJustFixURL(record) {
  const borough = encodeURIComponent(record.BOROUGH?.toUpperCase() || "");
  const number = encodeURIComponent(record.BUILDING_NO || "");
  const street = encodeURIComponent(record.STREET?.toUpperCase() || "");
  return `https://whoownswhat.justfix.org/en/address/${borough}/${number}/${street}`;
}

/* Validate record before flattening */
function isValidRecord(record) {
  return (
    record &&
    record.BUILDING_NO &&
    record.STREET &&
    record.BOROUGH &&
    record.BUILDING_NO.trim() !== "" &&
    record.STREET.trim() !== "" &&
    record.BOROUGH.trim() !== ""
  );
}

/* Load dataset once per cold start */
async function loadDataset() {
  if (dataset) return dataset;

  const res = await fetch(SHEET_URL);
  const json = await res.json();

  const expanded = expandBuildingRanges(json);

  // 🔥 Only flatten VALID records
  dataset = expanded
    .filter(isValidRecord)
    .map(flattenRecord);

  return dataset;
}

/* Expand ranges like "1000 TO 1020" */
function expandBuildingRanges(data) {
  const final = [];

  for (const row of data) {
    const raw = row.BUILDING_NO;

    if (!raw || typeof raw !== "string") {
      // keep row only if valid
      if (isValidRecord(row)) final.push(row);
      continue;
    }

    const cleaned = raw.toUpperCase().trim();
    const range = cleaned.match(/^(\d+)\s*TO\s*(\d+)$/);

    if (range) {
      const start = parseInt(range[1], 10);
      const end = parseInt(range[2], 10);
      const step = start <= end ? 1 : -1;

      for (let n = start; step > 0 ? n <= end : n >= end; n += step) {
        const newRow = { ...row, BUILDING_NO: n.toString() };
        if (isValidRecord(newRow)) final.push(newRow);
      }
    } else {
      if (isValidRecord({ ...row, BUILDING_NO: cleaned })) {
        final.push({ ...row, BUILDING_NO: cleaned });
      }
    }
  }

  return final;
}

/* Flatten record into flat JSON */
function flattenRecord(record) {
  return {
    rent_stabilized: true,
    no: record.no || "",
    building_no: record.BUILDING_NO || "",
    street: record.STREET || "",
    borough: record.BOROUGH || "",
    zip: record.ZIP || "",
    city: record.CITY || "",
    county: record.COUNTY || "",
    block: record.BLOCK || "",
    lot: record.LOT || "",
    borough_code: record.Borough_Code || "",
    latitude: record.LATITUDE || "",
    longitude: record.LONGITUDE || "",
    status1: record.STATUS1 || "",
    status2: record.STATUS2 || "",
    status3: record.STATUS3 || "",
    displacement_alert: record.Borough_Block_Lot || "https://portal.displacementalert.org/lookup",
    justfix_url_dynamic: buildJustFixURL(record)
  };
}

module.exports = { loadDataset };
