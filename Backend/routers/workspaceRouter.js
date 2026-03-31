const express = require("express");
const { isAuthenticated } = require("../middlewares/isAuthenticated");
const {
  getWorkspaceController,
  addMilestoneController,
  editMilestoneController,
  deleteMilestoneController,
  startMilestoneController,
  submitMilestoneController,
  approveMilestoneController,
  rejectMilestoneController,
  completeProjectController,
  createPaymentIntentController,
  confirmPaymentController,
  reviewFreelancerController,
  reviewClientController,
  getFreelancerStatsController,
  getClientStatsController,
} = require("../controllers/workspaceController");

const router = express.Router();

// ── Workspace ────────────────────────────────────────────────────────────────
router.get(   "/workspace/:id",                              isAuthenticated, getWorkspaceController       );
router.post(  "/workspace/:id/milestones",                   isAuthenticated, addMilestoneController        );
router.patch( "/workspace/:id/milestones/:milestoneId/edit", isAuthenticated, editMilestoneController       );
router.delete("/workspace/:id/milestones/:milestoneId",      isAuthenticated, deleteMilestoneController     );
router.patch( "/workspace/:id/milestones/:milestoneId/start",    isAuthenticated, startMilestoneController  );
router.patch( "/workspace/:id/milestones/:milestoneId/submit",   isAuthenticated, submitMilestoneController );
router.patch( "/workspace/:id/milestones/:milestoneId/approve",  isAuthenticated, approveMilestoneController);
router.patch( "/workspace/:id/milestones/:milestoneId/reject",   isAuthenticated, rejectMilestoneController );
router.patch( "/workspace/:id/complete",                     isAuthenticated, completeProjectController     );

// ── Payment ──────────────────────────────────────────────────────────────────
router.post(  "/workspace/:id/payment/intent",   isAuthenticated, createPaymentIntentController );
router.post(  "/workspace/:id/payment/confirm",  isAuthenticated, confirmPaymentController      );

// ── Reviews ──────────────────────────────────────────────────────────────────
router.post(  "/workspace/:id/review/freelancer", isAuthenticated, reviewFreelancerController );
router.post(  "/workspace/:id/review/client",     isAuthenticated, reviewClientController     );

// ── Stats ────────────────────────────────────────────────────────────────────
router.get( "/stats/freelancer", isAuthenticated, getFreelancerStatsController );
router.get( "/stats/client",     isAuthenticated, getClientStatsController     );

module.exports = router;