import validator from "express-validator";

import Post from "../models/post.js";
import User from "../models/user.js";

import file from "../utils/file.js";
const { validationResult } = validator;

export const getPosts = (req, res, next) => {
  const currentPage = req.query.page || 1;
  const perPage = 2;
  let totalItems;
  Post.find()
    .countDocuments()
    .then((count) => {
      totalItems = count;
      return Post.find()
        .skip((currentPage - 1) * perPage)
        .limit(perPage)
        .populate("creator");
    })
    .then((result) => {
      if (!result) {
        error = new Error("Posts no found");
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json({
        posts: result,
        totalItems: totalItems,
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
  if (!req.file) {
    const error = new Error("No image provided.");
    error.statusCode = 422;
    throw error;
  }
  const imageUrl = req.file.path.replace("\\", "/");
  const title = req.body.title;
  const content = req.body.content;
  let creator;
  let post;
  User.findById(req.userId)
    .then((user) => {
      creator = user;
      post = new Post({
        title: title,
        content: content,
        imageUrl: imageUrl,
        creator: creator._id,
      });
      return post.save();
    })
    .then((result) => {
      creator.posts.push(post._id);
      return creator.save();
    })
    .then((result) => {
      res.status(201).json({
        message: "Post created successfully!",
        post: {
          _id: new Date().toISOString(),
          title: title,
          content: content,
          creator: { _id: creator._id, name: creator.name },
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
        const error = new Error("Posts no found");
        error.statusCode = 404;
        throw error;
      }
      if (post.creator.toString() !== req.userId) {
        const error = new Error("Not authorized");
        error.statusCode = 403;
        throw error;
      }
      console.log(req.file);
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
      try {
        file.clearImage(req.file.path);
      } catch {
        console.log("File no found");
      }
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      next(error);
    });
};

export const deletePost = (req, res, next) => {
  const postId = req.params.postId;
  let post;
  Post.findById(postId)
    .then((result) => {
      if (!result) {
        const error = new Error("Post not found");
        error.statusCode = 404;
        throw error;
      }
      if (result.creator.toString() !== req.userId) {
        const error = new Error("Not authorized");
        error.statusCode = 403;
        throw error;
      }
      post = result;
      return User.findById(post.creator);
    })
    .then((user) => {
      user.posts.pull(postId);
      // const index = user.posts.indexOf(post._id);
      // if (index > -1) {
      //   user.posts.splice(index, 1);
      // }
      return user.save();
    })
    .then((result) => {
      return Post.findByIdAndDelete(post);
    })
    .then((postDeleted) => {
      file.clearImage(postDeleted.imageUrl);
      res.status(200).json({ message: "Successfully deleted" });
    })
    .catch((error) => {
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      next(error);
    });
};
