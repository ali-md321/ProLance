const Project    = require("../models/projectModel");
const Freelancer = require("../models/freelancerModel");
const Client     = require("../models/clientModel");
const catchAsync    = require("../middlewares/catchAsync");
const ErrorHandler  = require("../utils/errorhandler");

// ── helpers ──────────────────────────────────────────────────────────────────
const uid = (req) => req.userId.toString();

const assertParticipant = (project, req) => {
  const me = uid(req);
  const isC = project.client?._id?.toString() === me || project.client?.toString() === me;
  const isF = project.selectedFreelancer?._id?.toString() === me || project.selectedFreelancer?.toString() === me;
  if (!isC && !isF) throw new ErrorHandler("Not authorised to view this workspace", 403);
  return { isC, isF };
};

// ── GET workspace ─────────────────────────────────────────────────────────────
exports.getWorkspaceController = catchAsync(async (req, res) => {
  const project = await Project.findById(req.params.id)
    .populate("client",             "name avatar email companyName rating totalSpent")
    .populate("selectedFreelancer", "name avatar email skills hourlyRate rating totalEarnings")
    .populate("contract");

  if (!project) throw new ErrorHandler("Project not found", 404);
  assertParticipant(project, req);

  res.status(200).json({ success: true, project });
});

// ── ADD milestone (client) ────────────────────────────────────────────────────
exports.addMilestoneController = catchAsync(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) throw new ErrorHandler("Project not found", 404);
  if (project.client.toString() !== uid(req)) throw new ErrorHandler("Only the client can add milestones", 403);

  const { title, description, amount, dueDate } = req.body;
  if (!title || !amount) throw new ErrorHandler("Title and amount are required", 400);

  project.milestones.push({ title, description, amount, dueDate });
  await project.save();
  res.status(201).json({ success: true, message: "Milestone added", milestones: project.milestones });
});

// ── EDIT milestone (client, pending only) ────────────────────────────────────
exports.editMilestoneController = catchAsync(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) throw new ErrorHandler("Project not found", 404);
  if (project.client.toString() !== uid(req)) throw new ErrorHandler("Only the client can edit milestones", 403);

  const milestone = project.milestones.id(req.params.milestoneId);
  if (!milestone) throw new ErrorHandler("Milestone not found", 404);
  if (milestone.status !== "pending") throw new ErrorHandler("Can only edit pending milestones", 400);

  const { title, description, amount, dueDate } = req.body;
  if (title)       milestone.title       = title;
  if (description !== undefined) milestone.description = description;
  if (amount)      milestone.amount      = amount;
  if (dueDate)     milestone.dueDate     = dueDate;

  await project.save();
  res.status(200).json({ success: true, message: "Milestone updated", milestones: project.milestones });
});

// ── DELETE milestone (client, pending only) ───────────────────────────────────
exports.deleteMilestoneController = catchAsync(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) throw new ErrorHandler("Project not found", 404);
  if (project.client.toString() !== uid(req)) throw new ErrorHandler("Only the client can delete milestones", 403);

  const milestone = project.milestones.id(req.params.milestoneId);
  if (!milestone) throw new ErrorHandler("Milestone not found", 404);
  if (milestone.status !== "pending") throw new ErrorHandler("Can only delete pending milestones", 400);

  project.milestones.pull({ _id: req.params.milestoneId });
  await project.save();
  res.status(200).json({ success: true, message: "Milestone deleted", milestones: project.milestones });
});

// ── START milestone (freelancer) ──────────────────────────────────────────────
exports.startMilestoneController = catchAsync(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) throw new ErrorHandler("Project not found", 404);
  if (project.selectedFreelancer?.toString() !== uid(req)) throw new ErrorHandler("Only the assigned freelancer can start milestones", 403);

  const milestone = project.milestones.id(req.params.milestoneId);
  if (!milestone) throw new ErrorHandler("Milestone not found", 404);
  if (milestone.status !== "pending") throw new ErrorHandler("Only pending milestones can be started", 400);

  milestone.status = "in-progress";
  await project.save();
  res.status(200).json({ success: true, message: "Milestone started", milestones: project.milestones });
});

// ── SUBMIT milestone (freelancer) ─────────────────────────────────────────────
exports.submitMilestoneController = catchAsync(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) throw new ErrorHandler("Project not found", 404);
  if (project.selectedFreelancer?.toString() !== uid(req)) throw new ErrorHandler("Only the assigned freelancer can submit milestones", 403);

  const milestone = project.milestones.id(req.params.milestoneId);
  if (!milestone) throw new ErrorHandler("Milestone not found", 404);
  if (!["pending","in-progress","rejected"].includes(milestone.status)) throw new ErrorHandler("This milestone cannot be submitted right now", 400);

  const { submissionFiles, note } = req.body;
  milestone.status         = "submitted";
  milestone.submissionNote = note || "";
  if (Array.isArray(submissionFiles)) milestone.submissionFiles = submissionFiles;

  await project.save();
  res.status(200).json({ success: true, message: "Milestone submitted for review", milestones: project.milestones });
});

