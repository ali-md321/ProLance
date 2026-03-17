const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');

const options = { discriminatorKey: "role", timestamps: true };

const BaseUserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    role:{
      type: String,
      enum: ["Client", "Freelancer"],
      required: true,
      default: "Client"
    },
    avatar: {
      type: String,
      default: ""
    },
    bio: {
      type: String,
      default: ""
    },
    isVerified: {
      type: Boolean,
      default: false
    }
  },
  options
);

// Hash password
BaseUserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 10);
});

// Compare password
BaseUserSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password);
};


BaseUserSchema.methods.generateToken = function() {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    });
}


const User = mongoose.model("User", BaseUserSchema);

module.exports = User;