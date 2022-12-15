var express = require("express");
var router = express.Router();
const uuid = require("uuid");

import { authenticateToken } from "../authMiddleware";
import db from "../db";
import { validateItemsAndTransform } from "../orders/orders.helpers";

router.get("/", authenticateToken, async function (req, res, next) {
  const specials = await db.select().from("specials");

  return res.status(200).json(specials);
});

router.post(
  "/three-for-two",
  authenticateToken,
  async function (req, res, next) {
    const {
      user,
      body: { items },
    } = req;

    if (!items?.length) return res.status(400).send("Items are required");

    if (items?.length > 3)
      return res.status(400).send("Must have less than 3 items");

    const matchedUsers = await db.select().where({ id: user.id }).from("users");
    const loggedInUser =
      matchedUsers.length === 1 ? matchedUsers[0] : undefined;

    if (!loggedInUser) return res.sendStatus(401);
    if (loggedInUser.role !== "admin") return res.sendStatus(403);

    const products = await db("products").select();

    const { valid, invalid } = validateItemsAndTransform(items, products);

    if (invalid.length)
      return res
        .status(400)
        .json({ invalid, message: "Some Items entered are invalid" });

    await db("specials")
      .where({ id: "threeForTwo" })
      .update({ productIds: valid.map((p) => p.id) });

    return res.sendStatus(201);
  }
);

router.post(
  "/second-for-half",
  authenticateToken,
  async function (req, res, next) {
    const {
      user,
      body: { item },
    } = req;

    if (!item) return res.status(400).send("An Item is required");

    const matchedUsers = await db.select().where({ id: user.id }).from("users");
    const loggedInUser =
      matchedUsers.length === 1 ? matchedUsers[0] : undefined;

    if (!loggedInUser) return res.sendStatus(401);
    if (loggedInUser.role !== "admin") return res.sendStatus(403);

    const products = await db("products").select();

    const { valid, invalid } = validateItemsAndTransform([item], products);

    if (invalid.length)
      return res
        .status(400)
        .json({ invalid, message: "The item entered is invalid" });

    await db("specials")
      .where({ id: "secondForHalf" })
      .update({ productIds: valid.map((p) => p.id) });

    return res.sendStatus(201);
  }
);

export default router;
