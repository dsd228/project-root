const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const iconsDir = path.join(process.cwd(), 'assets', 'icons'); // assets/icons/

function listSvgs() {
  if (!fs.existsSync(iconsDir)) return [];
  return fs.readdirSync(iconsDir).filter(f => f.endsWith('.svg'));
}

router.get('/api/icons', (req, res) => {
  const files = listSvgs();
  const items = files.map(f => {
    const name = path.basename(f, '.svg');
    return { name, url: `/api/icons/${encodeURIComponent(f)}` };
  });
  res.json({ icons: items });
});

router.get('/api/icons/:file', (req, res) => {
  const file = req.params.file;
  const filePath = path.join(iconsDir, file);
  if (!fs.existsSync(filePath)) return res.status(404).send('Not found');
  res.set('Content-Type', 'image/svg+xml');
  fs.createReadStream(filePath).pipe(res);
});

module.exports = router;