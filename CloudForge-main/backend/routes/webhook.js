const express = require('express');
const PipelineController = require('../controllers/PipelineController');
const router = express.Router();

router.post('/', async (req, res) => {
  try {
    // Basic GitHub push event parsing
    const event = req.headers['x-github-event'];
    if (event === 'push') {
      const repoUrl = req.body.repository.clone_url;
      
      // Find pipelines linked to this repo
      // Ideally we would trigger builds for all matched pipelines
      // For MVP, if it exists, trigger build.
      
      // Since webhook is unauthenticated by a user session, we bypass the req.user
      // We pass a synthetic req object to the controller logic or call internal service
      
      // Simulating a background task trigger
      PipelineController.triggerBuildForRepoUrl(repoUrl);
      
      res.status(200).send('Push received and build triggered');
    } else {
      res.status(200).send('Event not processed');
    }
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).send('Error processing webhook');
  }
});

module.exports = router;
