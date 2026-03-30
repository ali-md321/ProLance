const Project  = require("../models/projectModel");
const catchAsync   = require("../middlewares/catchAsync");
const ErrorHandler = require("../utils/errorhandler");

// ── GET full workspace data for a project ──────────────────────────────────
module.exports.getWorkspaceController = catchAsync(async (req, res) => {
  const project = await Project.findById(req.params.id)
    .populate("client",             "name avatar email")
    .populate("selectedFreelancer", "name avatar email skills hourlyRate")
    .populate("contract");

  if (!project) throw new ErrorHandler("Project not found", 404);

  // only client or assigned freelancer may view workspace
  const uid = req.userId.toString();
  const isClient     = project.client?._id?.toString()             === uid;
  const isFreelancer = project.selectedFreelancer?._id?.toString() === uid;

  if (!isClient && !isFreelancer) {
    throw new ErrorHandler("Not authorised to view this workspace", 403);
  }

  res.status(200).json({ success: true, project });
});

// ── CLIENT: add a milestone ─────────────────────────────────────────────────
module.exports.addMilestoneController = catchAsync(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) throw new ErrorHandler("Project not found", 404);

  if (project.client.toString() !== req.userId.toString()) {
    throw new ErrorHandler("Only the client can add milestones", 403);
  }

  const { title, description, amount, dueDate } = req.body;
  if (!title || !amount) throw new ErrorHandler("Title and amount are required", 400);

  project.milestones.push({ title, description, amount, dueDate });
  await project.save();

  res.status(201).json({
    success:  true,
    message:  "Milestone added",
    milestones: project.milestones,
  });
});

// ── CLIENT: edit a milestone (only if still pending) ────────────────────────
module.exports.editMilestoneController = catchAsync(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) throw new ErrorHandler("Project not found", 404);

  if (project.client.toString() !== req.userId.toString()) {
    throw new ErrorHandler("Only the client can edit milestones", 403);
  }

  const milestone = project.milestones.id(req.params.milestoneId);
  if (!milestone) throw new ErrorHandler("Milestone not found", 404);

  if (!["pending"].includes(milestone.status)) {
    throw new ErrorHandler("Can only edit pending milestones", 400);
  }

  const { title, description, amount, dueDate } = req.body;
  if (title)       milestone.title       = title;
  if (description) milestone.description = description;
  if (amount)      milestone.amount      = amount;
  if (dueDate)     milestone.dueDate     = dueDate;

  await project.save();
  res.status(200).json({ success: true, message: "Milestone updated", milestones: project.milestones });
});

// ── CLIENT: delete a milestone (only if pending) ─────────────────────────
module.exports.deleteMilestoneController = catchAsync(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) throw new ErrorHandler("Project not found", 404);

  if (project.client.toString() !== req.userId.toString()) {
    throw new ErrorHandler("Only the client can delete milestones", 403);
  }

  const milestone = project.milestones.id(req.params.milestoneId);
  if (!milestone) throw new ErrorHandler("Milestone not found", 404);

  if (milestone.status !== "pending") {
    throw new ErrorHandler("Can only delete pending milestones", 400);
  }

  project.milestones.pull({ _id: req.params.milestoneId });
  await project.save();

  res.status(200).json({ success: true, message: "Milestone deleted", milestones: project.milestones });
});

// ── FREELANCER: start a milestone (pending → in-progress) ──────────────────
module.exports.startMilestoneController = catchAsync(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) throw new ErrorHandler("Project not found", 404);

  if (project.selectedFreelancer?.toString() !== req.userId.toString()) {
    throw new ErrorHandler("Only the assigned freelancer can start milestones", 403);
  }

  const milestone = project.milestones.id(req.params.milestoneId);
  if (!milestone) throw new ErrorHandler("Milestone not found", 404);

  if (milestone.status !== "pending") {
    throw new ErrorHandler("Only pending milestones can be started", 400);
  }

  milestone.status = "in-progress";
  await project.save();

  res.status(200).json({ success: true, message: "Milestone started", milestones: project.milestones });
});

// ── FREELANCER: submit milestone work ──────────────────────────────────────
module.exports.submitMilestoneController = catchAsync(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) throw new ErrorHandler("Project not found", 404);

  if (project.selectedFreelancer?.toString() !== req.userId.toString()) {
    throw new ErrorHandler("Only the assigned freelancer can submit milestones", 403);
  }

  const milestone = project.milestones.id(req.params.milestoneId);
  if (!milestone) throw new ErrorHandler("Milestone not found", 404);

  if (!["pending", "in-progress", "rejected"].includes(milestone.status)) {
    throw new ErrorHandler("This milestone cannot be submitted right now", 400);
  }

  const { submissionFiles, note } = req.body;

  milestone.status          = "submitted";
  milestone.submissionNote  = note || "";
  if (submissionFiles && Array.isArray(submissionFiles)) {
    milestone.submissionFiles = submissionFiles;
  }

  await project.save();
  res.status(200).json({ success: true, message: "Milestone submitted for review", milestones: project.milestones });
});

// ── CLIENT: approve a milestone submission ──────────────────────────────────
module.exports.approveMilestoneController = catchAsync(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) throw new ErrorHandler("Project not found", 404);

  if (project.client.toString() !== req.userId.toString()) {
    throw new ErrorHandler("Only the client can approve milestones", 403);
  }

  const milestone = project.milestones.id(req.params.milestoneId);
  if (!milestone) throw new ErrorHandler("Milestone not found", 404);

  if (milestone.status !== "submitted") {
    throw new ErrorHandler("Only submitted milestones can be approved", 400);
  }

  milestone.status = "approved";

  // if all milestones approved → mark project completed
  const allApproved = project.milestones.every(m => m.status === "approved");
  if (allApproved) {
    project.status      = "completed";
    project.completedAt = new Date();
  }

  await project.save();
  res.status(200).json({
    success:    true,
    message:    allApproved ? "All milestones complete! Project marked completed." : "Milestone approved",
    milestones: project.milestones,
    projectStatus: project.status,
  });
});

// ── CLIENT: reject a milestone submission ───────────────────────────────────
module.exports.rejectMilestoneController = catchAsync(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) throw new ErrorHandler("Project not found", 404);

  if (project.client.toString() !== req.userId.toString()) {
    throw new ErrorHandler("Only the client can reject milestones", 403);
  }

  const milestone = project.milestones.id(req.params.milestoneId);
  if (!milestone) throw new ErrorHandler("Milestone not found", 404);

  if (milestone.status !== "submitted") {
    throw new ErrorHandler("Only submitted milestones can be rejected", 400);
  }

  const { feedback } = req.body;
  milestone.status         = "rejected";
  milestone.rejectionNote  = feedback || "";

  await project.save();
  res.status(200).json({ success: true, message: "Milestone rejected", milestones: project.milestones });
});

// ── CLIENT: mark entire project as completed manually ──────────────────────
module.exports.completeProjectController = catchAsync(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) throw new ErrorHandler("Project not found", 404);

  if (project.client.toString() !== req.userId.toString()) {
    throw new ErrorHandler("Only the client can complete the project", 403);
  }

  project.status      = "completed";
  project.completedAt = new Date();
  await project.save();

  res.status(200).json({ success: true, message: "Project marked as completed", project });
});