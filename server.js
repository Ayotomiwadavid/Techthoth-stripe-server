const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();

// Logging and body parsing middleware
app.use(morgan("dev"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(cors());

// Setting up the home route
app.post("/", async (req, res) => {
  try {
    const {
      stripeSecretKey,
      productPrice,
      productName,
      mode,
      paymentMethod,
      successUrl,
      cancelUrl,
      quantity,
      currency,
    } = req.body;

    // Initialize Stripe with the provided secret key
    const stripe = require('stripe')(stripeSecretKey);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: [paymentMethod],
      mode: mode,
      line_items: [
        {
          price_data: {
            currency: currency,
            product_data: {
              name: productName,
            },
            unit_amount: productPrice,
          },
          quantity: quantity,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error("Error during subscription process:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// Start the server
const PORT = 5001;
app.listen(PORT, () => {
  console.log(`App is listening on port ${PORT}`);
});