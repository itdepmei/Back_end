const express = require("express");
const Ministries = require("../Model/Minsitires.js");

const setMinistries = async (req, res) => {
  const { ministries } = req.body;
  if (!ministries) {
    return res.status(400).json({ message: "Please insert ministries" });
  }
  if (await Ministries.findOne({ ministries: ministries })) {
    return res.status(409).json({ message: "This ministry already exists" });
  }
  const newMinistry = new Ministries({
    ministries,
  });
  try {
    const savedMinistry = await newMinistry.save();
    res.status(200).json({ message: "Ministries added", data: savedMinistry });
  } catch (err) {
    res.status(500).json({ message: "Error occurrence", error: err });
  }
};
const getData = async (req, res) => {
  await Ministries.find()
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
    const response = await Ministries.findByIdAndDelete(ministryId); // Corrected to Ministries and findByIdAndDelete usage
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
module.exports = { setMinistries, getData, deleteById }; // Added deleteById to the export
