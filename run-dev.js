const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting NexCart Backend & Frontend Dev Servers...');

// Auto-install backend dependencies if node_modules is missing
const backendNodeModules = path.join(__dirname, 'backend', 'node_modules');
if (!fs.existsSync(backendNodeModules)) {
  console.log('📦 Backend node_modules not found. Installing backend dependencies first...');
  try {
    execSync('npm install --prefix backend', { stdio: 'inherit' });
    console.log('✅ Backend dependencies installed successfully!');
  } catch (err) {
    console.error('❌ Failed to install backend dependencies:', err);
  }
}

// Start the backend and frontend dev servers concurrently
const backend = spawn('npm', ['run', 'dev', '--prefix', 'backend'], { stdio: 'inherit', shell: true });
const frontend = spawn('npm', ['run', 'dev', '--prefix', 'frontend'], { stdio: 'inherit', shell: true });

backend.on('error', (err) => console.error('❌ Backend process error:', err));
frontend.on('error', (err) => console.error('❌ Frontend process error:', err));

// Handle exit of either process
backend.on('exit', (code) => {
  console.log(`Backend process exited with code ${code}`);
  frontend.kill();
  process.exit(code);
});

frontend.on('exit', (code) => {
  console.log(`Frontend process exited with code ${code}`);
  backend.kill();
  process.exit(code);
});

// Ensure children are killed on interrupt
process.on('SIGINT', () => {
  backend.kill();
  frontend.kill();
  process.exit(0);
});
