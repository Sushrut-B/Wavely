import { DataTypes } from 'sequelize';
import { sequelize } from '../index.js';

export const Organization = sequelize.define('Organization', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  whatsappBusinessAccountId: {
    type: DataTypes.STRING,
  },
  whatsappPhoneNumber: {
    type: DataTypes.STRING,
  },
  whatsappAccessToken: {
    type: DataTypes.TEXT,
  },
  razorpayKeyId: {
    type: DataTypes.STRING,
  },
  razorpayKeySecret: {
    type: DataTypes.TEXT,
  },
  subscriptionPlan: {
    type: DataTypes.ENUM('free', 'starter', 'professional', 'enterprise'),
    defaultValue: 'free',
  },
  subscriptionStatus: {
    type: DataTypes.ENUM('active', 'inactive', 'paused'),
    defaultValue: 'active',
  },
  messageLimit: {
    type: DataTypes.INTEGER,
    defaultValue: 1000, // Monthly limit
  },
  messageCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  timestamps: true,
  tableName: 'organizations',
});

export default Organization;
