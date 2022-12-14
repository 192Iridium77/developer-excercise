var express = require("express");
var router = express.Router();
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { authenticateToken } from "../authMiddleware";
import db from "../db";
import { omit } from "lodash";

router.post("/login", async function (req, res, next) {
  const {
    body: { username, password },
  } = req;

  if (!username) return res.status(401).send("Username is required");
  if (!password) return res.status(401).send("Password is required");

  const users = await db.select().where({ username }).from("users");

  const user = users.length === 1 ? users[0] : undefined;

  if (!user) return res.sendStatus(401);

  try {
    const correctPassword = await bcrypt.compare(password, user.password);

    if (correctPassword) {
      const accessToken = jwt.sign(
        omit(user, password),
        process.env.JWT_SECRET
      );

      return res.json({ accessToken, status: 200 });
    } else {
      return res.sendStatus(401);
    }
  } catch {
    return res.sendStatus(500);
  }
});

router.get("/", authenticateToken, function (req, res, next) {
  res.json({ status: 200 });
});

module.exports = router;
