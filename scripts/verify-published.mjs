import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const publishedVersion = process.env.PUBLISHED_VERSION;
const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const packageJson = JSON.parse(
    readFileSync(join(root, 'package.json'), 'utf8'),
);
const packageName = packageJson.name;

if (typeof packageName !== 'string' || !packageName || !publishedVersion) {
    throw new Error(
        'package.json.name and PUBLISHED_VERSION are required to verify a publication',
    );
}

if (typeof packageJson.algorithmVersion !== 'string') {
    throw new Error('package.json.algorithmVersion is required');
}

const consumerDirectory = mkdtempSync(
    join(tmpdir(), 'color-engine-published-'),
);

try {
    writeFileSync(
        join(consumerDirectory, 'package.json'),
        `${JSON.stringify({
            name: 'verify-published',
            private: true,
            type: 'module',
        })}\n`,
        'utf8',
    );

    const packageSpec = `${packageName}@${publishedVersion}`;
    const adapterSpecifier = `${packageName}/adapters/color-extractor`;
    for (let attempt = 1; attempt <= 5; attempt += 1) {
        try {
            execFileSync(
                'npm',
                [
                    'install',
                    '--ignore-scripts',
                    '--no-audit',
                    '--no-fund',
                    '--prefix',
                    consumerDirectory,
                    packageSpec,
                ],
                { stdio: 'inherit' },
            );
            break;
        } catch (error) {
            if (attempt === 5) {
                throw error;
            }
            process.stdout.write(
                'Published package is not available yet; retrying in 10 seconds\n',
            );
            await new Promise((resolvePromise) =>
                setTimeout(resolvePromise, 10_000),
            );
        }
    }

    const consumerCode = [
        `const root = await import(${JSON.stringify(packageName)});`,
        `if (root.VERSION !== ${JSON.stringify(publishedVersion)})`,
        "    throw new Error('published VERSION does not match the release');",
        `if (root.ALGORITHM_VERSION !== ${JSON.stringify(packageJson.algorithmVersion)})`,
        "    throw new Error('published ALGORITHM_VERSION does not match the release');",
        `await import(${JSON.stringify(adapterSpecifier)});`,
    ].join('\n');

    try {
        execFileSync(
            process.execPath,
            ['--input-type=module', '--eval', consumerCode],
            {
                cwd: consumerDirectory,
                stdio: 'inherit',
            },
        );
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(`Consumer verification failed: ${message}`);
    }

    process.stdout.write(
        '  ✓ published package verified in a clean ESM consumer\n',
    );
} finally {
    rmSync(consumerDirectory, { recursive: true, force: true });
}
