import express from "express";
import bodyParser from "body-parser";
import config from "./config.js";
import { v4 } from "uuid";
import graphqlSchema from "./graphql/schema.js"
import graphqlResolver from "./graphql/resolvers.js"
import mongoose from "mongoose";
import multer from "multer";
import { graphqlHTTP } from "express-graphql";


const app = express();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "images");
  },
  filename: function (req, file, cb) {
    const type = file.mimetype.split("/")[1];
    const fileName = v4() + "." + type;
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
    cb(null, false);
  }
};
// app.use(bodyParser.urlencoded()); // x-www-form-urlencoded <form>
app.use(bodyParser.json()); // application/json
app.use(multer({ storage: storage, fileFilter: fileFilter }).single("image"));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use("/graphql", graphqlHTTP({
  schema: graphqlSchema,
  rootValue: graphqlResolver,
  graphiql: true
}))

app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message: message, data: data });
});

mongoose.set("strictQuery", true);
mongoose
  .connect(
    `mongodb+srv://${config.MONGO_USER}:${config.MONGO_PASSWORD}@cluster0.ssc1tcl.mongodb.net/${config.MONGO_DEFAULT_DATABASE}?retryWrites=true&w=majority`
  )
  .then((result) => {
    app.listen(config.PORT, () => {
      console.log('Server started on port ' + config.PORT);
    });
  })
  .catch((err) => console.log(err));
