const User = require("../models/userModel");
const Client = require("../models/clientModel");
const Freelancer = require("../models/freelancerModel");
const catchAsync = require("../middlewares/catchAsync");
const ErrorHandler = require("../utils/errorhandler");
const { sendCookie, deleteCookie } = require("../utils/cookieManage");

module.exports.signupController = catchAsync(async (req, res) => {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      throw new ErrorHandler("All fields are required", 400)
    }
    if (password.length < 8) {
      throw new ErrorHandler("Password must be at least 8 characters",400)
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        throw new ErrorHandler("Invalid email format",400)
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new ErrorHandler("Email already Exists",400)
    }

    let newUser;
    if (role === "client") {
      newUser = await Client.create({
        name,
        email,
        password,
        role,
      });
    } else if (role === "freelancer") {
      newUser = await Freelancer.create({
        name,
        email,
        password,
        role,
      });
    } else {
        throw new ErrorHandler("Invalid role!",400)
    }

    sendCookie(newUser, 201, res);
});

module.exports.loginController = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ErrorHandler("Email and password are required", 400);
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ErrorHandler("Invalid email format", 400);
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new ErrorHandler("Invalid email!", 400);
  }

  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    throw new ErrorHandler("Invalid password", 400);
  }

  sendCookie(user, 200, res);
});

module.exports.logoutController = catchAsync(async(req, res) => {
    deleteCookie(200,res);
})

module.exports.getUserDetailsController = catchAsync(async(req,res) => {
    let {id} = req.params;
    let user,posts;
    if(id == "me"){
        id = req.userId;
    }
    user = await User.findById(id); 
    res.status(200).json({
      userDetails : user, 
    });
})

module.exports.editUserController = catchAsync(async(req,res) => {
  const userId = req.userId;
  const {
    name,
    bio,
    avatar,
    skills,
    experience,
    hourlyRate,
    companyName,
    website,
    portfolioLinks
  } = req.body;
  console.log("req:",req.body);
  const user = await User.findById(userId);

  if (!user) {
    throw new ErrorHandler("User not found", 404);
  }
  if (name && name.length > 60) {
    throw new ErrorHandler("Name too long", 400);
  }
  if (bio && bio.length > 500) {
    throw new ErrorHandler("Bio must be under 500 characters", 400);
  }

  if (name) user.name = name;
  if (bio) user.bio = bio;
  if (avatar) user.avatar = avatar;

  if (user.role === "client") {
    const client = await Client.findById(userId);
    if (companyName !== undefined) {
      client.companyName = companyName;
    }
    if (website !== undefined) {
      client.website = website;
    }
    await client.save();
  }

  if (user.role === "freelancer") {
    const freelancer = await Freelancer.findById(userId);
    if (skills && Array.isArray(skills)) {
      freelancer.skills = skills.map(skill =>
        skill.trim().toLowerCase()
      );
    }
    if (experience !== undefined) {
      freelancer.experience = Number(experience);
    }
    if (hourlyRate !== undefined) {
      freelancer.hourlyRate = Number(hourlyRate);
    }
    if (portfolioLinks && Array.isArray(portfolioLinks)) {
      freelancer.portfolioLinks = portfolioLinks.map(link => ({
        platform: link.platform?.trim(),
        url: link.url?.trim()
      }));
    }
    await freelancer.save();
  }

  await user.save();
  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    user
  });
})
