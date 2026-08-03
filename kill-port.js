const { exec } = require('child_process');

console.log('🔍 Looking for processes running on port 5000...');

exec('netstat -ano | findstr :5000', (err, stdout, stderr) => {
  if (err || !stdout) {
    console.log('✅ No active process found on port 5000.');
    process.exit(0);
  }

  const lines = stdout.trim().split('\n');
  const pids = new Set();

  lines.forEach(line => {
    const parts = line.trim().split(/\s+/);
    if (parts.length >= 5) {
      const pid = parts[parts.length - 1];
      if (pid && pid !== '0') {
        pids.add(pid);
      }
    }
  });

  if (pids.size === 0) {
    console.log('✅ No active PIDs found listening on port 5000.');
    process.exit(0);
  }

  console.log(`⚠️ Found PIDs listening on port 5000: ${Array.from(pids).join(', ')}`);
  
  pids.forEach(pid => {
    console.log(`☠️ Killing process ${pid}...`);
    exec(`taskkill /F /PID ${pid}`, (killErr, killStdout, killStderr) => {
      if (killErr) {
        console.error(`❌ Failed to kill process ${pid}:`, killErr.message);
      } else {
        console.log(`✅ Successfully killed process ${pid}.`);
      }
    });
  });
});
