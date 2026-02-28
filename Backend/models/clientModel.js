const mongoose = require("mongoose");
const User = require("./userModel");

const ClientSchema = new mongoose.Schema({
  companyName: {
    type: String,
    trim: true
  },
  website: {
    type: String,
    default: ""
  },
  postedProjects: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project"
    }
  ],
  totalSpent: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    default: 0
  }
});

const Client = User.discriminator("client", ClientSchema);

module.exports = Client;