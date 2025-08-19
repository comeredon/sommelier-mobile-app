#!/usr/bin/env node

/**
 * This script generates wine glass app icons for the mobile app.
 * Since we can't easily convert SVG to PNG programmatically without external dependencies,
 * this creates a simple text-based representation that we can use as a placeholder.
 * 
 * For production, you would typically use a design tool or online converter
 * to create proper PNG icons from the SVG.
 */

const fs = require('fs');
const path = require('path');

// SVG content for our wine glass icon
const wineIconSVG = `<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="backgroundGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#fef7ed;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#f5f1eb;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="glassGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#ffffff;stop-opacity:0.9" />
      <stop offset="50%" style="stop-color:#f8fafc;stop-opacity:0.8" />
      <stop offset="100%" style="stop-color:#e2e8f0;stop-opacity:0.7" />
    </linearGradient>
    <linearGradient id="wineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#7c2d12;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#991b1b;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="stemGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#d1d5db;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#9ca3af;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background circle -->
  <circle cx="256" cy="256" r="240" fill="url(#backgroundGradient)" stroke="#7c2d12" stroke-width="6"/>
  
  <!-- Wine glass bowl -->
  <path d="M 180 120 Q 180 100 200 100 L 312 100 Q 332 100 332 120 L 332 180 Q 332 220 312 250 Q 292 280 256 280 Q 220 280 200 250 Q 180 220 180 180 Z" 
        fill="url(#glassGradient)" 
        stroke="#d1d5db" 
        stroke-width="3"/>
  
  <!-- Wine in glass -->
  <path d="M 188 135 Q 188 125 198 125 L 314 125 Q 324 125 324 135 L 324 180 Q 324 210 310 235 Q 296 260 256 260 Q 216 260 202 235 Q 188 210 188 180 Z" 
        fill="url(#wineGradient)" 
        opacity="0.9"/>
  
  <!-- Glass stem -->
  <rect x="248" y="280" width="16" height="120" fill="url(#stemGradient)" rx="8"/>
  
  <!-- Glass base -->
  <ellipse cx="256" cy="410" rx="60" ry="12" fill="url(#stemGradient)"/>
  
  <!-- Glass highlights -->
  <ellipse cx="220" cy="150" rx="20" ry="40" fill="#ffffff" opacity="0.3"/>
  <ellipse cx="280" cy="140" rx="8" ry="20" fill="#ffffff" opacity="0.4"/>
  
  <!-- Wine surface highlight -->
  <ellipse cx="256" cy="125" rx="50" ry="8" fill="#ffffff" opacity="0.2"/>
  
  <!-- Elegant text -->
  <text x="256" y="480" text-anchor="middle" font-family="serif" font-size="24" font-weight="bold" fill="#7c2d12">Sommelier</text>
</svg>`;

// Write the SVG icon
const assetsDir = path.join(__dirname, 'assets', 'images');
fs.writeFileSync(path.join(assetsDir, 'wine-icon.svg'), wineIconSVG);

console.log('✅ Wine icon SVG created at assets/images/wine-icon.svg');
console.log('');
console.log('📝 Next steps:');
console.log('1. Convert the SVG to PNG format using an online tool or design software');
console.log('2. Create the following sizes:');
console.log('   - icon.png (1024x1024) - Main app icon');
console.log('   - adaptive-icon.png (1024x1024) - Android adaptive icon');
console.log('   - favicon.png (32x32) - Web favicon');
console.log('   - splash-icon.png (400x400) - Splash screen icon');
console.log('');
console.log('🔗 Recommended online converters:');
console.log('   - https://cloudconvert.com/svg-to-png');
console.log('   - https://convertio.co/svg-png/');
console.log('   - https://www.zamzar.com/convert/svg-to-png/');
