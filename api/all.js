// api/all.js — Full Flat JSON Dataset (Vercel Serverless Function)
const { loadDataset } = require("./utils");

module.exports = async (req, res) => {
  try {
    const data = await loadDataset();   // 🔥 Already validated + flattened
    res.status(200).json(data);
  } catch (err) {
    console.error("API /all error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
