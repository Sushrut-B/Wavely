import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

export const sequelize = new Sequelize(
  process.env.DB_NAME || 'wavely',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'postgres',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false, // Set to false to reduce logs
    pool: {
      max: 5,
      min: 0,
      acquire: 5000,  // Reduced timeout
      idle: 10000,
    },
    dialectOptions: {
      requestTimeout: 5000,  // Connection timeout
    },
    retry: {
      max: 1,  // Only try once
    },
  }
);

export default sequelize;
