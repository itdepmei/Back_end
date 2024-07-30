const MessagingCompanyModel = require("../Model/CprrispodingOfCompany.js");
const express = require("express");

const setMessagingCompanyModel = async (req, res) => {
  const { MessagingCompanyModel } = req.body;
  if (!MessagingCompanyModel) {
    return res
      .status(400)
      .json({ message: "Please insert MessagingCompanyModel" });
  }
  if (
    await MessagingCompanyModel.findOne({
      MessagingCompanyModel: MessagingCompanyModel,
    })
  ) {
    return res.status(409).json({ message: "This ministry already exists" });
  }
  const newMinistry = new MessagingCompanyModel({
    MessagingCompanyModel,
  });
  try {
    const savedMinistry = await newMinistry.save();
    res
      .status(200)
      .json({ message: "MessagingCompanyModel added", data: savedMinistry });
  } catch (err) {
    res.status(500).json({ message: "Error occurrence", error: err });
  }
};
const getMessagingCompanyModel = async (req, res) => {
  await MessagingCompanyModel
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
    const response = await MessagingCompanyModel.findByIdAndDelete(ministryId); // Corrected to MessagingCompanyModel and findByIdAndDelete usage
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
module.exports = { setMessagingCompanyModel, getMessagingCompanyModel, deleteById }; // Added deleteById to the export
