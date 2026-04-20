const Pipeline = require('../models/Pipeline');
const PipelineFactory = require('../utils/PipelineFactory');
const DeploymentStrategy = require('../utils/DeploymentStrategy');

const os = require('node:os');
const path = require('node:path');
const fs = require('node:fs');
const simpleGit = require('simple-git');
const Docker = require('dockerode');
const PipelineLog = require('../models/PipelineLog');
const tar = require('tar-fs');

const docker = new Docker();

class PipelineController {
  static async createPipeline(req, res) {
    try {
      const { repoUrl, type } = req.body;
      const pipeline = await Pipeline.create(req.user.id, repoUrl, type);
      
      // We will trigger the build async. For a real system we'd push to a message queue.
      PipelineController.executeBuild(pipeline);
      
      res.status(201).json({ message: 'Pipeline created build triggered', pipeline });
    } catch (error) {
      console.error('SERVER ERROR IN CREATEPIPELINE:', error);
      res.status(500).json({ message: 'Error creating pipeline', error: error.message });
    }
  }

  static async triggerBuildForRepoUrl(repoUrl) {
    try {
      const pipelines = await Pipeline.findByRepoUrl(repoUrl);
      for (const pipeline of pipelines) {
        PipelineController.executeBuild(pipeline);
      }
    } catch(err) {
      console.error('Failed to trigger build for repo', repoUrl, err);
    }
  }

  static async executeBuild(pipeline) {
    const buildDir = path.join(os.tmpdir(), `cloudforge-build-${pipeline.id}-${Date.now()}`);
    
    try {
      await pipeline.updateStatus('running');
      await PipelineLog.create(pipeline.id, `Started pipeline execution. Preparing to clone to ${buildDir}...`);

      const git = simpleGit();
      await git.clone(pipeline.repoUrl, buildDir);
      await PipelineLog.create(pipeline.id, `Cloned repository successfully.`);

      const dockerfilePath = path.join(buildDir, 'Dockerfile');
      if (!fs.existsSync(dockerfilePath)) {
        throw new Error('No Dockerfile found in root of repository. Build failed.');
      }

      await PipelineLog.create(pipeline.id, `Dockerfile found. Building image...`);
      
      const pack = tar.pack(buildDir);
      const stream = await docker.buildImage(pack, { t: `cloudforge-app-${pipeline.id}:latest` });

      await new Promise((resolve, reject) => {
        docker.modem.followProgress(stream, (err, res) => {
          if(err) return reject(err);
          resolve(res);
        }, async (chunk) => {
          // Stream output to logs
          if(chunk.stream) {
            await PipelineLog.create(pipeline.id, chunk.stream.trim());
          }
        });
      });

      await PipelineLog.create(pipeline.id, `Build successful! Image tagged as cloudforge-app-${pipeline.id}:latest.`);
      
      if (pipeline.type === 'deploy') {
        const strategy = new DeploymentStrategy();
        await strategy.deploy(pipeline);
      }
      
      await pipeline.updateStatus('success');
    } catch (error) {
      await PipelineLog.create(pipeline.id, `ERROR: ${error.message}`);
      await pipeline.updateStatus('failed');
    } finally {
      // Clean up async
      fs.rm(buildDir, { recursive: true, force: true }, () => {});
    }
  }

  static async getPipelines(req, res) {
    try {
      const pipelines = await Pipeline.findByUserId(req.user.id);
      res.json({ pipelines });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching pipelines', error: error.message });
    }
  }

  static async getPipelineLogs(req, res) {
    try {
      const logs = await PipelineLog.findByPipelineId(req.params.id);
      res.json({ logs });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching logs', error: error.message });
    }
  }
}

module.exports = PipelineController;