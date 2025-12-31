// PM2 Ecosystem Configuration for Next.js Frontend
// Location: /home/ubuntu/legal-connect/frontend/ecosystem.config.js

module.exports = {
  apps: [
    {
      name: 'legal-connect-frontend',
      script: 'npm',
      args: 'start',
      cwd: '/home/ubuntu/legal-connect/frontend',
      instances: 1,
      exec_mode: 'cluster',
      
      // Environment
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        NEXT_PUBLIC_API_URL: 'https://api.legalconnect.com',
        NEXT_PUBLIC_DOMAIN: 'legalconnect.com',
        NEXT_PUBLIC_FRONTEND_URL: 'https://legalconnect.com'
      },
      
      // Memory and resource limits
      max_memory_restart: '500M',
      
      // Logging
      error_file: '/var/log/legal-connect/pm2-error.log',
      out_file: '/var/log/legal-connect/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      // Restart behavior
      watch: false,
      ignore_watch: ['node_modules', '.next', 'logs'],
      max_restarts: 10,
      min_uptime: '10s',
      
      // Graceful shutdown
      kill_timeout: 10000,
      wait_ready: true,
      listen_timeout: 10000
    }
  ],
  
  // Deployment configuration (optional, for automated deployments)
  deploy: {
    production: {
      user: 'ubuntu',
      host: 'your-instance-ip',
      key: '/home/ubuntu/.ssh/id_rsa',
      ref: 'origin/main',
      repo: 'https://github.com/carnage999-max/legal-connect.git',
      path: '/home/ubuntu/legal-connect',
      'post-deploy': 'cd frontend && npm install && npm run build && pm2 reload ecosystem.config.js --env production'
    }
  }
};
