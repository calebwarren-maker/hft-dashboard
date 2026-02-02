// Patch Next.js generateBuildId for Node.js 24 compatibility
const fs = require('fs');
const path = require('path');

const filepath = path.join(__dirname, '..', 'node_modules', 'next', 'dist', 'build', 'generate-build-id.js');

if (fs.existsSync(filepath)) {
  let content = fs.readFileSync(filepath, 'utf8');
  if (!content.includes('typeof generate !== "function"')) {
    content = content.replace(
      'async function generateBuildId(generate, fallback) {',
      'async function generateBuildId(generate, fallback) {\n    if (typeof generate !== "function") generate = async () => null;'
    );
    fs.writeFileSync(filepath, content);
    console.log('Patched next/dist/build/generate-build-id.js for Node.js 24 compatibility');
  }
}
