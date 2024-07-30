const PricedTechnical = require("../Model/DataFileUploadPricedTechnicalTaple.js");
const setPricedTechnical = async (req, res) => {
  const { departmentId, projectId } = req.body;
  const filePricedTechnical = req.file.filename;
  const PricedTechnicalfile = new PricedTechnical({
    departmentId,
    projectId,
    file: filePricedTechnical,
  });
  try {
    const savedPricedTechnical = await PricedTechnicalfile.save();
    res.status(200).json({
      message: "PricedTechnical added successfully",
      data: savedPricedTechnical,
    });
  } catch (err) {
    console.log(error);
    res.status(500).json({ message: "An error occurred", error: err });
  }
};
const setPdfDataOverPrice = async (req, res) => {
  console.log(req.body);
  try {
  } catch (err) {
    console.log(error);
    res.status(500).json({ message: "An error occurred", error: err });
  }
};

module.exports = { setPricedTechnical, setPdfDataOverPrice };
