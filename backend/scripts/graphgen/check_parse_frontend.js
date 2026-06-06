const fs = require('fs');
const parser = require('@babel/parser');
const glob = require('glob');

const files = glob.sync('frontend/src/**/*.{js,jsx,ts,tsx}', { nodir: true });
let ok = true;
for (const f of files) {
  try {
    const code = fs.readFileSync(f, 'utf8');
    parser.parse(code, { sourceType: 'module', plugins: ['jsx', 'classProperties', 'typescript', 'decorators-legacy'] });
  } catch (e) {
    console.error('PARSE FAIL:', f);
    console.error(e.message);
    ok = false;
  }
}
if (ok) console.log('All frontend files parsed successfully.'); else process.exit(1);
