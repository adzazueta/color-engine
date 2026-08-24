import { access, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
let passed = 0;
let failed = 0;

function assert(condition, label) {
    if (condition) {
        passed += 1;
        process.stdout.write(`  ✓ ${label}\n`);
    } else {
        failed += 1;
        process.stdout.write(`  ✗ ${label}\n`);
    }
}

async function main() {
    process.stdout.write('\nBuild entrypoint smoke tests\n');

    const files = [
        'dist/index.js',
        'dist/index.d.ts',
        'dist/index.js.map',
        'dist/adapters/color-extractor.js',
        'dist/adapters/color-extractor.d.ts',
    ];

    for (const relativePath of files) {
        try {
            await access(resolve(root, relativePath));
            assert(true, `built artifact exists: ${relativePath}`);
        } catch {
            assert(false, `built artifact exists: ${relativePath}`);
        }
    }

    const packageJson = JSON.parse(
        await readFile(resolve(root, 'package.json'), 'utf8'),
    );
    const rootEntry = await import(
        pathToFileURL(resolve(root, 'dist/index.js')).href
    );
    try {
        await import(
            pathToFileURL(resolve(root, 'dist/adapters/color-extractor.js'))
                .href
        );
        assert(true, 'adapter entrypoint imports successfully');
    } catch {
        assert(false, 'adapter entrypoint imports successfully');
    }

    assert(
        rootEntry.VERSION === packageJson.version,
        'root VERSION matches package.json',
    );
    assert(
        rootEntry.ALGORITHM_VERSION === packageJson.algorithmVersion,
        'root ALGORITHM_VERSION matches package.json',
    );

    const rootCode = await readFile(resolve(root, 'dist/index.js'), 'utf8');
    const adapterCode = await readFile(
        resolve(root, 'dist/adapters/color-extractor.js'),
        'utf8',
    );
    assert(!rootCode.includes('node:'), 'root bundle has no Node-only imports');
    assert(
        !adapterCode.includes('node:'),
        'adapter bundle has no Node-only imports',
    );

    process.stdout.write(`\n  Total: ${passed} passed, ${failed} failed\n\n`);
    process.exit(failed > 0 ? 1 : 0);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
