const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function convertSvgToPng() {
  const svgPath = path.join(__dirname, 'assets', 'images', 'wine-icon.svg');
  const assetsDir = path.join(__dirname, 'assets', 'images');
  
  try {
    const svgBuffer = fs.readFileSync(svgPath);
    
    // Generate different sizes
    const sizes = [
      { name: 'icon.png', size: 1024 },
      { name: 'adaptive-icon.png', size: 1024 },
      { name: 'favicon.png', size: 32 },
      { name: 'splash-icon.png', size: 400 }
    ];
    
    for (const { name, size } of sizes) {
      const outputPath = path.join(assetsDir, name);
      
      await sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toFile(outputPath);
        
      console.log(`✅ Created ${name} (${size}x${size})`);
    }
    
    console.log('\n🎉 All icon files generated successfully!');
    console.log('Now rebuild your app to see the new wine glass icon.');
    
  } catch (error) {
    console.error('❌ Error converting SVG to PNG:', error);
    console.log('\n📋 Manual steps:');
    console.log('1. Open assets/images/wine-icon.svg in a design tool');
    console.log('2. Export as PNG in these sizes:');
    console.log('   - icon.png (1024x1024)');
    console.log('   - adaptive-icon.png (1024x1024)');
    console.log('   - favicon.png (32x32)');
    console.log('   - splash-icon.png (400x400)');
  }
}

convertSvgToPng();
