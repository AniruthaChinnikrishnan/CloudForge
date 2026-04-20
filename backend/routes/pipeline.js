const express = require('express');
const PipelineController = require('../controllers/PipelineController');

const router = express.Router();

router.post('/', PipelineController.createPipeline);
router.get('/', PipelineController.getPipelines);
router.get('/:id/logs', PipelineController.getPipelineLogs);

module.exports = router;