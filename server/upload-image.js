const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const router = express.Router();

const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const safe = Date.now() + '-' + file.originalname.replace(/\s+/g, '-');
    cb(null, safe);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Tipo de archivo no permitido'), false);
  }
});

router.post('/api/upload-image', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file' });
  const fileUrl = `/uploads/${encodeURIComponent(req.file.filename)}`;
  return res.json({ ok: true, url: fileUrl, filename: req.file.filename });
});

router.get('/api/s3-presign', async (req, res) => {
  const { filename, contentType } = req.query;
  if (!filename || !contentType) return res.status(400).json({ error: 'missing params' });

  const bucket = process.env.S3_BUCKET;
  const region = process.env.AWS_REGION || 'us-east-1';
  if (!bucket) return res.status(500).json({ error: 'S3 not configured' });

  const s3 = new S3Client({ region });
  const key = `user-assets/${Date.now()}-${filename.replace(/\s+/g, '-')}`;

  try {
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: contentType,
      ACL: 'private'
    });
    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 });
    return res.json({ uploadUrl, objectKey: key });
  } catch (err) {
    console.error('presign err', err);
    return res.status(500).json({ error: 'presign failed' });
  }
});

module.exports = router;