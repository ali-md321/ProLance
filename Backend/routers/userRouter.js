const express = require("express");
const { isAuthenticated } = require("../middlewares/isAuthenticated");
const { signupController, loginController, logoutController, getUserDetailsController, editUserController } = require("../controllers/userController");
const router = express.Router();

router.post("/signup", signupController);
router.post("/login", loginController)

router.get("/user/:id", isAuthenticated, getUserDetailsController)
router.patch("/user/me", isAuthenticated, editUserController)

router.get("/logout", isAuthenticated,logoutController);

module.exports = router;