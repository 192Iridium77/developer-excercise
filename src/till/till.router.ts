var express = require("express");
var router = express.Router();

import { authenticateToken } from "../authMiddleware";
import db from "../db";

import {
  validateItemsAndTransform,
  calculatePriceWithSpecials,
} from "./till.helpers";

router.post("/scan", authenticateToken, async function (req, res, next) {
  const {
    body: { items },
  } = req;

  if (!items?.length) return res.status(400).send("Items are required");

  // if the products table grows,
  // it will become much better to query out the exact item prices
  const products = await db("products").select();

  const { valid, invalid } = validateItemsAndTransform(items, products);

  if (invalid.length)
    return res
      .status(400)
      .json({ invalid, message: "Some Items entered are invalid" });

  const threeForTwo = await db("specials")
    .where({ id: "threeForTwo" })
    .select()
    .first();
  const secondForHalf = await db("specials")
    .where({ id: "secondForHalf" })
    .select()
    .first();

  console.log(
    "🚀 ~ file: till.router.ts ~ line 37 ~ secondForHalf",
    secondForHalf
  );
  const price = calculatePriceWithSpecials(valid, threeForTwo, secondForHalf);

  return res.status(200).json({ price });
});

export default router;
