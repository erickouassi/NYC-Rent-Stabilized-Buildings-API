// api/all.js — Vercel Serverless Function (Full Flat JSON Dataset)
const fetch = require("node-fetch");

const SHEET_URL =
  "https://opensheet.elk.sh/10u3-PThnIy9cGqISt0vC2TOngcDH31PGmMpoIGzRd2Y/All";

let dataset = null;

/* Load dataset once per cold start */
async function loadDataset() {
  if (dataset) return dataset;

  const res = await fetch(SHEET_URL);
  const json = await res.json();
  dataset = expandBuildingRanges(json).map(flattenRecord);
  return dataset;
}

/* Expand ranges like "1000 TO 1020" */
function expandBuildingRanges(data) {
  const final = [];

  for (const row of data) {
    const raw = row.BUILDING_NO;
    if (!raw || typeof raw !== "string") {
      final.push(row);
      continue;
    }

    const cleaned = raw.toUpperCase().trim();
    const range = cleaned.match(/^(\d+)\s*TO\s*(\d+)$/);

    if (range) {
      const start = parseInt(range[1], 10);
      const end = parseInt(range[2], 10);
      const step = start <= end ? 1 : -1;

      for (let n = start; step > 0 ? n <= end : n >= end; n += step) {
        final.push({ ...row, BUILDING_NO: n.toString() });
      }
    } else {
      final.push({ ...row, BUILDING_NO: cleaned });
    }
  }

  return final;
}

/* Flatten record into flat JSON */
function flattenRecord(record) {
  return {
    rent_stabilized: true,
    no: record.no,
    building_no: record.BUILDING_NO,
    street: record.STREET,
    borough: record.BOROUGH,
    zip: record.ZIP,
    city: record.CITY,
    county: record.COUNTY,
    block: record.BLOCK,
    lot: record.LOT,
    borough_code: record.Borough_Code,
    latitude: record.LATITUDE,
    longitude: record.LONGITUDE,
    status1: record.STATUS1,
    status2: record.STATUS2,
    status3: record.STATUS3,
    displacement_alert: record.Borough_Block_Lot,
    justfix_url: record.JUSTFIX_URL
  };
}

/* Vercel API handler */
module.exports = async (req, res) => {
  const data = await loadDataset();
  res.status(200).json(data);
};
