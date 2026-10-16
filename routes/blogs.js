const express = require('express');
const mongoose = require('mongoose');
const Blog = require('../models/Blog');
const { withDB } = require('../config/db');
const { optionalAuth, requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Shape of a blog sent to the frontend. `liked` tells if the current user liked it.
function format(blog, uid) {
  const b = blog.toObject ? blog.toObject() : blog;
  return {
    _id: b._id,
    title: b.title,
    content: b.content,
    author: b.author,
    likes: b.likes,
    liked: uid && b.likedBy ? b.likedBy.includes(uid) : false,
    createdAt: b.createdAt,
    updatedAt: b.updatedAt,
  };
}

function validate(body) {
  const title = (body.title || '').trim();
  const content = (body.content || '').trim();
  if (!title) return 'Title is required';
  if (title.length > 150) return 'Title must be 150 characters or less';
  if (!content) return 'Content is required';
  return null;
}

function checkId(req, res, next) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(404).json({ message: 'Blog not found' });
  }
  next();
}

// GET all blogs (public)
router.get('/', optionalAuth, withDB, async (req, res) => {
  try {
    const blogs = await Blog.find({}).select('+likedBy').sort({ createdAt: -1 });
    res.json(blogs.map((b) => format(b, req.user && req.user.uid)));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET one blog (public)
router.get('/:id', checkId, optionalAuth, withDB, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).select('+likedBy');
    if (!blog) return res.status(404).json({ message: 'Blog not found' });
    res.json(format(blog, req.user && req.user.uid));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Like / unlike (any logged in user)
router.patch('/:id/like', checkId, requireAuth, withDB, async (req, res) => {
  try {
    const uid = req.user.uid;
    const blog = await Blog.findById(req.params.id).select('+likedBy');
    if (!blog) return res.status(404).json({ message: 'Blog not found' });

    if (blog.likedBy.includes(uid)) {
      blog.likedBy.pull(uid);
    } else {
      blog.likedBy.push(uid);
    }
    blog.likes = blog.likedBy.length;
    await blog.save();

    res.json(format(blog, uid));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create (admin only)
router.post('/', requireAdmin, withDB, async (req, res) => {
  const error = validate(req.body);
  if (error) return res.status(400).json({ message: error });

  try {
    const blog = await Blog.create({
      title: req.body.title,
      content: req.body.content,
      author: req.user.name || req.user.email,
    });
    res.status(201).json(format(blog));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update (admin only)
router.put('/:id', checkId, requireAdmin, withDB, async (req, res) => {
  const error = validate(req.body);
  if (error) return res.status(400).json({ message: error });

  try {
    const blog = await Blog.findByIdAndUpdate(
      req.params.id,
      { title: req.body.title, content: req.body.content },
      { new: true, runValidators: true }
    );
    if (!blog) return res.status(404).json({ message: 'Blog not found' });
    res.json(format(blog));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete (admin only)
router.delete('/:id', checkId, requireAdmin, withDB, async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Blog not found' });
    res.json({ message: 'Blog deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
