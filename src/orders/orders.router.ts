var express = require("express");
var router = express.Router();
const uuid = require("uuid");

import { authenticateToken } from "../authMiddleware";
import db from "../db";
import { OrderProduct } from "./order.model";

import {
  validateItemsAndTransform,
  calculatePriceWithSpecials,
} from "./orders.helpers";

router.get("/", authenticateToken, async function (req, res) {
  const { user } = req;

  if (user.role !== "admin") {
    const orders = await db("orders").where({ userId: user.id }).select();
    return res.status(200).json(orders);
  }

  const orders = await db("orders").select();

  return res.status(200).json(orders);
});

router.get("/:id/products", authenticateToken, async function (req, res) {
  const {
    user,
    params: { id },
  } = req;

  if (!id) return res.sendStatus(400).send("Id is required");

  if (user.role !== "admin") {
    const myOrder = await db("orders").where({ userId: user.id, id }).first();
    if (!myOrder) return res.sendStatus(403);
  }

  const orderProducts = await db("orderProducts").where(
    "orderProducts.orderId",
    id
  );

  return res.status(200).json(orderProducts);
});

router.post("/", authenticateToken, async function (req, res) {
  const {
    user,
    body: { items },
  } = req;

  if (!items?.length) return res.status(400).send("Items are required");

  const products = await db("products").select();

  const { valid, invalid } = validateItemsAndTransform(items, products);

  if (invalid.length)
    return res
      .status(400)
      .json({ invalid, message: "Some Items entered are invalid" });

  try {
    const orderId = uuid.v4();
    await db("orders").insert({
      id: orderId,
      userId: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    // move to helpers as transformProductToOrderProduct
    const order = valid.map(({ id, name, price }) => ({
      id: uuid.v4(),
      productId: id,
      productName: name,
      productPrice: price,
      orderId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    await db.batchInsert("orderProducts", order, 30);

    return res.sendStatus(201);
  } catch (err) {
    return res.status(500).send(err.message);
  }
});

router.post("/:id/process", authenticateToken, async function (req, res) {
  const {
    params: { id },
  } = req;

  if (!id) return res.status(400).send("Id is required");

  const orderProducts: OrderProduct[] = await db("orderProducts")
    .where({ orderId: id })
    .select();

  const threeForTwo = await db("specials")
    .where({ id: "threeForTwo" })
    .select()
    .first();
  const secondForHalf = await db("specials")
    .where({ id: "secondForHalf" })
    .select()
    .first();

  const price = calculatePriceWithSpecials(
    orderProducts,
    threeForTwo,
    secondForHalf
  );

  return res.status(200).json(price);
});

export default router;
