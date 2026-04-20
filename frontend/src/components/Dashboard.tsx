import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Cloud, LogOut, Terminal, GitBranch, Play, CheckCircle, Loader, Server, Box } from 'lucide-react';

interface PipelineItem {
  id: number;
  repo_url: string;
  status: string;
  type: string;
}

interface LogItem {
  id: number;
  pipeline_id: number;
  log_output: string;
  created_at: string;
}

const Dashboard: React.FC<{ token: string; setToken: (token: string | null) => void }> = ({ token, setToken }) => {
  const [pipelines, setPipelines] = useState<PipelineItem[]>([]);
  const [repoUrl, setRepoUrl] = useState('');
  const [type, setType] = useState('build');
  const [viewingLogs, setViewingLogs] = useState<number | null>(null);
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPipelines = useCallback(async () => {
    try {
      if (!token) return;
      const response = await axios.get('/api/pipeline', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data && Array.isArray(response.data.pipelines)) {
        setPipelines(response.data.pipelines);
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error fetching pipelines:', error.message);
      } else {
        throw error;
      }
    }
  }, [token]);

  useEffect(() => {
    fetchPipelines();
    const interval = setInterval(fetchPipelines, 5000);
    return () => clearInterval(interval);
  }, [fetchPipelines]);

  useEffect(() => {
    if (viewingLogs !== null && token) {
      const fetchLogs = async () => {
        try {
          const response = await axios.get(`/api/pipeline/${viewingLogs}/logs`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (response.data && Array.isArray(response.data.logs)) {
            setLogs(response.data.logs);
          }
        } catch (error) {
          console.error("Error fetching logs", error);
        }
      };
      
      fetchLogs();
      const interval = setInterval(fetchLogs, 3000);
      return () => clearInterval(interval);
    }
  }, [viewingLogs, token]);

  const createPipeline = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!repoUrl || !token) return;
    
    setIsSubmitting(true);
    try {
      await axios.post('/api/pipeline', { repoUrl, type }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRepoUrl('');
      fetchPipelines();
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Pipeline creation failed:', error.message);
        alert('Error creating pipeline: ' + error.message);
      } else {
        console.error('Pipeline creation failed with an unexpected error:', error);
        alert('Error creating pipeline. Ensure repository URL is valid.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    if (!status) return <div className="w-5 h-5 rounded-full bg-gray-500/20 border border-gray-500" />;
    switch(status.toLowerCase()) {
      case 'success': return <CheckCircle className="w-5 h-5 text-emerald-400" />;
      case 'running': return <Loader className="w-5 h-5 text-indigo-400 animate-spin" />;
      case 'failed': return <div className="w-5 h-5 rounded-full bg-red-500/20 border border-red-500 flex items-center justify-center"><div className="w-2 h-2 bg-red-400 rounded-full" /></div>;
      default: return <div className="w-5 h-5 rounded-full bg-gray-500/20 border border-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-background text-gray-200">
      <nav className="border-b border-surfaceBorder bg-surface sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
               <div className="p-2 bg-indigo-500/20 rounded-lg border border-indigo-500/30">
                  <Cloud className="w-6 h-6 text-indigo-400" />
               </div>
               <span className="font-bold text-xl tracking-tight text-white">CloudForge Dashboard</span>
            </div>
            <button 
              onClick={() => { localStorage.removeItem('token'); setToken(null); }}
              className="flex items-center space-x-2 text-sm text-gray-400 hover:text-white transition-colors px-3 py-2 rounded-md hover:bg-gray-800"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row gap-8 relative">
        <div className="w-full lg:w-1/3 space-y-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card rounded-xl p-6"
          >
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Play className="w-5 h-5 mr-2 text-indigo-400" /> Trigger Action
            </h2>
            <form onSubmit={createPipeline} className="space-y-4">
              <div>
                <label htmlFor="repo-url-input" className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">Repository URL</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <GitBranch className="h-4 w-4 text-gray-500" />
                  </div>
                  <input
                    id="repo-url-input"
                    type="url"
                    required
                    placeholder="https://github.com/org/repo.git"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    className="block w-full pl-9 pr-3 py-2 border border-gray-700 rounded-lg bg-gray-900/50 text-sm text-white placeholder-gray-600 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
              
              <fieldset>
                <legend className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">Target Phase</legend>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    type="button"
                    onClick={() => setType('build')}
                    className={`flex items-center justify-center p-2 rounded-lg border text-sm transition-all ${type === 'build' ? 'border-primary bg-primary/10 text-primaryHover' : 'border-gray-700 bg-gray-800/50 text-gray-400 hover:bg-gray-800'}`}
                  >
                    <Box className="w-4 h-4 mr-2" /> Docker Build
                  </button>
                  <button 
                    type="button"
                    onClick={() => setType('deploy')}
                    className={`flex items-center justify-center p-2 rounded-lg border text-sm transition-all ${type === 'deploy' ? 'border-purple-500 bg-purple-500/10 text-purple-400' : 'border-gray-700 bg-gray-800/50 text-gray-400 hover:bg-gray-800'}`}
                  >
                    <Server className="w-4 h-4 mr-2" /> K8s Deploy
                  </button>
                </div>
              </fieldset>
              
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2 px-4 rounded-lg transition-colors shadow-lg shadow-indigo-600/20 disabled:opacity-50"
              >
                {isSubmitting ? 'Initializing...' : 'Execute Pipeline'}
              </button>
            </form>
          </motion.div>

          <div className="glass-card rounded-xl p-6">
             <h2 className="text-lg font-semibold text-white mb-4">Pipeline History</h2>
             <div className="space-y-3 max-h-[500px] overflow-y-auto terminal-scrollbar pr-2">
                <AnimatePresence>
                  {(!pipelines || pipelines.length === 0) && (
                    <p className="text-sm text-gray-500 italic text-center py-4">No pipelines tracked yet.</p>
                  )}
                  {Array.isArray(pipelines) && pipelines.map(pipeline => (
                    <motion.div 
                      key={pipeline.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 rounded-lg cursor-pointer border transition-all ${viewingLogs === pipeline.id ? 'border-indigo-500 bg-indigo-500/5' : 'border-gray-800 bg-gray-900/50 hover:border-gray-600'}`}
                      onClick={() => setViewingLogs(pipeline.id)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(pipeline.status)}
                          <span className="font-mono text-sm text-gray-300">Run #{pipeline.id}</span>
                        </div>
                        <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded ${pipeline.type === 'deploy' ? 'bg-purple-500/20 text-purple-300' : 'bg-blue-500/20 text-blue-300'}`}>
                          {pipeline.type || 'build'}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 truncate w-full" title={pipeline.repo_url}>
                        {pipeline.repo_url ? pipeline.repo_url.replace('https://github.com/', '') : 'unknown repo'}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
             </div>
          </div>
        </div>

        <div className="w-full lg:w-2/3 h-[700px]">
          {viewingLogs ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="h-full rounded-xl bg-[#0d1117] border border-gray-800 hidden lg:flex flex-col overflow-hidden shadow-2xl"
            >
              <div className="h-10 bg-[#161b22] border-b border-gray-800 flex items-center px-4 w-full">
                <div className="flex space-x-2 mr-4">
                  <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                </div>
                <div className="text-xs text-gray-500 font-mono flex items-center space-x-2 justify-center w-full">
                  <Terminal className="w-3 h-3" />
                  <span>cloudforge-runner-tty</span>
                </div>
              </div>
              <div className="p-4 flex-1 overflow-y-auto terminal-scrollbar font-mono text-sm leading-relaxed text-gray-300">
                {(!logs || logs.length === 0) ? (
                  <div className="flex items-center text-gray-500"><Loader className="w-4 h-4 mr-2 animate-spin" /> Waiting for execution context...</div>
                ) : (
                  Array.isArray(logs) && logs.map((log) => {
                    const output = log.log_output ?? '';
                    let textClass = 'text-gray-300';
                    if (output.includes('ERROR') || output.includes('failed')) {
                      textClass = 'text-red-400';
                    } else if (output.includes('success')) {
                      textClass = 'text-emerald-400';
                    }
                    return (
                      <div key={log.id} className="whitespace-pre-wrap break-words border-b border-gray-800/30 pb-1 mb-1">
                        <span className="text-gray-600 select-none mr-4 text-xs">{log.created_at ? new Date(log.created_at).toLocaleTimeString() : '...'}</span>
                        <span className={textClass}>
                          {output}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>
          ) : (
            <div className="h-full rounded-xl border border-dashed border-gray-800 flex flex-col items-center justify-center text-gray-500">
              <Terminal className="w-16 h-16 mb-4 opacity-20" />
              <p>Select a pipeline to view telemetry</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;