import { dbHelpers } from '../database/init.js';

export const executeQuery = (sql, params = []) => {
  try {
    return dbHelpers.run(sql, params);
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

export const fetchOne = (sql, params = []) => {
  try {
    return dbHelpers.get(sql, params);
  } catch (error) {
    console.error('Database fetch error:', error);
    throw error;
  }
};

export const fetchAll = (sql, params = []) => {
  try {
    return dbHelpers.all(sql, params);
  } catch (error) {
    console.error('Database fetch error:', error);
    throw error;
  }
};