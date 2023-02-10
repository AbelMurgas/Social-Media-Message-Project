import express from "express";

import { getPosts, createPost, getPost } from "../controllers/feed.js";

import feedValidator from "../utils/validator.js";

const router = express.Router();

// GET /feed/posts
router.get("/posts", getPosts);

// POST /feed/post
router.post("/post", feedValidator, createPost);

router.get("/post/:postId", getPost);

export default router;
