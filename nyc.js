// 1. Expand a single record into multiple records if BUILDING_NO is a range
function explodeRecord(record) {
  const raw = record.BUILDING_NO;
  if (!raw || typeof raw !== "string") return [record];

  const cleaned = raw.toUpperCase().trim();

  // Detect range: "1000 TO 1020"
  const range = cleaned.match(/^(\d+)\s*TO\s*(\d+)$/);
  if (range) {
    const start = parseInt(range[1], 10);
    const end = parseInt(range[2], 10);
    const step = start <= end ? 1 : -1;

    const list = [];
    for (let n = start; step > 0 ? n <= end : n >= end; n += step) {
      list.push({
        ...record,
        BUILDING_NO: n.toString()
      });
    }
    return list;
  }

  // Single number → return one record
  return [{
    ...record,
    BUILDING_NO: cleaned
  }];
}


// 2. Expand entire dataset
function explodeDataset(data) {
  const final = [];

  for (const row of data) {
    const exploded = explodeRecord(row);
    final.push(...exploded);
  }

  return final;
}


// 3. Fetch the JSON file and process it
async function run() {
  const url = "https://opensheet.elk.sh/10u3-PThnIy9cGqISt0vC2TOngcDH31PGmMpoIGzRd2Y/All";

  try {
    const data = await fetch(url).then(r => r.json());

    const expanded = explodeDataset(data);

    console.log("Expanded dataset:", expanded);
  } catch (err) {
    console.error("Error fetching or processing JSON:", err);
  }
}

run();
