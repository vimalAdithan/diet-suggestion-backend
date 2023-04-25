import * as dotenv from "dotenv";
dotenv.config()
import express from "express";
import { MongoClient } from "mongodb";
import { auth } from "./middleware/auth.js";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const app = express();

const MONGO_URL = process.env.MONGO_URL
// const MONGO_URL = "mongodb://127.0.0.1";
const PORT = process.env.PORT;
const client = new MongoClient(MONGO_URL); // dial
// Top level await
await client.connect(); // call
console.log("Mongo is connected !!!  ");
app.use(cors({ origin: "*" }));

app.get("/", auth, async function (request, response) {
  try {
    response.send("🙋‍♂️, 🌏 🎊✨ddhhd");
  } catch (error) {
    response.status(404).send({ message: "invalid url" });
  }
});

async function generateHashedPassword(password) {
  const NO_OF_ROUNDS = 10;
  const salt = await bcrypt.genSalt(NO_OF_ROUNDS);
  const hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
}

app.post("/signup", express.json(), async function (request, response) {
  const { username, password } = request.body;
  const name = await client
    .db("loginpage")
    .collection("login")
    .findOne({ username: username });
  if (name) {
    response.status(400).send({ message: "username already exist" });
  } else {
    const hashedpassword = await generateHashedPassword(password);
    const result = await client
      .db("loginpage")
      .collection("login")
      .insertOne({ username: username, password: hashedpassword });
    response.send(name);
  }
});

app.post("/login", express.json(), async function (request, response) {
  const { username, password } = request.body;
  const name = await client
    .db("loginpage")
    .collection("login")
    .findOne({ username: username });
  if (!name) {
    response.status(400).send({ message: "invalid credentials" });
  } else {
    const storedpassword = await name.password;
    const isPasswordCheck = await bcrypt.compare(password, storedpassword);
    if (isPasswordCheck) {
      const token = jwt.sign({ id: name._id }, "thisismytoken");
      response.send({ message: "Successfully  login", token: token });
    } else {
      response.status(400).send({ message: "invalid credentials" });
    }
  }
});

app.listen(PORT, () => console.log(`The server started in: ${PORT} ✨✨`));