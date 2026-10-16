// Adds a few sample posts. Run once with: npm run seed
require('dotenv').config();
const mongoose = require('mongoose');
const Blog = require('../models/Blog');
const { connectDB } = require('../config/db');

const posts = [
  {
    title: 'Getting started with the MERN stack',
    content:
      'MERN stands for MongoDB, Express, React and Node. In this post I walk through how the four pieces talk to each other and how I structure a small project so it stays easy to change.',
  },
  {
    title: 'Why I added Firebase Authentication',
    content:
      'Writing my own login system means handling password hashing, reset emails and session security. Firebase handles all of that, so I only verify the ID token on my server and focus on the blog itself.',
  },
  {
    title: 'Deploying a React app and an Express API on Vercel',
    content:
      'Both projects can live on Vercel. The React app is a static build, while the Express app runs as a serverless function. The only extra care is reusing the MongoDB connection between requests.',
  },
];

(async () => {
  await connectDB();
  if ((await Blog.countDocuments()) > 0) {
    console.log('Blogs already exist, nothing added.');
  } else {
    await Blog.insertMany(posts.map((p) => ({ ...p, author: 'Jacky Thomas' })));
    console.log(`Added ${posts.length} sample blogs.`);
  }
  await mongoose.disconnect();
})().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
