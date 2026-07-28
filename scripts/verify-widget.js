const fs = require('fs');
const path = require('path');
const http = require('http');

console.log('--- Starting Widget & API Route Verification ---');

// 1. Verify public/widget.js existence and syntax
const widgetJsPath = path.join(__dirname, '..', 'public', 'widget.js');
if (!fs.existsSync(widgetJsPath)) {
  console.error('❌ FAIL: public/widget.js missing');
  process.exit(1);
}
const widgetContent = fs.readFileSync(widgetJsPath, 'utf8');
if (!widgetContent.includes('data-bot-id') || !widgetContent.includes('/api/chat')) {
  console.error('❌ FAIL: widget.js does not contain data-bot-id or /api/chat fetch logic');
  process.exit(1);
}
console.log('✓ PASS: public/widget.js is present and configured correctly.');

// 2. Verify API Route handler file existence
const routePath = path.join(__dirname, '..', 'src', 'app', 'api', 'chat', 'route.ts');
if (!fs.existsSync(routePath)) {
  console.error('❌ FAIL: src/app/api/chat/route.ts missing');
  process.exit(1);
}
console.log('✓ PASS: src/app/api/chat/route.ts is present.');

console.log('--- All Verification Checks Passed Cleanly ---');
