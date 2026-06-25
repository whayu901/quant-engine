const fs = require('fs');
const path = require('path');

// Function to calculate relative path from source to target
function getRelativePath(fromFile, toPath) {
  const fromDir = path.dirname(fromFile);
  const fromDepth = fromDir.split('/src/')[1]?.split('/').length || 0;

  // If we're importing from src root level files
  if (toPath.startsWith('@/lib') || toPath.startsWith('@/types') || toPath.startsWith('@/hooks') || toPath.startsWith('@/components')) {
    const targetPath = toPath.replace('@/', '');
    const targetParts = targetPath.split('/');
    const fromParts = fromDir.split('/src/')[1]?.split('/') || [];

    // Calculate how many levels up we need to go
    let upLevels = fromParts.length;
    let relativePath = upLevels > 0 ? '../'.repeat(upLevels) : './';

    // Add the target path
    relativePath += targetPath;

    return relativePath;
  }

  return toPath; // Return unchanged if not an @/ import
}

// Function to fix imports in a file
function fixImportsInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;

    // Match all import statements with @/
    const importRegex = /import\s+(?:(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)(?:\s*,\s*(?:\{[^}]*\}|\w+))*\s+from\s+)?['"](@\/[^'"]+)['"]/g;
    const matches = content.matchAll(importRegex);

    for (const match of matches) {
      const fullMatch = match[0];
      const importPath = match[1];
      const relativePath = getRelativePath(filePath, importPath);
      const newImport = fullMatch.replace(importPath, relativePath);
      content = content.replace(fullMatch, newImport);
    }

    // Also fix dynamic imports and require statements
    content = content.replace(/from\s+['"](@\/[^'"]+)['"]/g, (match, importPath) => {
      const relativePath = getRelativePath(filePath, importPath);
      return match.replace(importPath, relativePath);
    });

    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed imports in: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Function to recursively find all TypeScript/JavaScript files
function findFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules' && file !== 'dist' && file !== 'build') {
      findFiles(filePath, fileList);
    } else if (stat.isFile() && (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.jsx'))) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

// Main execution
const srcDir = '/Users/wahyusetiawan/Documents/office/kadence/qual-engine/frontend/src';
console.log('🔍 Finding all files with @/ imports...\n');

const allFiles = findFiles(srcDir);
let fixedCount = 0;

allFiles.forEach(filePath => {
  if (fixImportsInFile(filePath)) {
    fixedCount++;
  }
});

console.log(`\n✨ Fixed imports in ${fixedCount} files!`);
console.log('All @/ imports have been converted to relative imports.');