// ── APPROVE milestone (client) — FIX #1: NO auto-complete ────────────────────
exports.approveMilestoneController = catchAsync(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) throw new ErrorHandler("Project not found", 404);
  if (project.client.toString() !== uid(req)) throw new ErrorHandler("Only the client can approve milestones", 403);

  const milestone = project.milestones.id(req.params.milestoneId);
  if (!milestone) throw new ErrorHandler("Milestone not found", 404);
  if (milestone.status !== "submitted") throw new ErrorHandler("Only submitted milestones can be approved", 400);

  milestone.status = "approved";
  // ✅ FIX: Do NOT auto-complete project here. Client must explicitly mark complete.
  await project.save();

  const allApproved = project.milestones.every(m => m.status === "approved");

  res.status(200).json({
    success:      true,
    message:      allApproved
      ? "Milestone approved! All milestones are now approved — you can mark the project complete."
      : "Milestone approved",
    milestones:   project.milestones,
    allApproved,                       // flag for frontend to show "complete" prompt
    projectStatus: project.status,
  });
});

// ── REJECT milestone (client) ─────────────────────────────────────────────────
exports.rejectMilestoneController = catchAsync(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) throw new ErrorHandler("Project not found", 404);
  if (project.client.toString() !== uid(req)) throw new ErrorHandler("Only the client can reject milestones", 403);

  const milestone = project.milestones.id(req.params.milestoneId);
  if (!milestone) throw new ErrorHandler("Milestone not found", 404);
  if (milestone.status !== "submitted") throw new ErrorHandler("Only submitted milestones can be rejected", 400);

  milestone.status        = "rejected";
  milestone.rejectionNote = req.body.feedback || "";

  await project.save();
  res.status(200).json({ success: true, message: "Revision requested", milestones: project.milestones });
});

// ── COMPLETE project manually (client) ───────────────────────────────────────
exports.completeProjectController = catchAsync(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) throw new ErrorHandler("Project not found", 404);
  if (project.client.toString() !== uid(req)) throw new ErrorHandler("Only the client can complete the project", 403);
  if (project.status === "completed") throw new ErrorHandler("Project is already completed", 400);

  project.status      = "completed";
  project.completedAt = new Date();
  await project.save();

  res.status(200).json({ success: true, message: "Project marked as completed 🎉", project });
});

// ── STRIPE: create payment intent ────────────────────────────────────────────
exports.createPaymentIntentController = catchAsync(async (req, res) => {
  const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
  const project = await Project.findById(req.params.id).populate("selectedFreelancer", "name email");
  if (!project) throw new ErrorHandler("Project not found", 404);
  if (project.client.toString() !== uid(req)) throw new ErrorHandler("Only the client can initiate payment", 403);
  if (project.status !== "completed") throw new ErrorHandler("Project must be completed before payment", 400);
  if (project.paymentStatus === "paid") throw new ErrorHandler("Project is already paid", 400);

  // amount in paise (INR smallest unit)
  const amountPaise = Math.round(project.budget * 100);

  const paymentIntent = await stripe.paymentIntents.create({
    amount:   amountPaise,
    currency: "inr",
    metadata: {
      projectId:    project._id.toString(),
      clientId:     uid(req),
      freelancerId: project.selectedFreelancer._id.toString(),
    },
  });

  res.status(200).json({
    success:      true,
    clientSecret: paymentIntent.client_secret,
    amount:       project.budget,
    freelancer:   project.selectedFreelancer.name,
  });
});

// ── STRIPE: confirm payment (called after Stripe confirms) ────────────────────
exports.confirmPaymentController = catchAsync(async (req, res) => {
  const { paymentIntentId } = req.body;
  const stripe  = require("stripe")(process.env.STRIPE_SECRET_KEY);
  const project = await Project.findById(req.params.id);
  if (!project) throw new ErrorHandler("Project not found", 404);
  if (project.client.toString() !== uid(req)) throw new ErrorHandler("Not authorised", 403);

  // verify with Stripe
  const pi = await stripe.paymentIntents.retrieve(paymentIntentId);
  if (pi.status !== "succeeded") throw new ErrorHandler("Payment not confirmed by Stripe", 400);

  project.paymentStatus = "paid";
  await project.save();

  // update freelancer earnings
  await Freelancer.findByIdAndUpdate(project.selectedFreelancer, {
    $inc: { totalEarnings: project.budget },
  });

  // update client total spent
  await Client.findByIdAndUpdate(project.client, {
    $inc: { totalSpent: project.budget },
  });

  res.status(200).json({ success: true, message: "Payment confirmed! Freelancer has been paid.", project });
});

