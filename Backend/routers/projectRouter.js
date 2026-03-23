const express = require("express");
const { isAuthenticated } = require("../middlewares/isAuthenticated");
const { createProjectController, getMyProjectsController, deleteProjectController, getProjectDetailsController, editProjectController, getProjectsByFiltersController, getMyProposalsController, getFreelancerActiveProjects, getFreelancerCompletedProjects, createProposalController, getProjectProposalsController, acceptProposalController, rejectProposalController, getAllClientProposalsController } = require("../controllers/projectController");
const router = express.Router();

router.post("/projects/create", isAuthenticated, createProjectController);
router.get("/projects", isAuthenticated, getMyProjectsController)
router.route("/projects/:id")
    .get(isAuthenticated, getProjectDetailsController)
    .delete(isAuthenticated, deleteProjectController)
router.patch("/edit-project/:id",isAuthenticated,editProjectController);

router.get("/browse-projects", isAuthenticated, getProjectsByFiltersController);

router.post("/proposals/create", isAuthenticated, createProposalController);
router.get("/proposals/project/:projectId", isAuthenticated, getProjectProposalsController);
// router.get("/proposals/:id", isAuthenticated, getMyProposals);
router.get("/proposals/all", isAuthenticated, getAllClientProposalsController);
router.patch("/proposals/accept/:id", isAuthenticated, acceptProposalController);
router.patch("/proposals/reject/:id", isAuthenticated, rejectProposalController);

router.get("/freelancer/my-proposals", isAuthenticated, getMyProposalsController);
router.get("/freelancer/projects/active", isAuthenticated, getFreelancerActiveProjects);
router.get("/freelancer/projects/completed", isAuthenticated, getFreelancerCompletedProjects);

module.exports = router;