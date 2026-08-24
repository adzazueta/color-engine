import { describe, expect, it } from 'vitest';
import * as publicApi from '../src/index.js';

const runtimeExports = [
    'ALGORITHM_VERSION',
    'COLOR_DIAGNOSTIC_CODES',
    'COLOR_ENGINE_ERROR_CODES',
    'COLOR_ENGINE_INVALID_COLOR',
    'COLOR_ENGINE_INVALID_EXTRACTION',
    'COLOR_ENGINE_INVALID_OPTIONS',
    'COLOR_ENGINE_INVALID_TONE',
    'COLOR_ENGINE_NO_COLOR_CANDIDATES',
    'COLOR_ENGINE_UNSUPPORTED_COLOR_SPACE',
    'COLOR_GAMUT_MAPPED',
    'CONTRAST_TARGET_NOT_REACHED',
    'ColorEngineError',
    'FOREGROUND_ADJUSTED',
    'ROLE_TONE_ADJUSTED',
    'SEED_COLORS_SIMILAR',
    'SEED_GENERATED',
    'SEMANTIC_COLOR_HARMONIZED',
    'VERSION',
    'isColorEngineError',
].sort();

describe('public package surface', () => {
    it('keeps the approved runtime exports explicit and stable', () => {
        expect(Object.keys(publicApi).sort()).toEqual(runtimeExports);
    });
});
