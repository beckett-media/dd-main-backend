const mongoose = require("mongoose");
const { stringConstants } = require("../utils/constants");

const pendingDeletionSchema = new mongoose.Schema(
  {
    deletionType: {
      type: String,
      required: true,
      enum: [
        stringConstants.deletionType.USER,
        stringConstants.deletionType.FILE,
        stringConstants.deletionType.CARD,
        stringConstants.deletionType.DIR,
      ],
    },
    data: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const PendingDeletion = mongoose.model(
  stringConstants.collectionNames.PENDING_DELETION,
  pendingDeletionSchema
);

module.exports.PendingDeletion = PendingDeletion;
