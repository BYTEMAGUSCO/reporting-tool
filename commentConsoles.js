import fs from 'fs';
import path from 'path';

function commentConsolesInDir(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Skip node_modules and build folders
      if (['node_modules', 'dist', 'build', '.next'].includes(file)) continue;
      commentConsolesInDir(filePath);
    } else if (/\.(js|jsx|ts|tsx)$/.test(file)) {
      let content = fs.readFileSync(filePath, 'utf8');

      // Comment out all console.* lines
      const updated = content.replace(
        /^(\s*)console\.(log|error|warn|debug)\(/gm,
        '$1// console.$2('
      );

      if (updated !== content) {
        fs.writeFileSync(filePath, updated, 'utf8');
        // console.log(`✔ Updated: ${filePath}`);
      }
    }
  }
}

// Start from current project folder
commentConsolesInDir(process.cwd());
