import express from "express";
import bodyParser from "body-parser";

import feedRoutes from "./routes/feed.js";

import mongoose from "mongoose";

import path from "path";
import { fileURLToPath } from "url";

import multer from "multer";

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

const app = express();

import { v4 } from "uuid";

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "images");
  },
  filename: function(req, file, cb) {
    const type = file.mimetype.split("/")[1] 
    const fileName = v4() + "." +  type
    cb(null, fileName);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);

  } else {
    cb(null, false)
  }
};
// app.use(bodyParser.urlencoded()); // x-www-form-urlencoded <form>
app.use(bodyParser.json()); // application/json
app.use(multer({storage: storage, fileFilter: fileFilter}).single('image'))
app.use("/images", express.static(path.join(__dirname, "images")));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use("/feed", feedRoutes);

/*
app.use((error, req, res, next) => {
  const status = error.statusCode || 500;
  const message = error.message;
  res.status(status).json({ message: message });
});
*/

mongoose.set("strictQuery", true);
mongoose
  .connect(
    "mongodb+srv://abelm:WdKcauno0pwCtEfw@cluster0.ssc1tcl.mongodb.net/messages?retryWrites=true&w=majority"
  )
  .then((result) => {
    app.listen(8000);
  })
  .catch((err) => console.log(err));
