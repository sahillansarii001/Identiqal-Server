import billingService from '../services/billingService.js';

export const startCheckout = async (req, res) => {
  try {
    const { tier } = req.body;
    const session = await billingService.createCheckoutSession(req.user.id, tier);
    return res.status(200).json({
      success: true,
      message: 'Checkout session created successfully',
      data: session,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const handleWebhook = async (req, res) => {
  try {
    const signature = req.headers['x-payment-signature'];
    const result = await billingService.handlePaymentWebhook(req.body, signature);
    return res.status(200).json({
      success: true,
      message: 'Webhook processed successfully',
      data: result,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

// HTML checkout page simulation
export const getMockCheckoutPortal = async (req, res) => {
  const { sessionId, userId, tier } = req.query;
  res.send(`
    <html>
      <head>
        <title>Mock Payment Portal</title>
        <style>
          body { font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; background-color: #f8f9fa; }
          .card { background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); text-align: center; }
          button { background: #007bff; color: white; border: none; padding: 0.75rem 1.5rem; font-size: 1rem; border-radius: 4px; cursor: pointer; margin-top: 1rem; }
          button:hover { background: #0056b3; }
        </style>
      </head>
      <body>
        <div class="card">
          <h2>Mock Payment Portal</h2>
          <p>Session ID: <strong>${sessionId}</strong></p>
          <p>Upgrading User ID: <strong>${userId}</strong></p>
          <p>Plan Selected: <strong>${tier}</strong></p>
          <form action="/api/billing/webhook" method="POST" id="payForm">
            <input type="hidden" name="userId" value="${userId}" />
            <input type="hidden" name="tier" value="${tier}" />
            <input type="hidden" name="sessionId" value="${sessionId}" />
            <button type="button" onclick="submitPayment()">Simulate Successful Payment</button>
          </form>
        </div>
        <script>
          function submitPayment() {
            const form = document.getElementById('payForm');
            fetch('/api/billing/webhook', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'X-Payment-Signature': 'mock-valid-signature'
              },
              body: JSON.stringify({
                userId: '${userId}',
                tier: '${tier}',
                sessionId: '${sessionId}'
              })
            })
            .then(res => res.json())
            .then(data => {
              alert('Payment Successful! Status updated. Close this tab.');
              window.close();
            })
            .catch(err => alert('Webhook payment simulation failed: ' + err.message));
          }
        </script>
      </body>
    </html>
  `);
};
