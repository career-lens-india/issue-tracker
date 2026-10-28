const SUPPORTED = ['dev', 'student', 'production', 'test'];

function resolveAppMode() {
  const raw = process.env.APP_MODE?.trim().toLowerCase();
  if (raw) {
    if (!SUPPORTED.includes(raw)) {
      throw new Error(
        `Unsupported APP_MODE "${process.env.APP_MODE}". Use one of: ${SUPPORTED.join(', ')}`
      );
    }
    return raw;
  }

  if (process.env.NODE_ENV === 'production') {
    return 'production';
  }
  if (process.env.NODE_ENV === 'test') {
    return 'test';
  }
  return 'dev';
}

function usesInMemoryDatabase(mode) {
  return mode === 'dev';
}

function requiresExternalUri(mode) {
  return mode === 'student' || mode === 'production';
}

module.exports = {
  SUPPORTED,
  resolveAppMode,
  usesInMemoryDatabase,
  requiresExternalUri,
};
