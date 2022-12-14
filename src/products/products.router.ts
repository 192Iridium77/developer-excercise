var express = require("express");
var router = express.Router();
const uuid = require("uuid");

import { authenticateToken } from "../authMiddleware";
import db from "../db";

router.get("/", authenticateToken, async function (req, res, next) {
  const products = await db.select().from("products");

  return res.status(200).json(products);
});

router.post("/add", authenticateToken, async function (req, res, next) {
  const {
    user,
    body: { name, price },
  } = req;

  if (!name) return res.status(400).send("Product Name is required");
  if (!price) return res.status(400).send("Product Price is required");

  const matchedUsers = await db.select().where({ id: user.id }).from("users");
  const loggedInUser = matchedUsers.length === 1 ? matchedUsers[0] : undefined;

  if (!loggedInUser) return res.sendStatus(401);
  if (loggedInUser.role !== "admin") return res.send([loggedInUser]);

  try {
    await db("products").insert({ id: uuid.v4(), name, price });
    return res.sendStatus(201);
  } catch (err) {
    if (err.code === "23505") {
      return res.status(400).send(err.detail);
    }

    return res.status(500).send("Something went wrong :(");
  }
});

export default router;
