const WorkNatural =require("../Model/WorKntural.js");
const setWorkNatural = async (req, res) => {
  const { workNaturalData } = req.body;
  if (!workNaturalData) {
    return res.status(400).json({ message: "Please insert WorkNatural data" });
  }
  if (await WorkNatural.findOne({ workNaturalData })) {
    return res.status(409).json({ message: "This WorkNatural data already exists" });
  }
  const newWorkNatural = new WorkNatural({
    workNaturalData,
  });
  try {
    const savedWorkNatural = await newWorkNatural.save();
    res.status(200).json({ message: "WorkNatural added successfully", data: savedWorkNatural });
  } catch (err) {
    res.status(500).json({ message: "An error occurred", error: err });
  }
};
const getData = async (req, res) => {
  console.log("hr;e;lwef");
  try {
    const response = await WorkNatural.find();
    return res.status(200).json({ data: response });
  } catch (error) {
    return res.status(404).json({ message: "Data not found", error: error });
  }
};
const deleteById = async (req, res) => {
  const projectId = req.params.id;
  try {
    const response = await WorkNatural.findByIdAndDelete(projectId);
    if (!response) {
      return res.status(404).json({ message: "WorkNatural data not found" });
    }
    res.status(200).json({ message: "WorkNatural data deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "An error occurred while deleting the WorkNatural data",
        error: error,
      });
  }
};

module.exports= { setWorkNatural, getData ,deleteById};
