#!/usr/bin/env node

// @ph-itdev/container-tracker CLI
// Usage: npx @ph-itdev/container-tracker playground

const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const args = process.argv.slice(2);
const command = args[0];

if (command === 'playground' || command === 'demo' || command === 'play') {
  startPlayground();
} else if (command === 'help' || !command) {
  console.log(`
  📦 @ph-itdev/container-tracker

  Commands:
    npx @ph-itdev/container-tracker playground   Open interactive playground in browser
    npx @ph-itdev/container-tracker demo         Same as playground
    npx @ph-itdev/container-tracker help          Show this help

  Example:
    npm install @ph-itdev/container-tracker
    npx @ph-itdev/container-tracker playground
  `);
} else {
  console.log(`Unknown command: ${command}. Run with "help" for usage.`);
}

function startPlayground() {
  const examplePath = path.join(__dirname, '..', 'example', 'index.html');

  if (!fs.existsSync(examplePath)) {
    console.error('❌ Example file not found. Try: npm install @ph-itdev/container-tracker');
    process.exit(1);
  }

  const html = fs.readFileSync(examplePath, 'utf-8');

  const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(html);
  });

  const PORT = 3456;

  server.listen(PORT, '127.0.0.1', () => {
    const url = `http://localhost:${PORT}`;
    console.log(`
  📦 @ph-itdev/container-tracker — Playground running!

  🌐 Open: ${url}

  Press Ctrl+C to stop.
    `);

    // Auto-open browser
    const platform = process.platform;
    if (platform === 'darwin') exec(`open ${url}`);
    else if (platform === 'win32') exec(`start ${url}`);
    else exec(`xdg-open ${url} 2>/dev/null || echo "Open ${url} in your browser"`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`⚠️  Port ${PORT} in use. Opening http://localhost:${PORT} instead.`);
      const platform = process.platform;
      if (platform === 'darwin') exec(`open http://localhost:${PORT}`);
      else if (platform === 'win32') exec(`start http://localhost:${PORT}`);
      else exec(`xdg-open http://localhost:${PORT} 2>/dev/null`);
    } else {
      console.error('Server error:', err);
    }
  });
}
