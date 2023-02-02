import validator from "express-validator";
const { validationResult } = validator;

const getPosts = (req, res, next) => {
  res.status(200).json({
    posts: [
      {
        _id: "1",
        title: "First Post",
        creator: {
          name: "Abel Murgas",
        },
        createdAt: new Date(),
        content: "This is the first post!",
        imageUrl: "images/Yellow_Duck.jpg",
      },
    ],
  });
};

const createPost = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors.array())
    return res
      .status(422)
      .json({
        message: "Validation failed, enterred data is incorrect",
        errors: errors.array(),
      });
  }
  const title = req.body.title;
  const content = req.body.content;
  // Create post in db
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
};

const feedController = {
  createPost: createPost,
  getPosts: getPosts,
};

export default feedController;
