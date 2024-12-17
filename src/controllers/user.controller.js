import db from '../database/init.js';

export const userController = {
  // Get all users
  getAllUsers: (req, res) => {
    try {
      const users = db.prepare(`
        SELECT id, email, name, role, created_at 
        FROM users 
        ORDER BY created_at DESC
      `).all();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get single user
  getUser: (req, res) => {
    try {
      const user = db.prepare(`
        SELECT id, email, name, role, created_at 
        FROM users 
        WHERE id = ?
      `).get(req.params.id);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Update user
  updateUser: (req, res) => {
    const { name, role } = req.body;
    
    try {
      const result = db.prepare(`
        UPDATE users 
        SET name = ?, role = ?
        WHERE id = ?
      `).run(name, role, req.params.id);

      if (result.changes === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json({ message: 'User updated successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Delete user
  deleteUser: (req, res) => {
    try {
      // Check if user has assigned leads
      const assignedLeads = db.prepare(
        'SELECT COUNT(*) as count FROM leads WHERE assigned_to = ?'
      ).get(req.params.id);

      if (assignedLeads.count > 0) {
        return res.status(400).json({ 
          error: 'Cannot delete user with assigned leads' 
        });
      }

      const result = db.prepare('DELETE FROM users WHERE id = ?')
        .run(req.params.id);

      if (result.changes === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};