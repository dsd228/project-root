// Ejemplo minimalista: Express endpoint para entitlements (JWT signed).
// - Producción: reemplazar el store de usuarios por DB, validar sesión via cookies / session store.
// - Opcional: devolver signed URL S3 en lugar de bundleUrl directo.

const express = require('express');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const JWT_SECRET = process.env.ENTITLEMENT_SECRET || 'replace-with-secure-secret';
const BUNDLE_BASE_URL = process.env.BUNDLE_BASE_URL || 'https://cdn.example.com/premium/'; // puede ser S3 signed

// Mocked user store: en producción usar DB
const userStore = {
  'user-1': { id: 'user-1', email: 'user@example.com', subscriptions: ['pro'] },
  'user-2': { id: 'user-2', email: 'free@example.com', subscriptions: [] },
};

function checkUserHasFeature(userId, feature) {
  const user = userStore[userId];
  if (!user) return false;
  // Mapear features a suscripciones/planes
  const featureMapping = {
    'ai-assistant': 'pro',
    'auto-layout': 'pro',
    'export-pdf': 'pro',
  };
  const required = featureMapping[feature];
  if (!required) return false;
  return user.subscriptions.includes(required);
}

app.get('/api/entitlement', (req, res) => {
  // Autenticación simplificada: X-User header (sustituir por cookie/session/JWT real)
  const userId = req.header('X-User');
  const feature = req.query.feature;
  if (!userId || !feature) return res.status(400).json({ error: 'missing user or feature' });

  if (checkUserHasFeature(userId, feature)) {
    // Generar JWT corto con claim del feature
    const token = jwt.sign({
      sub: userId,
      feature,
      aud: 'project-root',
    }, JWT_SECRET, { expiresIn: '5m' });

    // Opcional: calcular URL firmado a S3 u otro storage. Aquí devolvemos la URL pública del bundle (mejor si es signed)
    const bundleUrl = `${BUNDLE_BASE_URL}${feature}.bundle.js`;

    return res.json({ authorized: true, token, bundleUrl });
  }

  // No autorizado -> sugerir upgrade
  return res.json({ authorized: false, upgradeUrl: '/pricing?from=feature' });
});

// Endpoint para verificar token (middleware en endpoints premium)
app.get('/api/verify-token', (req, res) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ ok: false });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    return res.json({ ok: true, payload });
  } catch (err) {
    return res.status(401).json({ ok: false, error: 'invalid token' });
  }
});

if (require.main === module) {
  app.listen(4000, () => console.log('Entitlement service running on :4000'));
}

module.exports = app;
