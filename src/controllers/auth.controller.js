import jwt from 'jsonwebtoken';
import { hashPassword, comparePassword } from '../utils/auth.utils.js';
import db from '../database/init.js';

export const authController = {
  login: (req, res) => {
    const { email, password } = req.body;

    try {
      const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
      
      if (!user || !comparePassword(password, user.password)) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { userId: user.id, role: user.role },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  register: (req, res) => {
    const { email, password, name, role } = req.body;

    try {
      const existingUser = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
      if (existingUser) {
        return res.status(400).json({ error: 'Email already registered' });
      }

      const hashedPassword = hashPassword(password);
      
      const result = db.prepare(`
        INSERT INTO users (email, password, name, role)
        VALUES (?, ?, ?, ?)
      `).run(email, hashedPassword, name, role);

      res.status(201).json({ id: result.lastInsertRowid });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};