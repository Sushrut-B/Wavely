import { DataTypes } from 'sequelize';
import { sequelize } from '../index.js';

export const Message = sequelize.define('Message', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  organizationId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  contactId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  whatsappMessageId: {
    type: DataTypes.STRING,
  },
  messageType: {
    type: DataTypes.ENUM('text', 'image', 'video', 'document', 'audio', 'location', 'template'),
    defaultValue: 'text',
  },
  content: {
    type: DataTypes.TEXT,
  },
  direction: {
    type: DataTypes.ENUM('inbound', 'outbound'),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('sent', 'delivered', 'read', 'failed', 'pending'),
    defaultValue: 'pending',
  },
  senderType: {
    type: DataTypes.ENUM('agent', 'bot', 'system'),
    defaultValue: 'bot',
  },
  agentId: {
    type: DataTypes.UUID,
  },
  campaignId: {
    type: DataTypes.UUID,
  },
  broadcastId: {
    type: DataTypes.UUID,
  },
  metadata: {
    type: DataTypes.JSON,
    defaultValue: {},
  },
}, {
  timestamps: true,
  tableName: 'messages',
  indexes: [
    { fields: ['organizationId', 'contactId'] },
    { fields: ['campaignId'] },
  ],
});

export default Message;
