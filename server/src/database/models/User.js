import { DataTypes } from 'sequelize';
import { sequelize } from '../index.js';

export const User = sequelize.define('User', {
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
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: true, // OAuth users may not have passwords
  },
  role: {
    type: DataTypes.ENUM('admin', 'agent', 'viewer'),
    defaultValue: 'agent',
  },
  oauthProvider: {
    type: DataTypes.STRING, // 'google', 'github', null
  },
  oauthId: {
    type: DataTypes.STRING,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  timestamps: true,
  tableName: 'users',
});

export default User;