// ── REVIEW: client reviews freelancer ────────────────────────────────────────
exports.reviewFreelancerController = catchAsync(async (req, res) => {
  const { rating, comment } = req.body;
  if (!rating || rating < 1 || rating > 5) throw new ErrorHandler("Rating must be between 1 and 5", 400);

  const project = await Project.findById(req.params.id);
  if (!project) throw new ErrorHandler("Project not found", 404);
  if (project.client.toString() !== uid(req)) throw new ErrorHandler("Only the client can review", 403);
  if (project.status !== "completed") throw new ErrorHandler("Project must be completed to review", 400);
  if (project.isReviewedByClient) throw new ErrorHandler("You have already reviewed this project", 400);

  // save review on project
  project.clientReview = { rating: Number(rating), comment: comment || "", createdAt: new Date() };
  project.isReviewedByClient = true;
  await project.save();

  // update freelancer's average rating
  const freelancer = await Freelancer.findById(project.selectedFreelancer);
  if (freelancer) {
    // get all completed projects with client review for this freelancer
    const reviewed = await Project.find({
      selectedFreelancer: freelancer._id,
      isReviewedByClient: true,
    });
    const avg = reviewed.reduce((s, p) => s + (p.clientReview?.rating || 0), 0) / reviewed.length;
    freelancer.rating = Math.round(avg * 10) / 10;
    await freelancer.save();
  }

  res.status(200).json({ success: true, message: "Review submitted!", review: project.clientReview });
});

// ── REVIEW: freelancer reviews client ────────────────────────────────────────
exports.reviewClientController = catchAsync(async (req, res) => {
  const { rating, comment } = req.body;
  if (!rating || rating < 1 || rating > 5) throw new ErrorHandler("Rating must be between 1 and 5", 400);

  const project = await Project.findById(req.params.id);
  if (!project) throw new ErrorHandler("Project not found", 404);
  if (project.selectedFreelancer?.toString() !== uid(req)) throw new ErrorHandler("Only the freelancer can review", 403);
  if (project.status !== "completed") throw new ErrorHandler("Project must be completed to review", 400);
  if (project.isReviewedByFreelancer) throw new ErrorHandler("You have already reviewed this project", 400);

  project.freelancerReview = { rating: Number(rating), comment: comment || "", createdAt: new Date() };
  project.isReviewedByFreelancer = true;
  await project.save();

  // update client's average rating
  const client = await Client.findById(project.client);
  if (client) {
    const reviewed = await Project.find({
      client: client._id,
      isReviewedByFreelancer: true,
    });
    const avg = reviewed.reduce((s, p) => s + (p.freelancerReview?.rating || 0), 0) / reviewed.length;
    client.rating = Math.round(avg * 10) / 10;
    await client.save();
  }

  res.status(200).json({ success: true, message: "Review submitted!", review: project.freelancerReview });
});

// ── GET freelancer dashboard stats ────────────────────────────────────────────
exports.getFreelancerStatsController = catchAsync(async (req, res) => {
  const freelancerId = uid(req);
  const freelancer = await Freelancer.findById(freelancerId);
  if (!freelancer) throw new ErrorHandler("Freelancer not found", 404);

  const now   = new Date();
  const mStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lEnd   = new Date(now.getFullYear(), now.getMonth(), 0);

  const [active, completed, allProposals, thisMonthProjects, lastMonthProjects] = await Promise.all([
    Project.find({ selectedFreelancer: freelancerId, status: "in-progress" }).countDocuments(),
    Project.find({ selectedFreelancer: freelancerId, status: "completed" }),
    require("../models/proposalModel").find({ freelancer: freelancerId }),
    Project.find({ selectedFreelancer: freelancerId, status: "completed", completedAt: { $gte: mStart } }),
    Project.find({ selectedFreelancer: freelancerId, status: "completed", completedAt: { $gte: lStart, $lte: lEnd } }),
  ]);

  const thisMonthEarnings  = thisMonthProjects.reduce((s, p) => s + (p.paymentStatus === "paid" ? p.budget : 0), 0);
  const lastMonthEarnings  = lastMonthProjects.reduce((s, p) => s + (p.paymentStatus === "paid" ? p.budget : 0), 0);
  const acceptedProposals  = allProposals.filter(p => p.status === "accepted").length;

  res.status(200).json({
    success: true,
    stats: {
      totalEarnings:     freelancer.totalEarnings || 0,
      activeProjects:    active,
      completedProjects: completed.length,
      totalProposals:    allProposals.length,
      acceptedProposals,
      thisMonthEarnings,
      lastMonthEarnings,
      escrowAmount:      0,
      pendingPayments:   0,
      rating:            freelancer.rating || 0,
    },
  });
});

// ── GET client dashboard stats ────────────────────────────────────────────────
exports.getClientStatsController = catchAsync(async (req, res) => {
  const clientId = uid(req);
  const client = await Client.findById(clientId);
  if (!client) throw new ErrorHandler("Client not found", 404);

  const [openProjects, inProgressProjects, completedProjects, totalProjects] = await Promise.all([
    Project.countDocuments({ client: clientId, status: "open" }),
    Project.countDocuments({ client: clientId, status: "in-progress" }),
    Project.countDocuments({ client: clientId, status: "completed" }),
    Project.countDocuments({ client: clientId }),
  ]);

  res.status(200).json({
    success: true,
    stats: {
      openProjects,
      inProgressProjects,
      completedProjects,
      totalProjects,
      totalSpent: client.totalSpent || 0,
      rating:     client.rating    || 0,
    },
  });
});