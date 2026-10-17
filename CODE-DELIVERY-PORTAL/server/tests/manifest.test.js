const path = require('path');
const fs = require('fs');

describe('manifest validation', () => {
  const materialsRoot = path.resolve(__dirname, '../../../APPLICATION/student-materials');
  const manifestPath = path.join(materialsRoot, 'manifest.json');

  test('manifest exists and defines ten stages', () => {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    expect(manifest.stages).toHaveLength(10);
    const orders = manifest.stages.map((s) => s.order).sort((a, b) => a - b);
    expect(orders).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  test('each stage has stage.json matching manifest id', () => {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    const missing = [];
    manifest.stages.forEach((s) => {
      const stageJsonPath = path.join(materialsRoot, 'stages', s.id, 'stage.json');
      if (!fs.existsSync(stageJsonPath)) {
        missing.push(stageJsonPath);
        return;
      }
      const stageJson = JSON.parse(fs.readFileSync(stageJsonPath, 'utf8'));
      if (stageJson.id !== s.id) {
        missing.push(`id mismatch ${s.id}`);
      }
    });
    expect(missing).toEqual([]);
  });

  test('solution directories exist; starter present where stage.json lists files', () => {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    const problems = [];
    manifest.stages.forEach((s) => {
      const solution = path.join(materialsRoot, 'stages', s.id, 'solution');
      if (!fs.existsSync(solution)) problems.push(`${s.id} solution`);
      const stageJsonPath = path.join(materialsRoot, 'stages', s.id, 'stage.json');
      const stageJson = JSON.parse(fs.readFileSync(stageJsonPath, 'utf8'));
      (stageJson.starterFiles || []).forEach((rel) => {
        const full = path.join(materialsRoot, 'stages', s.id, rel);
        if (!fs.existsSync(full)) problems.push(`${s.id} missing ${rel}`);
      });
    });
    expect(problems).toEqual([]);
  });
});
