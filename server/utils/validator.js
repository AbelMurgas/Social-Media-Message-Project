import validator from 'express-validator'
const { body } = validator

const feedValidator = [
  body("title")
    .trim()
    .isLength({ min: 5 }),
  body("content")
    .trim()
    .isLength({ min: 5 }),
];

export default feedValidator;
