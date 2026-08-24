import { defineConfig } from 'tsdown';

export default defineConfig({
    entry: {
        index: 'src/index.ts',
        'adapters/color-extractor': 'src/adapters/color-extractor.ts',
    },
    format: ['esm'],
    dts: {
        sourcemap: true,
    },
    clean: true,
    platform: 'neutral',
    sourcemap: true,
    publint: true,
});
