const fs = require('fs');

const html = fs.readFileSync('stitch_ui/BasketIQ_Home_Page.html', 'utf8');
const configMatch = html.match(/tailwind\.config = (\{[\s\S]*?\});/);
if (!configMatch) throw new Error('No config found');

const config = JSON.parse(configMatch[1].replace(/,\s*\}/g, '}').replace(/,\s*\]/g, ']'));
const theme = config.theme.extend;

let css = `
@theme {
`;

// Colors
for (const [key, value] of Object.entries(theme.colors)) {
  css += `  --color-${key}: ${value};\n`;
}

// Spacing
for (const [key, value] of Object.entries(theme.spacing)) {
  css += `  --spacing-${key}: ${value};\n`;
}

// BorderRadius
for (const [key, value] of Object.entries(theme.borderRadius)) {
  if (key === 'DEFAULT') {
    css += `  --radius: ${value};\n`;
  } else {
    css += `  --radius-${key}: ${value};\n`;
  }
}

// FontFamily
for (const [key, value] of Object.entries(theme.fontFamily)) {
  css += `  --font-${key}: '${value[0]}', sans-serif;\n`;
}

// FontSize
for (const [key, value] of Object.entries(theme.fontSize)) {
  css += `  --text-${key}: ${value[0]};\n`;
  if (value[1].lineHeight) {
    css += `  --text-${key}--line-height: ${value[1].lineHeight};\n`;
  }
  if (value[1].letterSpacing) {
    css += `  --text-${key}--letter-spacing: ${value[1].letterSpacing};\n`;
  }
  if (value[1].fontWeight) {
    css += `  --text-${key}--font-weight: ${value[1].fontWeight};\n`;
  }
}

css += `}
`;

fs.writeFileSync('generated_theme.css', css);
console.log('generated_theme.css created');
