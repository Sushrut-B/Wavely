import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { sequelize } from './database/index.js';
import { initializeRedis } from './utils/redis.js';
import authRoutes from './routes/auth.js';
import whatsappRoutes from './routes/whatsapp.js';
import campaignRoutes from './routes/campaigns.js';
import agentRoutes from './routes/agents.js';
import broadcastRoutes from './routes/broadcast.js';
import otpRoutes from './routes/otp.js';
import contactRoutes from './routes/contacts.js';
import demo1Router from './routes/demo1.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/broadcast', broadcastRoutes);
app.use('/api/otp', otpRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/demo1', demo1Router);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`✓ Server running on port ${PORT}`);
  console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Initialize services async
(async () => {
  try {
    // Initialize Redis (non-critical)
    try {
      await initializeRedis();
    } catch (error) {
      console.warn('⚠️  Redis unavailable:', error.message);
    }

    // Database sync with timeout
    try {
      const syncPromise = sequelize.sync({ alter: false });
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Database sync timeout')), 3000)
      );
      
      await Promise.race([syncPromise, timeoutPromise]);
      console.log('✓ Database synchronized');

      // Seed default test accounts if users table is empty
      try {
        const { User, Organization } = await import('./database/models/index.js');
        const userCount = await User.count();
        if (userCount === 0) {
          console.log('🌱 Database is empty. Seeding default test accounts...');
          const bcrypt = await import('bcryptjs');
          const { v4: uuidv4 } = await import('uuid');

          const defaultOrg = await Organization.create({
            id: uuidv4(),
            name: 'Wavely Org',
          });

          const hashedAdminPassword = await bcrypt.default.hash('Admin@2024', 10);
          const hashedUserPassword = await bcrypt.default.hash('User@2024', 10);
          const hashedDemoPassword = await bcrypt.default.hash('Demo@2024', 10);

          await User.bulkCreate([
            {
              id: uuidv4(),
              organizationId: defaultOrg.id,
              name: 'Admin User',
              email: 'admin@whatsapp.com',
              password: hashedAdminPassword,
              role: 'admin',
              isActive: true,
            },
            {
              id: uuidv4(),
              organizationId: defaultOrg.id,
              name: 'Test User',
              email: 'user@whatsapp.com',
              password: hashedUserPassword,
              role: 'agent',
              isActive: true,
            },
            {
              id: uuidv4(),
              organizationId: defaultOrg.id,
              name: 'Demo Account',
              email: 'demo@whatsapp.com',
              password: hashedDemoPassword,
              role: 'agent',
              isActive: true,
            }
          ]);
          console.log('✓ Default test accounts seeded successfully!');
        }
      } catch (seedErr) {
        console.warn('⚠️  Could not seed default accounts:', seedErr.message);
      }
    } catch (error) {
      console.warn('⚠️  Database unavailable:', error.message);
      console.warn('   API running in degraded mode - set up PostgreSQL for full features');
    }
  } catch (error) {
    console.error('Initialization error:', error.message);
  }
})();

export default app;
