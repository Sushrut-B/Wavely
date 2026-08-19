import { DataTypes } from 'sequelize';
import { sequelize } from '../index.js';

export const Campaign = sequelize.define('Campaign', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  organizationId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
  templateId: {
    type: DataTypes.STRING,
  },
  templateName: {
    type: DataTypes.STRING,
  },
  campaignType: {
    type: DataTypes.ENUM('automation', 'broadcast', 'drip', 'scheduled'),
    defaultValue: 'broadcast',
  },
  status: {
    type: DataTypes.ENUM('draft', 'active', 'paused', 'completed', 'failed'),
    defaultValue: 'draft',
  },
  scheduledAt: {
    type: DataTypes.DATE,
  },
  contactSegmentIds: {
    type: DataTypes.ARRAY(DataTypes.UUID),
    defaultValue: [],
  },
  variables: {
    type: DataTypes.JSON,
    defaultValue: {},
  },
  totalContacts: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  messagesSent: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  messagesDelivered: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  messagesRead: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  messagesFailed: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  createdBy: {
    type: DataTypes.UUID,
  },
}, {
  timestamps: true,
  tableName: 'campaigns',
});

export default Campaign;
