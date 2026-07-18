import fs from 'fs';
import path from 'path';

const source = 'C:\\Users\\Server\\.gemini\\antigravity-ide\\brain\\85ffb0d7-a695-45a7-8fa8-b31c9d458865\\media__1784370219138.jpg';
const destDir = path.resolve('src/assets');
const dest = path.join(destDir, 'logo.jpg');

try {
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  
  if (fs.existsSync(source)) {
    fs.copyFileSync(source, dest);
    console.log('Logo copied successfully to src/assets/logo.jpg!');
  } else {
    console.error('Source logo file not found at:', source);
  }
} catch (err) {
  console.error('Error copying logo:', err);
}
