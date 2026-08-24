import { execFileSync } from 'node:child_process';
import {
    accessSync,
    mkdirSync,
    mkdtempSync,
    readdirSync,
    readFileSync,
    rmSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const packageJson = JSON.parse(
    readFileSync(resolve(root, 'package.json'), 'utf8'),
);
const temporaryDirectory = mkdtempSync(join(tmpdir(), 'color-engine-pack-'));

function collectSourceMaps(directory) {
    const sourceMaps = [];

    for (const entry of readdirSync(directory, { withFileTypes: true })) {
        const entryPath = join(directory, entry.name);
        if (entry.isDirectory()) {
            sourceMaps.push(...collectSourceMaps(entryPath));
        } else if (entry.isFile() && entry.name.endsWith('.map')) {
            sourceMaps.push(entryPath);
        }
    }

    return sourceMaps;
}

function verifyPackedSourceMaps(packageDirectory) {
    const sourceMaps = collectSourceMaps(join(packageDirectory, 'dist'));
    if (sourceMaps.length === 0) {
        throw new Error('packed package contains no source maps');
    }

    for (const sourceMapPath of sourceMaps) {
        const sourceMap = JSON.parse(readFileSync(sourceMapPath, 'utf8'));
        if (
            !Array.isArray(sourceMap.sources) ||
            sourceMap.sources.length === 0
        ) {
            throw new Error(`source map contains no sources: ${sourceMapPath}`);
        }

        const sourceRoot =
            typeof sourceMap.sourceRoot === 'string'
                ? sourceMap.sourceRoot
                : '';
        for (const source of sourceMap.sources) {
            if (typeof source !== 'string' || source.length === 0) {
                throw new Error(
                    `source map contains an invalid source: ${sourceMapPath}`,
                );
            }

            const sourcePath = resolve(
                dirname(sourceMapPath),
                sourceRoot,
                source,
            );
            const relativeSource = relative(packageDirectory, sourcePath);
            if (
                isAbsolute(relativeSource) ||
                relativeSource === '..' ||
                relativeSource.startsWith(`..${sep}`)
            ) {
                throw new Error(
                    'source map points outside the package: ' +
                        source +
                        ' in ' +
                        sourceMapPath,
                );
            }

            try {
                accessSync(sourcePath);
            } catch {
                throw new Error(
                    'source map source is not packed: ' +
                        source +
                        ' in ' +
                        sourceMapPath,
                );
            }
        }
    }

    process.stdout.write(
        '  ✓ packed source maps resolve to included sources\n',
    );
}

try {
    execFileSync(
        'npm',
        ['pack', '--ignore-scripts', '--pack-destination', temporaryDirectory],
        {
            cwd: root,
            stdio: 'pipe',
        },
    );

    const tarballName = readdirSync(temporaryDirectory).find((name) =>
        name.endsWith('.tgz'),
    );
    if (!tarballName) {
        throw new Error('npm pack did not produce a tarball');
    }

    const consumerDirectory = join(temporaryDirectory, 'consumer');
    const tarballPath = join(temporaryDirectory, tarballName);
    mkdirSync(consumerDirectory);
    execFileSync(
        'npm',
        [
            'install',
            '--ignore-scripts',
            '--prefix',
            consumerDirectory,
            tarballPath,
        ],
        {
            cwd: root,
            stdio: 'pipe',
        },
    );

    const consumerCode = [
        "const root = await import('@adzazueta/color-engine');",
        'if (root.VERSION !== ' +
            JSON.stringify(packageJson.version) +
            ' || root.ALGORITHM_VERSION !== ' +
            JSON.stringify(packageJson.algorithmVersion) +
            ')',
        "    throw new Error('root metadata mismatch');",
        "await import('@adzazueta/color-engine/adapters/color-extractor');",
        'let blocked = false;',
        'try {',
        "    await import('@adzazueta/color-engine/color');",
        '} catch {',
        '    blocked = true;',
        '}',
        "if (!blocked) throw new Error('internal subpath unexpectedly resolved');",
    ].join('\n');

    execFileSync(
        process.execPath,
        ['--input-type=module', '--eval', consumerCode],
        {
            cwd: consumerDirectory,
            stdio: 'pipe',
        },
    );

    const packedPackage = JSON.parse(
        readFileSync(
            join(
                consumerDirectory,
                'node_modules/@adzazueta/color-engine/package.json',
            ),
            'utf8',
        ),
    );
    if (packedPackage.dependencies !== undefined) {
        throw new Error('packed core package contains runtime dependencies');
    }

    verifyPackedSourceMaps(
        join(consumerDirectory, 'node_modules/@adzazueta/color-engine'),
    );

    process.stdout.write('  ✓ packed consumer verification passed\n');
} finally {
    rmSync(temporaryDirectory, { recursive: true, force: true });
}
