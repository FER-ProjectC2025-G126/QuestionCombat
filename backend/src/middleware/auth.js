import Database from '../models/db/Database.js';

export const requireAdmin = async (req, res, next) => {
  // Check if user is logged in
  if (!req.username) {
    return res.status(401).json({ error: 'User not logged in!' });
  }

  try {
    const database = new Database();
    const user = await database.users.getUser(req.username);

    if (!user) {
      return res.status(401).json({ error: 'User not found!' });
    }

    if (user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin access required!' });
    }

    // User is admin, continue to next middleware/route
    next();
  } catch (error) {
    console.error('Admin check error:', error);
    return res.status(500).json({ error: 'Failed to verify admin status!' });
  }
};
