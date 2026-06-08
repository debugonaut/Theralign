import fs from 'fs';
import path from 'path';

// Correct ES6 Unicode regex with /u flag
const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{27BF}\u{1F900}-\u{1FAFF}\u{1F000}-\u{1F02F}\u{1F0A0}-\u{1F0FF}]/u;

const scanDir = (dir) => {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      scanDir(fullPath);
    } else if (file.endsWith('.jsx') || file.endsWith('.js') || file.endsWith('.css')) {
      const content = fs.readFileSync(fullPath, 'utf-8');
      const lines = content.split('\n');
      lines.forEach((line, index) => {
        if (emojiRegex.test(line)) {
          const chars = Array.from(line);
          const foundEmojis = chars.filter(c => emojiRegex.test(c));
          if (foundEmojis.length > 0) {
            console.log(`${fullPath}:${index + 1}: ${foundEmojis.join(', ')} -> "${line.trim()}"`);
          }
        }
      });
    }
  }
};

const clientSrc = '/Users/aadeshkhande/Documents/Professional/Own/CustomSoft/client/src';
scanDir(clientSrc);
