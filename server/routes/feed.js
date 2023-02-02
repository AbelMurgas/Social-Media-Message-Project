import express from "express";

import feedController from "../controllers/feed.js";

import feedValidator from "../utils/validator.js";

const router = express.Router();

// GET /feed/posts
router.get('/posts', feedController.getPosts);

// POST /feed/post
router.post('/post', feedValidator,feedController.createPost);

export default router;