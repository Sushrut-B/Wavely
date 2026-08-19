import express from 'express';

const router = express.Router();

/**
 * Get all agents
 */
router.get('/', async (req, res) => {
  try {
    res.json({ agents: [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Create agent
 */
router.post('/', async (req, res) => {
  try {
    const { name, email } = req.body;
    res.status(201).json({ success: true, message: 'Agent created' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get agent by ID
 */
router.get('/:id', async (req, res) => {
  try {
    res.json({ agent: {} });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Update agent
 */
router.put('/:id', async (req, res) => {
  try {
    res.json({ success: true, message: 'Agent updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Delete agent
 */
router.delete('/:id', async (req, res) => {
  try {
    res.json({ success: true, message: 'Agent deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
