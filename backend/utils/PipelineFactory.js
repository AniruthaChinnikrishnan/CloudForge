class PipelineFactory {
  static createPipeline(type) {
    switch (type) {
      case 'build':
        return { type: 'build', steps: ['checkout', 'build', 'test'] };
      case 'deploy':
        return { type: 'deploy', steps: ['checkout', 'build', 'deploy'] };
      default:
        return { type: 'default', steps: ['checkout'] };
    }
  }
}

module.exports = PipelineFactory;