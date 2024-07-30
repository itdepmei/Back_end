const Notes = require("../Model/Notes.js");
const setNotes = async (req, res) => {
  const { comments, userId, projectId } = req.body.data;
  const systemNotes = new Notes({
    comments,
    userId,
    projectId,
  });
  try {
    const response = await systemNotes.save();
    res.status(200).json({ message: "Notes added", response });
  } catch (err) {
    res.status(500).json({ message: "Error occurrence", error: err });
  }
};
const getDataNotes = async (req, res) => {
  await Notes.find()
    .then((response) => {
      res.status(200).json({
        response,
      });
    })
    .catch((err) => {
      res.status(404).json(err);
    });
};

const deleteByIdNotes = async (req, res) => {
  const commentsId = req.params.id;
  try {
    const response = await Notes.findByIdAndDelete(commentsId);
    if (!response) {
      return res.status(404).json({ message: "Ministry not found" });
    }
    res.status(200).json({ message: "Ministry deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "An error occurred while deleting the ministry",
      error: error,
    });
  }
};
module.exports = { setNotes, getDataNotes, deleteByIdNotes };
