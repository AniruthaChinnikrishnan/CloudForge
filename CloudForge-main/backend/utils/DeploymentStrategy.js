const k8s = require('@kubernetes/client-node');
const PipelineLog = require('../models/PipelineLog');

class KubernetesDeploymentStrategy {
  constructor() {
    this.kc = new k8s.KubeConfig();
    try {
      this.kc.loadFromDefault();
      this.k8sApi = this.kc.makeApiClient(k8s.AppsV1Api);
      this.coreApi = this.kc.makeApiClient(k8s.CoreV1Api);
    } catch(err) {
      console.error("Warning: Could not load kubeconfig. Deployments will fail if attempted.", err);
    }
  }

  async deploy(pipeline) {
    if (!this.k8sApi || !this.coreApi) {
      throw new Error("Kubernetes cluster is not configured (kubeconfig missing).");
    }

    const namespace = 'default';
    const appName = `cloudforge-app-${pipeline.id}`;
    const imageTag = `cloudforge-app-${pipeline.id}:latest`;
    
    await PipelineLog.create(pipeline.id, `Starting Kubernetes Deployment for ${appName}...`);

    const deployment = {
      metadata: { name: appName },
      spec: {
        replicas: 1,
        selector: { matchLabels: { app: appName } },
        template: {
          metadata: { labels: { app: appName } },
          spec: {
            containers: [{
              name: appName,
              image: imageTag,
              imagePullPolicy: 'Never', // Because it's a locally built image
              ports: [{ containerPort: 80 }] // Assume default port 80 for generic apps
            }]
          }
        }
      }
    };

    const service = {
      metadata: { name: `${appName}-svc` },
      spec: {
        type: 'NodePort',
        selector: { app: appName },
        ports: [{ port: 80, targetPort: 80 }]
      }
    };

    // Apply Deployment
    try {
      await PipelineLog.create(pipeline.id, `Applying K8s Deployment manifest...`);
      await this.k8sApi.createNamespacedDeployment(namespace, deployment);
      await PipelineLog.create(pipeline.id, `Deployment applied.`);
    } catch (err) {
      if (err.statusCode === 409) {
        // Exists, so replace/patch it
        await PipelineLog.create(pipeline.id, `Deployment exists. Patching...`);
        // We will just recreate it for MVP
        await this.k8sApi.deleteNamespacedDeployment(appName, namespace);
        await new Promise(r => setTimeout(r, 2000));
        await this.k8sApi.createNamespacedDeployment(namespace, deployment);
      } else {
        throw new Error(`K8s Deployment Error: ${err.body ? err.body.message : err.message}`);
      }
    }

    // Apply Service
    try {
      await PipelineLog.create(pipeline.id, `Applying K8s Service manifest...`);
      const svcRes = await this.coreApi.createNamespacedService(namespace, service);
      const nodePort = svcRes.body.spec.ports[0].nodePort;
      await PipelineLog.create(pipeline.id, `Service created successfully! Accessible on NodePort: ${nodePort}`);
    } catch (err) {
      if (err.statusCode === 409) {
        await PipelineLog.create(pipeline.id, `Service ${appName}-svc already exists.`);
      } else {
        throw new Error(`K8s Service Error: ${err.body ? err.body.message : err.message}`);
      }
    }

    await PipelineLog.create(pipeline.id, `✅ Kubernetes rollout completed successfully.`);
  }
}

module.exports = KubernetesDeploymentStrategy;