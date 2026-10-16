const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 150 },
    content: { type: String, required: true, trim: true },
    author: { type: String, default: 'Admin' },
    likes: { type: Number, default: 0 },
    // uids of the users who liked the post, so one user can only like it once
    likedBy: { type: [String], default: [], select: false },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Blog || mongoose.model('Blog', blogSchema);
