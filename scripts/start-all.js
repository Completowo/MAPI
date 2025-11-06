const { spawn } = require('child_process');

function runProcess(command, args, name, options = {}) {
  console.log(`Starting ${name}: ${command} ${args.join(' ')}`);
  const proc = spawn(command, args, { shell: true, stdio: 'inherit', ...options });

  proc.on('exit', (code, signal) => {
    console.log(`${name} exited with code=${code} signal=${signal}`);
  });

  proc.on('error', (err) => {
    console.error(`${name} failed:`, err);
  });

  return proc;
}

// Start backend server (runs in foreground but will share terminal)
const server = runProcess('node', ['server/server.js'], 'server');

// Start Expo in LAN mode
const expo = runProcess('npx', ['expo', 'start', '--lan'], 'expo');

function shutdown() {
  console.log('Shutting down processes...');
  try { server.kill(); } catch (e) {}
  try { expo.kill(); } catch (e) {}
  process.exit();
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
