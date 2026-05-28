import config from './env.js';

class MockOrders {
  async create(options) {
    // Mimics the exact response format returned by Razorpay orders.create API
    const orderId = `order_${Math.random().toString(36).substring(2, 15)}`;
    return {
      id: orderId,
      entity: 'order',
      amount: options.amount,
      amount_paid: 0,
      amount_due: options.amount,
      currency: options.currency || 'INR',
      receipt: options.receipt || '',
      status: 'created',
      attempts: 0,
      notes: options.notes || {},
      created_at: Math.floor(Date.now() / 1000),
    };
  }
}

class MockRazorpay {
  constructor(options) {
    this.key_id = options.key_id;
    this.key_secret = options.key_secret;
    this.orders = new MockOrders();
  }
}

// Instantiate and export the Mock client to ensure local offline robustness
const razorpayInstance = new MockRazorpay({
  key_id: config.razorpay.keyId,
  key_secret: config.razorpay.keySecret,
});

export default razorpayInstance;
