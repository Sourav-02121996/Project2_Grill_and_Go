import { Router } from "express";
import Stripe from "stripe";

const router = Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Create Stripe Checkout Session
router.post("/create-checkout-session", async (req, res) => {
  try {
    const { items } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    // Transform cart items to Stripe line items
    const lineItems = items.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.name,
          description: item.description || "",
        },
        unit_amount: Math.round(item.price * 100), // Convert to cents
      },
      quantity: item.quantity || 1,
    }));

    // Add tax and delivery fee as separate line items
    const subtotal = items.reduce(
      (sum, item) => sum + item.price * (item.quantity || 1),
      0,
    );
    const tax = subtotal * 0.08; // 8% tax
    const deliveryFee = 2.99;

    lineItems.push({
      price_data: {
        currency: "usd",
        product_data: {
          name: "Tax (8%)",
        },
        unit_amount: Math.round(tax * 100),
      },
      quantity: 1,
    });

    lineItems.push({
      price_data: {
        currency: "usd",
        product_data: {
          name: "Delivery Fee",
        },
        unit_amount: Math.round(deliveryFee * 100),
      },
      quantity: 1,
    });

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${req.headers.origin}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/cart.html`,
    });

    res.json({ id: session.id, url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Verify payment session
router.get("/verify-session/:sessionId", async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(
      req.params.sessionId,
    );
    res.json({ session });
  } catch (error) {
    console.error("Session verification error:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
