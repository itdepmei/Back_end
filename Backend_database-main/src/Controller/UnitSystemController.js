const UnitSystem = require("../Model/UnitSystem.js");
const setUnit = async (req, res) => {
  const { Unit } = req.body.data;
  try {
    const existingPrice = await UnitSystem.findOne({ Unit });
    if (existingPrice) {
      return res.status(409).json({ message: "This unit already exists" });
    }
    const newUnit = new UnitSystem({ Unit });
    await newUnit.save();

    res.status(200).json({ message: "Unit added successfully", unit: newUnit });
  } catch (err) {
    res.status(500).json({ message: "Error occurred", error: err.message });
  }
};
const getDataSystemUnit = async (req, res) => {
  try {
    const response = await UnitSystem.find();
    res.status(200).json({ response });
  } catch (err) {
    res.status(500).json({ message: "Error occurred", error: err.message });
  }
};
const deleteByIdSystemUnit = async (req, res) => {
  const unitId = req.params.id;

  try {
    const deletedUnit = await UnitSystem.findByIdAndDelete(unitId);
    if (!deletedUnit) {
      return res.status(404).json({ message: "Unit not found" });
    }
    res.status(200).json({ message: "Unit deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error occurred", error: error.message });
  }
};
module.exports = { setUnit, getDataSystemUnit, deleteByIdSystemUnit };
