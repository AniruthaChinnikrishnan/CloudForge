const pool = require('../config/database');

class Pipeline {
  constructor(id, userId, repoUrl, status, type) {
    this.id = id;
    this.userId = userId;
    this.repoUrl = repoUrl;
    this.status = status;
    this.type = type || 'build';
  }

  static async create(userId, repoUrl, type = 'build') {
    const query = 'INSERT INTO pipelines (user_id, repo_url, status, type) VALUES ($1, $2, $3, $4) RETURNING *';
    const values = [userId, repoUrl, 'pending', type];
    const result = await pool.query(query, values);
    return new Pipeline(result.rows[0].id, result.rows[0].user_id, result.rows[0].repo_url, result.rows[0].status, result.rows[0].type);
  }

  static async findByUserId(userId) {
    const query = 'SELECT * FROM pipelines WHERE user_id = $1';
    const result = await pool.query(query, [userId]);
    return result.rows.map(row => new Pipeline(row.id, row.user_id, row.repo_url, row.status, row.type));
  }

  static async findByRepoUrl(repoUrl) {
    const query = 'SELECT * FROM pipelines WHERE repo_url = $1';
    const result = await pool.query(query, [repoUrl]);
    return result.rows.map(row => new Pipeline(row.id, row.user_id, row.repo_url, row.status, row.type));
  }

  async updateStatus(status) {
    const query = 'UPDATE pipelines SET status = $1 WHERE id = $2';
    await pool.query(query, [status, this.id]);
    this.status = status;
  }
}

module.exports = Pipeline;