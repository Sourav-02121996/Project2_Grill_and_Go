import { Router } from "express";
import { getDb } from "../db/mongoClient.js";

const router = Router();

// Get all orders
router.get("/", async (_req, res, next) => {
  try {
    const db = await getDb();
    const orders = await db
      .collection("Orders")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    res.json({ success: true, orders });
  } catch (error) {
    next(error);
  }
});

// Get single order
router.get("/:orderId", async (req, res, next) => {
  try {
    const db = await getDb();
    const { ObjectId } = await import("mongodb");
    const order = await db
      .collection("Orders")
      .findOne({ _id: new ObjectId(req.params.orderId) });
    if (!order) {
      res.status(404).json({ success: false, message: "Order not found." });
      return;
    }
    res.json({ success: true, order });
  } catch (error) {
    next(error);
  }
});

// Create new order
router.post("/", async (req, res, next) => {
  try {
    const { items, customerInfo, paymentInfo, totals } = req.body;

    const db = await getDb();
    const orderId = "ORD-" + Date.now();

    const order = {
      orderId,
      items,
      customerInfo,
      paymentInfo,
      totals,
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.collection("Orders").insertOne(order);
    res.json({ success: true, order });
  } catch (error) {
    next(error);
  }
});

// Update order status
router.patch("/:orderId", async (req, res, next) => {
  try {
    const { status } = req.body;
    const db = await getDb();
    const { ObjectId } = await import("mongodb");

    const result = await db.collection("Orders").updateOne(
      { _id: new ObjectId(req.params.orderId) },
      {
        $set: {
          status,
        },
      },
    );

    if (result.matchedCount === 0) {
      res.status(404).json({ success: false, message: "Order not found." });
      return;
    }

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

export default router;
