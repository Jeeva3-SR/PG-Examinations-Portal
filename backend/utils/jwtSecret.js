const DEFAULT_DEV_JWT_SECRET = 'pg-examinations-portal-dev-secret';

let warnedAboutFallback = false;

function getJwtSecret() {
  const configuredSecret = process.env.JWT_SECRET;

  if (configuredSecret) {
    return configuredSecret;
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET is not set');
  }

  if (!warnedAboutFallback) {
    warnedAboutFallback = true;
    console.warn('JWT_SECRET is not set. Using a development fallback secret.');
  }

  return DEFAULT_DEV_JWT_SECRET;
}

module.exports = {
  getJwtSecret,
};