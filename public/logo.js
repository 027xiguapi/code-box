const sharp = require('sharp');

const input = '../assets/logo.png'

const output = '../assets/output.png'

sharp(input)
  // .tint({ r: 255, g: 240, b: 16 })
  .linear(0.8, 1.5)
  .toFile(output, (err, info) => {
    if (err) {
      console.error('处理图片出错:', err);
      return;
    }
    console.log('图片处理完成:', info);
  });