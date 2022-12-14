var express = require("express");
var router = express.Router();
const uuid = require("uuid");

import { authenticateToken } from "../authMiddleware";
import db from "../db";

router.get("/", authenticateToken, async function (req, res, next) {
  const produce = await db.select().from("produce");

  return res.status(200).json(produce);
});

router.post("/create", authenticateToken, async function (req, res, next) {
  const {
    user,
    body: { name, price },
  } = req;

  if (!name) return res.status(400).send("Produce Name is required");
  if (!price) return res.status(400).send("Produce Price is required");

  const matchedUsers = await db.select().where({ id: user.id }).from("users");
  const loggedInUser = matchedUsers.length === 1 ? matchedUsers[0] : undefined;

  if (!loggedInUser) return res.sendStatus(401);
  if (loggedInUser.role !== "admin") return res.send([loggedInUser]);

  await db("produce").insert({ id: uuid.v4(), name, price });

  return res.sendStatus(201);
});

module.exports = router;
