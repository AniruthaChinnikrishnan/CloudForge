const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class AuthController {
  static async register(req, res) {
    try {
      const { username, email, password } = req.body;
      const passwordHash = await bcrypt.hash(password, 10);
      const user = await User.create(username, email, passwordHash);
      const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
      res.status(201).json({ message: 'User created', user: { id: user.id, username: user.username, email: user.email }, token });
    } catch (error) {
      res.status(500).json({ message: 'Error creating user', error: error.message });
    }
  }

  static async login(req, res) {
    try {
      const { email, password } = req.body;
      const user = await User.findByEmail(email);
      if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
      res.json({ token });
    } catch (error) {
      res.status(500).json({ message: 'Error logging in', error: error.message });
    }
  }
}

module.exports = AuthController;