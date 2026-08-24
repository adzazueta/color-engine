import { access, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const packageJson = JSON.parse(
    await readFile(resolve(root, 'package.json'), 'utf8'),
);
const expectedExports = ['.', './adapters/color-extractor'];
const actualExports = Object.keys(packageJson.exports);

if (
    actualExports.length !== expectedExports.length ||
    expectedExports.some((entry) => !actualExports.includes(entry))
) {
    throw new Error(
        `package exports must contain only: ${expectedExports.join(', ')}`,
    );
}

if (packageJson.dependencies !== undefined) {
    throw new Error('color-engine core must not declare runtime dependencies');
}

if (packageJson.sideEffects !== false) {
    throw new Error('package.json must declare sideEffects: false');
}

if (
    typeof packageJson.algorithmVersion !== 'string' ||
    !/^\d+$/.test(packageJson.algorithmVersion)
) {
    throw new Error('package.json must declare a numeric algorithmVersion');
}

for (const entry of expectedExports) {
    const target = packageJson.exports[entry];
    for (const condition of ['types', 'import', 'default']) {
        if (typeof target?.[condition] !== 'string') {
            throw new Error(`missing ${condition} target for export ${entry}`);
        }
        await access(resolve(root, target[condition]));
    }
}

for (const requiredFile of [
    'dist/index.js',
    'dist/index.d.ts',
    'dist/adapters/color-extractor.js',
    'dist/adapters/color-extractor.d.ts',
]) {
    await access(resolve(root, requiredFile));
}

process.stdout.write(
    `  ✓ verified ${expectedExports.length} public package exports\n`,
);
