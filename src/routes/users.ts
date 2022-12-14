var express = require("express");
var router = express.Router();
import { authenticateToken } from "../authMiddleware";
import db from "../db";

router.get("/", authenticateToken, async function (req, res, next) {
  const { user } = req;

  const matchedUsers = await db.select().where({ id: user.id }).from("users");
  const loggedInUser = matchedUsers.length === 1 ? matchedUsers[0] : undefined;

  if (!loggedInUser) return res.sendStatus(401);
  if (loggedInUser.role !== "admin") return res.send([loggedInUser]);

  const users = await db.select().from("users");

  return res.status(200).json(users);
});

module.exports = router;
