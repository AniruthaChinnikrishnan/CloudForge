const pool = require('../config/database');

class PipelineLog {
  constructor(id, pipeline_id, log_output, created_at) {
    this.id = id;
    this.pipeline_id = pipeline_id;
    this.log_output = log_output;
    this.created_at = created_at;
  }

  static async create(pipeline_id, log_output) {
    const query = 'INSERT INTO pipeline_logs (pipeline_id, log_output) VALUES ($1, $2) RETURNING *';
    const values = [pipeline_id, log_output];
    const result = await pool.query(query, values);
    return new PipelineLog(result.rows[0].id, result.rows[0].pipeline_id, result.rows[0].log_output, result.rows[0].created_at);
  }

  static async findByPipelineId(pipeline_id) {
    const query = 'SELECT * FROM pipeline_logs WHERE pipeline_id = $1 ORDER BY created_at ASC';
    const result = await pool.query(query, [pipeline_id]);
    return result.rows.map(row => new PipelineLog(row.id, row.pipeline_id, row.log_output, row.created_at));
  }
}

module.exports = PipelineLog;
