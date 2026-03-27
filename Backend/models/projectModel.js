// models/Project.js
const mongoose = require("mongoose");

const milestoneSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },

  description: {
    type: String
  },

  amount: {
    type: Number,
    required: true
  },

  dueDate: Date,

  status: {
    type: String,
    enum: ["pending", "in-progress", "submitted", "approved", "rejected"],
    default: "pending"
  },

  submissionFiles: [
    {
      type: String
    }
  ]
});


const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      required: true
    },

    category: {
      type: String,
    },

    skillsRequired: [
      {
        type: String
      }
    ],

    budget: {
      type: Number,
      required: true
    },

    budgetType: {
      type: String,
      enum: ["fixed", "hourly"],
      default: "fixed"
    },

    experienceLevel: {
      type: String,
      enum: ["entry", "intermediate", "expert"],
      default: "entry"
    },

    deadline: {
      type: Date
    },

    attachments: [
      {
        type: String
      }
    ],

    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    proposals: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Proposal"
      }
    ],

    selectedFreelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    contract: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Contract",
    },

    milestones: [milestoneSchema],

    totalProposals: {
      type: Number,
      default: 0
    },

    status: {
      type: String,
      enum: [
        "open",
        "proposal-selected",
        "in-progress",
        "submitted",
        "completed",
        "cancelled",
        "disputed"
      ],
      default: "open"
    },

    paymentStatus: {
      type: String,
      enum: [
        "unpaid",
        "escrow-funded",
        "partially-paid",
        "paid"
      ],
      default: "unpaid"
    },

    isReviewedByClient: {
      type: Boolean,
      default: false
    },

    isReviewedByFreelancer: {
      type: Boolean,
      default: false
    },

    startedAt: Date,

    completedAt: Date,

    tags: [
      {
        type: String
      }
    ],

    visibility: {
      type: String,
      enum: ["public", "private"],
      default: "public"
    }
  },

  { timestamps: true }
);

module.exports = mongoose.model("Project", projectSchema);