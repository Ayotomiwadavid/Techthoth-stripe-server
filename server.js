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
app.post("/create-checkout-session", async (req, res) => {
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

    // Return the session ID along with the URL
    res.json({ url: session.url, sessionId: session.id });
  } catch (error) {
    console.error("Error during subscription process:", error.message);
    res.status(500).json({ error: error.message });
  }
});

//===============================//
//=====CHECK PAYMENT STATUS=====//
//=============================//
app.post("/check-payment-status", async (req, res) => {
  try {
    const { stripeSecretKey, sessionId } = req.body;

    const stripe = require('stripe')(stripeSecretKey);
    
    // Retrieve the session by ID
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // Respond with the payment status
    res.json({ payment_status: session.payment_status });
  } catch (error) {
    console.error("Error checking payment status:", error.message);
    res.status(500).json({ error: error.message });
  }
});


// Start the server
const PORT = 5001;
app.listen(PORT, () => {
  console.log(`App is listening on port ${PORT}`);
});