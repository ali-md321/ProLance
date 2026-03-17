const mongoose = require("mongoose");
const User = require("./userModel");

const FreelancerSchema = new mongoose.Schema({
  skills: [
    {
      type: String,
      trim: true
    }
  ],
  experience: {
    type: Number, // in years
    default: 0
  },
  portfolioLinks: [
    {
        platform : {
            type: String,
        },
        url : {
            type : String,
        }
    }
  ],
  hourlyRate: {
    type: Number,
    default: 0
  },
  biddedProjects: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project"
    }
  ],
  assignedProjects: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project"
    }
  ],
  completedProjects: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project"
    }
  ],
  totalEarnings: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    default: 0
  }
});

const Freelancer = User.discriminator("freelancer", FreelancerSchema);

module.exports = Freelancer;