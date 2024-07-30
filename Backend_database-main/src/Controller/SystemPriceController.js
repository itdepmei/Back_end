const SystemPrice = require("../Model/SystemPrices.js");
const setPriceINUsd = async (req, res) => {
  try {
    console.log(req.body);
    const { typePrice } = req.body;

    if (!typePrice) {
      return res.status(400).json({
        message: "Please provide typePrice",
      });
    }
    const systemPrice = new SystemPrice({ typePrice });
    const response = await systemPrice.save();
    if(response){
    return res.status(200).json({ message: "PriceInUSD added", response });
    }
  } catch (err) {
    console.error("Error saving price:", err);
    res.status(500).json({ message: "An error occurred", error: err });
  }
};

const getDataSystemPrice = async (req, res) => {
  await SystemPrice.find()
    .then((response) => {
      res.status(200).json({
        response,
      });
    })
    .catch((err) => {
      res.status(404).json(err);
    });
};

const deleteByIdSystemPrice = async (req, res) => {
  const ministryId = req.params.id; // Corrected variable name to ministryId
  try {
    const response = await SystemPrice.findByIdAndDelete(ministryId); // Corrected to PriceInUSD and findByIdAndDelete usage
    if (!response) {
      return res.status(404).json({ message: "Ministry not found" }); // Corrected message to "Ministry not found"
    }
    res.status(200).json({ message: "Ministry deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "An error occurred while deleting the ministry",
      error: error,
    }); // Corrected message to "ministry"
  }
};
module.exports = { setPriceINUsd, getDataSystemPrice, deleteByIdSystemPrice }; // Added deleteById to the export
