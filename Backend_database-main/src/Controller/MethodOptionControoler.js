const MethodOptionModel = require("../Model/MethodOptionM.js"); // Corrected the spelling of setMethodOption
const setMethodOption = async (req, res) => {
  const MethodOption = req.body.data;

  try {
    if (!MethodOption) {
      return res.status(400).json({ message: "Please insert MethodOption" });
    }
    if (await MethodOptionModel.findOne({ MethodOption })) {
      return res
        .status(409)
        .json({ message: "This MethodOption already exists" });
    }
    const methodOption = new MethodOptionModel({ MethodOption });
    const savedMethodOption = await methodOption.save();
    res.status(200).json({
      message: "Method Option added successfully",
      data: savedMethodOption,
    });
  } catch (err) {
    res.status(500).json({ message: "Error occurred", error: err.message });
  }
};

const getDataMethodOption = async (req, res) => {
  await MethodOptionModel.find()
    .then((response) => {
      res.status(200).json({
        response,
      });
    })
    .catch((err) => {
      res.status(404).json(err);
    });
};
const deleteMethodOptionById = async (req, res) => {
  const MethodOptionId = req.params.id;
  try {
    const response = await MethodOptionModel.findByIdAndDelete(MethodOptionId);
    if (!response) {
      return res.status(404).json({ message: "Ministry not found" });
    }
    res.status(200).json({ message: "Method option deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "An error occurred while deleting the ministry",
      error: error,
    });
  }
};
module.exports = { setMethodOption, getDataMethodOption, deleteMethodOptionById };
