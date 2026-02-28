const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

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
BaseUserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password
BaseUserSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

const User = mongoose.model("User", BaseUserSchema);

module.exports = User;