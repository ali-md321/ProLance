const Contract = require("../models/contractModel");
const catchAsync = require("../middlewares/catchAsync");

// Get contract by project
exports.getContractByProjectController = catchAsync(async (req, res) => {
  const { projectId } = req.params;

  const contract = await Contract.findOne({ project: projectId })
    .populate("client")
    .populate("freelancer")
    .populate("proposal");

  res.status(200).json({
    success: true,
    contract,
  });
});

// Get contracts for logged-in user
exports.getMyContractsController = catchAsync(async (req, res) => {
  const userId = req.user._id;

  const contracts = await Contract.find({
    $or: [{ client: userId }, { freelancer: userId }],
  })
    .populate("project")
    .populate("client")
    .populate("freelancer");

  res.status(200).json({
    success: true,
    contracts,
  });
});