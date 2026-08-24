import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const directory = dirname(fileURLToPath(import.meta.url));
const root = resolve(directory, '..');
const packageJson = JSON.parse(
    readFileSync(resolve(root, 'package.json'), 'utf8'),
);
const versionSource = readFileSync(
    resolve(root, 'src/generated/version.ts'),
    'utf8',
);

const version = versionSource.match(/export const VERSION = '([^']+)'/)?.[1];
if (!version || version !== packageJson.version) {
    process.stderr.write(
        'error: src/generated/version.ts version ' +
            (version ?? '(missing)') +
            ' does not match package.json version ' +
            packageJson.version +
            '\n',
    );
    process.exit(1);
}

const algorithmVersion = versionSource.match(
    /export const ALGORITHM_VERSION = '([^']+)'/,
)?.[1];
if (
    typeof packageJson.algorithmVersion !== 'string' ||
    !/^\d+$/.test(packageJson.algorithmVersion) ||
    algorithmVersion !== packageJson.algorithmVersion
) {
    process.stderr.write(
        'error: src/generated/version.ts ALGORITHM_VERSION does not match ' +
            'package.json.algorithmVersion\n',
    );
    process.exit(1);
}
