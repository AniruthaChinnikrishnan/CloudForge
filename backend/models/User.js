const pool = require('../config/database');

class User {
  constructor(id, username, email, passwordHash) {
    this.id = id;
    this.username = username;
    this.email = email;
    this.passwordHash = passwordHash;
  }

  static async create(username, email, passwordHash) {
    const query = 'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING *';
    const values = [username, email, passwordHash];
    const result = await pool.query(query, values);
    return new User(result.rows[0].id, result.rows[0].username, result.rows[0].email, result.rows[0].password_hash);
  }

  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);
    if (result.rows.length > 0) {
      const row = result.rows[0];
      return new User(row.id, row.username, row.email, row.password_hash);
    }
    return null;
  }
}

module.exports = User;