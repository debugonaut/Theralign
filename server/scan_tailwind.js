import fs from 'fs';
import path from 'path';

const supportedSpacing = new Set([
  '0', '1', '2', '3', '4', '5', '6', '8', '10', '12', '16', '20', '24', '32',
  'px', 'py', 'mx', 'my', 'pl', 'pr', 'pt', 'pb', 'ml', 'mr', 'mt', 'mb' // standard prefixes
]);

// Regex to find tailwind-like spacing classes, e.g. w-48, h-64, mt-2, -mb-4, gap-4
const spacingClassRegex = /\b(-?(?:w|h|p|m|gap|top|bottom|left|right|space|translate|px|py|mx|my|pt|pb|pl|pr|mt|mb|ml|mr|gap-x|gap-y|space-x|space-y))(-[0-9]+)\b/g;

const scanDir = (dir) => {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      scanDir(fullPath);
    } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
      const content = fs.readFileSync(fullPath, 'utf-8');
      const lines = content.split('\n');
      lines.forEach((line, index) => {
        let match;
        // Reset regex index
        spacingClassRegex.lastIndex = 0;
        while ((match = spacingClassRegex.exec(line)) !== null) {
          const number = match[2].substring(1); // remove the leading dash
          if (!supportedSpacing.has(number)) {
            // Filter out false positives like standard css attributes or numbers inside template literals
            // We want to see classes. Let's print them.
            console.log(`${fullPath}:${index + 1}: Found unsupported class "${match[0]}" in line: "${line.trim()}"`);
          }
        }
      });
    }
  }
};

const clientSrc = '/Users/aadeshkhande/Documents/Professional/Own/CustomSoft/client/src';
scanDir(clientSrc);
