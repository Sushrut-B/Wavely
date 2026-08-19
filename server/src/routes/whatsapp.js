import express from 'express';

const router = express.Router();

/**
 * Webhook for WhatsApp incoming messages
 */
router.post('/webhook', async (req, res) => {
  try {
    const { entry } = req.body;

    if (!entry) {
      return res.status(400).json({ error: 'Invalid webhook payload' });
    }

    // Process incoming WhatsApp messages
    for (const change of entry[0].changes) {
      if (change.field === 'messages') {
        const message = change.value.messages?.[0];
        const contact = change.value.contacts?.[0];

        console.log('Incoming message:', { message, contact });
        // TODO: Store message in database
        // TODO: Route to agent or chatbot
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Verify webhook
 */
router.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === process.env.WHATSAPP_WEBHOOK_TOKEN) {
      res.status(200).send(challenge);
    } else {
      res.status(403).send('Forbidden');
    }
  } else {
    res.status(400).send('Bad Request');
  }
});

/**
 * Send message
 */
router.post('/send', async (req, res) => {
  try {
    const { contactId, message } = req.body;
    // TODO: Send message via WhatsApp API
    res.json({ success: true, message: 'Message sent' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
