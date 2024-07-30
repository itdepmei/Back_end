const exhibitionCompanyModel = require("../Model/ExhibitionCompaniesM.js");

const setExhibitionCompanyModel = async (req, res) => {
  const { exhibitionCompanyModel } = req.body;
  if (!exhibitionCompanyModel) {
    return res
      .status(400)
      .json({ message: "Please insert exhibitionCompanyModel" });
  }
  if (
    await exhibitionCompanyModel.findOne({
      exhibitionCompanyModel: exhibitionCompanyModel,
    })
  ) {
    return res.status(409).json({ message: "This ministry already exists" });
  }
  const newMinistry = new exhibitionCompanyModel({
    exhibitionCompanyModel,
  });
  try {
    const savedMinistry = await newMinistry.save();
    res
      .status(200)
      .json({ message: "exhibitionCompanyModel added", data: savedMinistry });
  } catch (err) {
    res.status(500).json({ message: "Error occurrence", error: err });
  }
};
const getExhibitionCompanyModel = async (req, res) => {
  await exhibitionCompanyModel
    .find()
    .then((response) => {
      // Corrected find usage
      res.status(200).json({
        response,
      });
    })
    .catch((err) => {
      res.status(404).json(err);
    });
};
const deleteById = async (req, res) => {
  const ministryId = req.params.id; // Corrected variable name to ministryId
  try {
    const response = await exhibitionCompanyModel.findByIdAndDelete(ministryId); // Corrected to exhibitionCompanyModel and findByIdAndDelete usage
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
module.exports = { setExhibitionCompanyModel, getExhibitionCompanyModel, deleteById }; // Added deleteById to the export
