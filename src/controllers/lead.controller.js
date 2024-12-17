import db from '../database/init.js';

export const leadController = {
  // Get all leads
  getAllLeads: (req, res) => {
    try {
      const leads = db.prepare('SELECT * FROM leads ORDER BY created_at DESC').all();
      res.json(leads);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get single lead
  getLead: (req, res) => {
    try {
      const lead = db.prepare('SELECT * FROM leads WHERE id = ?').get(req.params.id);
      if (!lead) {
        return res.status(404).json({ error: 'Lead not found' });
      }
      res.json(lead);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Create new lead
  createLead: (req, res) => {
    const { first_name, last_name, email, phone, status, source, assigned_to } = req.body;
    
    try {
      const result = db.prepare(`
        INSERT INTO leads (first_name, last_name, email, phone, status, source, assigned_to)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(first_name, last_name, email, phone, status, source, assigned_to);

      res.status(201).json({ id: result.lastInsertRowid });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Update lead
  updateLead: (req, res) => {
    const { first_name, last_name, email, phone, status, source, assigned_to } = req.body;
    
    try {
      const result = db.prepare(`
        UPDATE leads 
        SET first_name = ?, last_name = ?, email = ?, phone = ?, 
            status = ?, source = ?, assigned_to = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(first_name, last_name, email, phone, status, source, assigned_to, req.params.id);

      if (result.changes === 0) {
        return res.status(404).json({ error: 'Lead not found' });
      }
      res.json({ message: 'Lead updated successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Delete lead
  deleteLead: (req, res) => {
    try {
      const result = db.prepare('DELETE FROM leads WHERE id = ?').run(req.params.id);
      if (result.changes === 0) {
        return res.status(404).json({ error: 'Lead not found' });
      }
      res.json({ message: 'Lead deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};