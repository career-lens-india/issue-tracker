/** Compare submitted password to a plain-text env var (trimmed). */
function verifyEnvPassword(envVarName, password) {
  const expected = (process.env[envVarName] || '').trim();
  if (!expected || password == null) return false;
  return String(password).trim() === expected;
}

module.exports = { verifyEnvPassword };
