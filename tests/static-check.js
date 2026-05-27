const fs = require('fs');
const vm = require('vm');
const path = require('path');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const errors = [];

const scripts = [...html.matchAll(/<script(?![^>]*src=)[^>]*>([\s\S]*?)<\/script>/gi)].map(m => m[1]);
for (const [i, script] of scripts.entries()) {
  try {
    new vm.Script(script, { filename: `inline-script-${i + 1}.js` });
  } catch (error) {
    errors.push(`JavaScript parse error in inline script ${i + 1}: ${error.message}`);
  }
}

const defined = new Set();
for (const match of html.matchAll(/\bfunction\s+([A-Za-z_$][\w$]*)\s*\(/g)) defined.add(match[1]);
for (const match of html.matchAll(/\b([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?function\b/g)) defined.add(match[1]);

const ignored = new Set([
  'alert', 'confirm', 'prompt', 'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval',
  'Math', 'Date', 'Array', 'Object', 'String', 'Number', 'Boolean', 'parseInt', 'parseFloat'
]);

const missing = new Set();
for (const attr of html.matchAll(/onclick="([^"]+)"/g)) {
  const code = attr[1];
  for (const call of code.matchAll(/(?:^|[;\s])([A-Za-z_$][\w$]*)\s*\(/g)) {
    const name = call[1];
    if (!ignored.has(name) && !defined.has(name)) missing.add(name);
  }
}

if (missing.size) errors.push(`Missing onclick handlers: ${[...missing].sort().join(', ')}`);

for (const file of ['manifest.json', 'sw.js', 'netlify.toml', 'KARMA_supabase_setup.sql', 'icon-192.png', 'icon-512.png']) {
  if (!fs.existsSync(path.join(root, file))) errors.push(`Missing required file: ${file}`);
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log('Static checks passed.');
