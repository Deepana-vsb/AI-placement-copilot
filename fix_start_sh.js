const fs = require('fs');
const path = require('path');

const startShPath = path.join(__dirname, 'placement-copilot', 'frontend', 'start.sh');
let content = fs.readFileSync(startShPath, 'utf8');

// Replace all CRLF with LF
content = content.replace(/\r\n/g, '\n');

fs.writeFileSync(startShPath, content, { mode: 0o755 });

const rootStartShPath = path.join(__dirname, 'start.sh');
let rootContent = fs.readFileSync(rootStartShPath, 'utf8');

// Replace all CRLF with LF
rootContent = rootContent.replace(/\r\n/g, '\n');

fs.writeFileSync(rootStartShPath, rootContent, { mode: 0o755 });

console.log("Successfully fixed line endings to LF for both start.sh files!");
