import validator from "express-validator";

import Post from "../models/post.js";

import file from "../utils/file.js";
const { validationResult } = validator;

export const getPosts = (req, res, next) => {
  Post.find()
    .select("-__v")
    .then((result) => {
      if (!result) {
        error = new Error("Posts no found");
        error.statusCode = 404;
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
  console.log(req.file);
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
      console.log(err);
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
      result.imageUrl = result.imageUrl.replace(/images\\/g, "");
      console.log(result);
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

export const updatePost = (req, res, next) => {
  const postId = req.params.postId;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed, enterred data is incorrect");
    error.statusCode = 422;
    throw error;
  }
  const title = req.body.title;
  const content = req.body.content;
  let imageUrl;
  Post.findById(postId)
    .then((post) => {
      if (!post) {
        error = new Error("Posts no found");
        error.statusCode = 404;
        throw error;
      }
      if (!req.file) {
        imageUrl = post.imageUrl;
      } else {
        file.clearImage(post.imageUrl);
        imageUrl = req.file.path;
      }
      post.title = title;
      post.imageUrl = imageUrl;
      post.content = content;
      return post.save();
    })
    .then((result) => {
      res.status(200).json({ message: "Post updated!", post: result });
    })
    .catch((error) => {
      file.clearImage(req.file.path);
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      next(error);
    });
};

export const deletePost = (req, res, next) => {
  const postId = req.params.postId;
  console.log(postId);
  Post.findById(postId)
    .then((result) => {
      console.log(result);
      if (!result) {
        const error = new Error("Post not found");
        error.statusCode = 404;
        throw error;
      }
      Post.findByIdAndDelete(result)
        .then((postDeleted) => {
          file.clearImage(postDeleted.imageUrl);
          res.status(200).json({message: "Successfully deleted"})
        })
        .catch((err) => {
          throw err;
        });
    })
    .catch((error) => {
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      next(error);
    });
};
