const express = require("express");
const { getContractByProjectController, getMyContractsController } = require("../controllers/contractController");
const { isAuthenticated } = require("../middlewares/isAuthenticated");
const router = express.Router();

router.get("/project/:projectId", isAuthenticated, getContractByProjectController);
router.get("/my", isAuthenticated, getMyContractsController);

module.exports = router;