import express from 'express';
import { cacheSet, cacheGet, cacheDel } from '../utils/redis.js';
import { v4 as uuid } from 'uuid';

const router = express.Router();

/**
 * Send OTP
 */
router.post('/send', async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    
    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000);
    
    // Store OTP in Redis with 10 minute expiry
    const otpId = uuid();
    await cacheSet(`otp:${phoneNumber}`, {
      otp,
      otpId,
      createdAt: new Date(),
      attempts: 0,
    }, 600);
    
    // TODO: Send OTP via WhatsApp
    
    res.json({
      success: true,
      message: 'OTP sent',
      otpId,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Verify OTP
 */
router.post('/verify', async (req, res) => {
  try {
    const { phoneNumber, otp } = req.body;
    
    const otpData = await cacheGet(`otp:${phoneNumber}`);
    
    if (!otpData) {
      return res.status(400).json({ error: 'OTP expired' });
    }
    
    if (otpData.attempts >= 3) {
      return res.status(400).json({ error: 'Too many attempts' });
    }
    
    if (parseInt(otp) !== otpData.otp) {
      otpData.attempts += 1;
      await cacheSet(`otp:${phoneNumber}`, otpData, 600);
      return res.status(400).json({ error: 'Invalid OTP' });
    }
    
    // OTP verified, clear from cache
    await cacheDel(`otp:${phoneNumber}`);
    
    res.json({
      success: true,
      message: 'OTP verified',
      token: uuid(),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
