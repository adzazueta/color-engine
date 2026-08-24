import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { ALGORITHM_VERSION, VERSION } from '../../src/generated/version.js';

const root = resolve(import.meta.dirname, '../..');
const packageJson = JSON.parse(
    readFileSync(resolve(root, 'package.json'), 'utf8'),
) as {
    name: string;
    version: string;
    algorithmVersion: string;
    type: string;
    packageManager: string;
    engines: { node: string };
    sideEffects: boolean;
    files: string[];
    dependencies?: Record<string, string>;
    exports: Record<string, unknown>;
    scripts: Record<string, string>;
};

describe('package foundation', () => {
    it('uses the standalone ESM package identity', () => {
        expect(packageJson.name).toBe('@adzazueta/color-engine');
        expect(packageJson.type).toBe('module');
        expect(packageJson.packageManager).toBe('pnpm@10.7.0');
        expect(packageJson.engines.node).toBe('^20.19.0 || >=22.12.0');
        expect(packageJson.algorithmVersion).toBe('1');
        expect(packageJson.files).toContain('src');
        expect(packageJson.sideEffects).toBe(false);
        expect(packageJson.dependencies).toBeUndefined();
    });

    it('keeps package and generated versions synchronized', () => {
        expect(VERSION).toBe(packageJson.version);
        expect(ALGORITHM_VERSION).toBe('1');
    });

    it('exposes only the approved initial entrypoints', () => {
        expect(Object.keys(packageJson.exports)).toEqual([
            '.',
            './adapters/color-extractor',
        ]);
        expect(packageJson.exports['.']).toMatchObject({
            types: './dist/index.d.ts',
            import: './dist/index.js',
            default: './dist/index.js',
        });
        expect(packageJson.exports['./adapters/color-extractor']).toMatchObject(
            {
                types: './dist/adapters/color-extractor.d.ts',
                import: './dist/adapters/color-extractor.js',
                default: './dist/adapters/color-extractor.js',
            },
        );
    });

    it('provides the required quality and release scripts', () => {
        expect(packageJson.scripts).toMatchObject({
            build: 'pnpm sync-version && tsdown',
            lint: 'biome check .',
            'lint:fix': 'biome check --write .',
            typecheck: 'tsc --noEmit',
            test: 'vitest run',
            'test:watch': 'vitest',
            'test:pack': 'node scripts/verify-packed.mjs',
            release: 'changeset publish',
            'release:check': expect.stringContaining('pnpm verify-exports'),
            prepublishOnly: 'pnpm release:check',
        });
    });
});
