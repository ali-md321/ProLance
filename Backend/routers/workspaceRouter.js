const express = require("express");
const { isAuthenticated } = require("../middlewares/isAuthenticated");
const {getWorkspaceController,addMilestoneController,editMilestoneController,deleteMilestoneController,startMilestoneController,submitMilestoneController,approveMilestoneController,rejectMilestoneController,completeProjectController,} = require("../controllers/workspaceController");

const router = express.Router();

// ── Workspace ────────────────────────────────────────────────────────────────
router.get( "/workspace/:id", isAuthenticated, getWorkspaceController );
router.post("/workspace/:id/milestones", isAuthenticated, addMilestoneController);
router.patch( "/workspace/:id/milestones/:milestoneId/edit", isAuthenticated, editMilestoneController );
router.delete("/workspace/:id/milestones/:milestoneId", isAuthenticated, deleteMilestoneController );
router.patch( "/workspace/:id/milestones/:milestoneId/start", isAuthenticated, startMilestoneController      );
router.patch( "/workspace/:id/milestones/:milestoneId/submit", isAuthenticated, submitMilestoneController );
router.patch( "/workspace/:id/milestones/:milestoneId/approve", isAuthenticated, approveMilestoneController);
router.patch( "/workspace/:id/milestones/:milestoneId/reject", isAuthenticated, rejectMilestoneController );
router.patch( "/workspace/:id/complete", isAuthenticated, completeProjectController );

module.exports = router;