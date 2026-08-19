import Razorpay from 'razorpay';

export class RazorpayService {
  constructor(keyId, keySecret) {
    this.razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
  }

  /**
   * Create an order for subscription payment
   */
  async createOrder(amount, currency = 'INR', description = '') {
    try {
      const order = await this.razorpay.orders.create({
        amount: amount * 100, // Razorpay expects amount in paise
        currency,
        description,
        receipt: `receipt_${Date.now()}`,
      });
      return order;
    } catch (error) {
      console.error('Razorpay create order error:', error.message);
      throw error;
    }
  }

  /**
   * Verify payment
   */
  async verifyPayment(orderId, paymentId, signature) {
    try {
      const crypto = require('crypto');
      const hmac = crypto.createHmac('sha256', this.razorpay.key_secret);
      hmac.update(orderId + '|' + paymentId);
      const calculatedSignature = hmac.digest('hex');

      return calculatedSignature === signature;
    } catch (error) {
      console.error('Razorpay verify payment error:', error.message);
      throw error;
    }
  }

  /**
   * Get payment details
   */
  async getPayment(paymentId) {
    try {
      const payment = await this.razorpay.payments.fetch(paymentId);
      return payment;
    } catch (error) {
      console.error('Razorpay get payment error:', error.message);
      throw error;
    }
  }

  /**
   * Get order details
   */
  async getOrder(orderId) {
    try {
      const order = await this.razorpay.orders.fetch(orderId);
      return order;
    } catch (error) {
      console.error('Razorpay get order error:', error.message);
      throw error;
    }
  }

  /**
   * Create subscription plan
   */
  async createPlan(planName, amount, interval, period) {
    try {
      const plan = await this.razorpay.plans.create({
        period: period, // 'monthly', 'quarterly', 'yearly'
        interval: interval, // 1, 2, 3, 4, 6, 12
        amount: amount * 100, // in paise
        currency: 'INR',
        description: planName,
      });
      return plan;
    } catch (error) {
      console.error('Razorpay create plan error:', error.message);
      throw error;
    }
  }

  /**
   * Create customer subscription
   */
  async createSubscription(planId, customerId, quantity = 1) {
    try {
      const subscription = await this.razorpay.subscriptions.create({
        plan_id: planId,
        customer_notify: 1,
        quantity,
      });
      return subscription;
    } catch (error) {
      console.error('Razorpay create subscription error:', error.message);
      throw error;
    }
  }
}

export default RazorpayService;
