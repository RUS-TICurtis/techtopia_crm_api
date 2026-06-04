const fs = require('fs');
const path = require('path');

function replaceInDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.git' && file !== 'dist') {
        replaceInDir(fullPath);
      }
    } else if (file.endsWith('.ts') || file.endsWith('.js') || file.endsWith('.jsx') || file.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('tenant_techtopia')) {
        console.log('Replacing in:', fullPath);
        content = content.replace(/tenant_techtopia/g, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11');
        fs.writeFileSync(fullPath, content, 'utf8');
      }
    }
  }
}

console.log('Starting replacement...');
replaceInDir('C:\\Users\\Curtis\\Documents\\_Github\\advanced_crm_hub\\crm_api\\src');
replaceInDir('C:\\Users\\Curtis\\Documents\\_Github\\advanced_crm_hub\\crm_web\\src');
console.log('Replacement finished!');
