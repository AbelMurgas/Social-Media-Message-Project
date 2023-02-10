import validator from "express-validator";

import Post from "../models/post.js";

const { validationResult } = validator;

export const getPosts = (req, res, next) => {
  Post.find()
    .select("-__v")
    .then((result) => {
      if (!result) {
        error = new Error("Posts no found");
        error.statusCode = 204;
        throw error;
      }
      res.status(200).json({
        posts: result,
      });
    })
    .catch((error) => {
      if (!error.status) {
        error.status = 500;
      }
      next(error);
    });
};

export const createPost = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed, enterred data is incorrect");
    error.statusCode = 422;
    throw error;
  }
  console.log(req.file)
  if (!req.file) {
    const error = new Error("No image provided.");
    error.statusCode = 422;
    throw error;
  }
  const imageUrl = req.file.path.replace("\\", "/");
  const title = req.body.title;
  const content = req.body.content;
  const post = new Post({
    title: title,
    content: content,
    imageUrl: imageUrl,
    creator: { name: "Abel Murgas" },
  });
  post
    .save()
    .then((result) => {
      res.status(201).json({
        message: "Post created successfully!",
        post: {
          _id: new Date().toISOString(),
          title: title,
          content: content,
          creator: { name: "Abel" },
          createdAt: new Date(),
        },
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
        
      }
      console.log(err)
      next(err);
    });
};

export const getPost = (req, res, next) => {
  const postId = req.params.postId;
  Post.findById(postId)
    .select("-__v")
    .then((result) => {
      if (!result) {
        const error = new Error("Post not found");
        error.statusCode = 204;
        throw error;
      }
      res.status(200).json({
        post: result,
      });
    })
    .catch((error) => {
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      next(error);
    });
};
