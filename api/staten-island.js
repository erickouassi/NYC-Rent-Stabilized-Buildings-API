const { loadDataset } = require("./utils");

module.exports = async (req, res) => {
  const data = await loadDataset();
  const filtered = data.filter(r => r.borough.toUpperCase() === "STATEN ISLAND");
  res.status(200).json(filtered);
};
