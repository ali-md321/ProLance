const Project = require("../models/projectModel");
const User = require("../models/userModel");
const Client = require("../models/clientModel");
const FreeLancer = require("../models/freelancerModel");
const Proposal = require("../models/proposalModel");
const Contract = require("../models/contractModel");
const catchAsync = require("../middlewares/catchAsync");
const ErrorHandler = require("../utils/errorhandler");


module.exports.createProjectController = catchAsync(async (req, res, next) => {

  const {
    title,
    description,
    skillsRequired,
    budget,
    experienceLevel,
    deadline
  } = req.body;

  if (!title || !description) {
    throw new ErrorHandler("Title and description required", 400);
  }
  if (skillsRequired && Array.isArray(skillsRequired)) {
    skillsRequired = skillsRequired.map(skill =>
        skill.trim().toLowerCase()
    );
  }
  const project = await Project.create({
    title,
    description,
    skillsRequired,
    budget,
    experienceLevel,
    deadline,
    client: req.userId
  });

  const client = await Client.findById(req.userId);
  client.postedProjects.push(project._id);
  await client.save();

  res.status(201).json({
    success: true,
    message: "Project created successfully",
    project
  });
});

module.exports.getMyProjectsController = catchAsync(async (req, res, next) => {

    const user = await User.findById(req.userId);
    let projects;

    if (user.role === "client") {
      projects = await Project.find({
        client: user._id
      }).sort({ createdAt: -1 });

    }

    else if (user.role === "freelancer") {
      projects = await Project.find({
        selectedFreelancer: user._id
      }).sort({ createdAt: -1 });

    }

    else {
      throw new ErrorHandler("Invalid user role", 400);
    }

    res.status(200).json({
      success: true,
      projects,
    });
  }
);

module.exports.getProjectDetailsController = catchAsync(async (req, res, next) => {

  const project = await Project.findById(req.params.id)
    .populate("client", "name avatar")
    .populate("selectedFreelancer", "name avatar");

  if (!project) {
    throw new ErrorHandler("Project not found", 404);
  }

  res.status(200).json({
    success: true,
    project,
  });

});

module.exports.deleteProjectController = catchAsync(async (req, res, next) => {

  const project = await Project.findById(req.params.id);

  if (!project) {
    throw new ErrorHandler("Project not found", 404);
  }
  // Only client who created can delete
  if (project.client.toString() !== req.userId.toString()) {
    throw new ErrorHandler("Not authorized to delete this project", 403);
  }

  await project.deleteOne();

  res.status(200).json({
    success: true,
    message: "Project deleted successfully",
  });

});

module.exports.editProjectController = catchAsync(async (req, res, next) => {
  const project = await Project.findById(req.params.id);
  if (!project) {
    throw new ErrorHandler("Project not found", 404);
  }
  if (project.client.toString() !== req.userId.toString()) {
    throw new ErrorHandler("Not authorized to edit this project", 403);
  }

  Object.assign(project, req.body);
  await project.save();
  res.status(200).json({
    success: true,
    message: "Project updated successfully",
    project
  });

});

module.exports.getProjectsByFiltersController = catchAsync(async (req, res, next) => {

    const { skill, minBudget, maxBudget, experience, deadline } = req.query;

    let filter = {
        status: "open",
        visibility: "public"
    };

    if (skill) {
        filter.skillsRequired = { $in: [skill] };
    }

    if (experience) {
        filter.experienceLevel = experience;
    }

    if (minBudget || maxBudget) {
        filter.budget = {};

        if (minBudget) filter.budget.$gte = minBudget;
        if (maxBudget) filter.budget.$lte = maxBudget;
    }
    if(deadline){
      filter.deadline = {$lte:new Date(deadline)};
    }
    const projects = await Project.find(filter)
        .populate("client","name avatar rating")
        .sort({ createdAt:-1 });

    res.status(200).json({
        success:true,
        projects
    });
});

module.exports.createProposalController = catchAsync(async (req, res, next) => {
  const { coverLetter, bidAmount, deliveryDays, projectId } = req.body;

  const project = await Project.findById(projectId);
  if (!project) {
    return next(new ErrorHandler("Project not found", 404));
  }

  const existing = await Proposal.findOne({
    project: projectId,
    freelancer: req.userId,
  });
  if (existing) {
    return next(new ErrorHandler("You already submitted proposal", 400));
  }

  const proposal = await Proposal.create({
    project: projectId,
    freelancer: req.userId,
    coverLetter,
    bidAmount,
    deliveryDays,
  });

  project.proposals.push(proposal._id);
  project.totalProposals += 1;
  await project.save();

  res.status(201).json({
    success: true,
    proposal,
  });
});

module.exports.getMyProposalsController = catchAsync(async(req,res)=>{

  const proposals = await Proposal.find({freelancer:req.userId})
  .populate("project","title budget deadline")
  .sort({createdAt:-1});

  res.status(200).json({
  success:true,
  proposals
  });

});

module.exports.getProjectProposalsController = catchAsync(async (req, res, next) => {
  const project = await Project.findById(req.params.projectId);

  if (!project) {
    return next(new ErrorHandler("Project not found", 404));
  }
  if (project.client.toString() !== req.userId.toString()) {
    return next(new ErrorHandler("Not authorized", 403));
  }

  const proposals = await Proposal.find({ project: project._id })
    .populate("freelancer", "name avatar rating");

  res.status(200).json({
    success: true,
    proposals,
  });
});

module.exports.acceptProposalController = catchAsync(async (req, res, next) => {
  const proposal = await Proposal.findById(req.params.id);

  if (!proposal) {
    return next(new ErrorHandler("Proposal not found", 404));
  }

  const project = await Project.findById(proposal.project);
  if (project.client.toString() !== req.userId.toString()) {
    return next(new ErrorHandler("Not authorized", 403));
  }

  proposal.status = "accepted";
  await proposal.save();
  // --- No need to reject other proposals..
  // await Proposal.updateMany(
  //   { project: project._id, _id: { $ne: proposal._id } },
  //   { status: "rejected" }
  // );

  const contract = await Contract.create({
    project: project._id,
    client: project.client,
    freelancer: proposal.freelancer,
    proposal: proposal._id,
    agreedAmount: proposal.bidAmount,
  });

  project.selectedFreelancer = proposal.freelancer;
  project.status = "in-progress";
  project.contract = contract._id;
  project.startedAt = new Date();
  await project.save();

  res.status(200).json({
    success: true,
    message: "Freelancer hired successfully",
  });
});

module.exports.rejectProposalController = catchAsync(async (req, res, next) => {
  const proposal = await Proposal.findById(req.params.id);

  proposal.status = "rejected";
  await proposal.save();

  res.status(200).json({
    success: true,
  });
});

module.exports.getAllClientProposalsController = catchAsync(async (req,res) => {
  const projects = await Project.find({ client: req.userId });

  const projectIds = projects.map((p) => p._id);
  const proposals = await Proposal.find({
    project: { $in: projectIds },
  })
    .populate("freelancer", "name avatar rating")
    .populate("project", "title budget status");

  res.status(200).json({
    success: true,
    proposals,
  });
})


module.exports.getFreelancerActiveProjects = catchAsync(async(req,res)=>{

    const projects = await Project.find({
        selectedFreelancer:req.user._id,
        status:"in-progress"
    });

    res.status(200).json({
        success:true,
        projects
    });

});

module.exports.getFreelancerCompletedProjects = catchAsync(async(req,res)=>{

    const projects = await Project.find({
        selectedFreelancer:req.user._id,
        status:"completed"
    });

    res.status(200).json({
        success:true,
        projects
    });

});


