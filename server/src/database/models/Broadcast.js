import { DataTypes } from 'sequelize';
import { sequelize } from '../index.js';

export const Broadcast = sequelize.define('Broadcast', {
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
  templateId: {
    type: DataTypes.STRING,
  },
  templateName: {
    type: DataTypes.STRING,
  },
  status: {
    type: DataTypes.ENUM('draft', 'queued', 'in_progress', 'completed', 'failed'),
    defaultValue: 'draft',
  },
  contactIds: {
    type: DataTypes.ARRAY(DataTypes.UUID),
    defaultValue: [],
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
  messagesFailed: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  startedAt: {
    type: DataTypes.DATE,
  },
  completedAt: {
    type: DataTypes.DATE,
  },
  createdBy: {
    type: DataTypes.UUID,
  },
}, {
  timestamps: true,
  tableName: 'broadcasts',
});

export default Broadcast;
