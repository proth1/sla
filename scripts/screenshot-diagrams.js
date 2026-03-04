const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  const filePath = path.resolve(__dirname, '../docs/presentations/index.html');
  await page.goto(`file://${filePath}`);
  await page.waitForTimeout(1000);

  // Get all slides with diagram containers
  const slideInfo = await page.evaluate(() => {
    const slides = document.querySelectorAll('.slide');
    const results = [];
    slides.forEach((slide, i) => {
      const diagram = slide.querySelector('.diagram-container img');
      if (diagram) {
        const caption = slide.querySelector('.diagram-container p');
        results.push({
          index: i,
          src: diagram.getAttribute('src'),
          caption: caption ? caption.textContent.trim() : `Slide ${i}`,
          dataSlide: slide.getAttribute('data-slide')
        });
      }
    });
    return results;
  });

  console.log(`Found ${slideInfo.length} diagram slides\n`);

  const outDir = path.resolve(__dirname, '../docs/presentations/screenshots');
  const fs = require('fs');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  for (const info of slideInfo) {
    // Scroll to the slide
    await page.evaluate((idx) => {
      const slides = document.querySelectorAll('.slide');
      slides[idx].scrollIntoView({ behavior: 'instant' });
    }, info.index);
    await page.waitForTimeout(500);

    const filename = info.src.replace('images/', '').replace('.svg', '.png');
    await page.screenshot({
      path: path.join(outDir, filename),
      fullPage: false
    });
    console.log(`✓ Slide ${info.index}: ${info.caption} → ${filename}`);
  }

  // Also screenshot the full slide for context
  for (const info of slideInfo) {
    await page.evaluate((idx) => {
      const slides = document.querySelectorAll('.slide');
      slides[idx].scrollIntoView({ behavior: 'instant' });
    }, info.index);
    await page.waitForTimeout(300);

    // Get just the diagram container bounds
    const box = await page.evaluate((idx) => {
      const slides = document.querySelectorAll('.slide');
      const container = slides[idx].querySelector('.diagram-container');
      if (!container) return null;
      const rect = container.getBoundingClientRect();
      return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
    }, info.index);

    if (box && box.width > 0 && box.height > 0) {
      const filename = info.src.replace('images/', '').replace('.svg', '-diagram-only.png');
      await page.screenshot({
        path: path.join(outDir, filename),
        clip: { x: Math.max(0, box.x), y: Math.max(0, box.y), width: Math.min(box.width, 1440), height: Math.min(box.height, 900) }
      });
      console.log(`  → cropped: ${filename} (${Math.round(box.width)}x${Math.round(box.height)})`);
    }
  }

  await browser.close();
  console.log('\nDone!');
})();
