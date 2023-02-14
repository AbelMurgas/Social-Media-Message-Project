import express from "express";

import { getPosts, createPost, getPost, updatePost, deletePost } from "../controllers/feed.js";

import feedValidator from "../utils/validator.js";

const router = express.Router();

// GET /feed/posts
router.get("/posts", getPosts);

// POST /feed/post
router.post("/post", feedValidator, createPost);

router.get("/post/:postId", getPost);

router.put("/post/:postId", feedValidator, updatePost);

router.delete("/post/:postId", deletePost)

export default router;
