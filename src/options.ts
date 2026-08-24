import type {
    ColorSystemPreset,
    ContrastEnforcement,
    ContrastLevel,
    CreateColorSystemOptions,
    SemanticStrategy,
} from './contracts.js';
import {
    COLOR_ENGINE_INVALID_OPTIONS,
    COLOR_ENGINE_INVALID_TONE,
    ColorEngineError,
} from './errors.js';

export type ResolvedContrastMinimums = {
    readonly normalText: number;
    readonly largeText: number;
    readonly nonText: number;
};

export type ResolvedCreateColorSystemOptions = {
    readonly preset: ColorSystemPreset;
    readonly palettes: {
        readonly tones: readonly number[];
    };
    readonly contrast: {
        readonly level: ContrastLevel;
        readonly enforcement: ContrastEnforcement;
        readonly minimums: ResolvedContrastMinimums;
    };
    readonly semantic: {
        readonly strategy: SemanticStrategy;
        readonly harmonyStrength: number;
    };
};

type DefaultOptions = {
    readonly preset: ColorSystemPreset;
    readonly palettes: {
        readonly tones: readonly number[];
    };
    readonly contrast: {
        readonly level: ContrastLevel;
        readonly enforcement: ContrastEnforcement;
        readonly minimums: Readonly<
            Record<ContrastLevel, ResolvedContrastMinimums>
        >;
    };
    readonly semantic: {
        readonly strategy: SemanticStrategy;
        readonly harmonyStrength: number;
    };
};

export const DEFAULT_OPTIONS = {
    preset: 'balanced',
    palettes: {
        tones: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95, 100],
    },
    contrast: {
        level: 'AA',
        enforcement: 'adjust',
        minimums: {
            AA: {
                normalText: 4.5,
                largeText: 3,
                nonText: 3,
            },
            AAA: {
                normalText: 7,
                largeText: 4.5,
                nonText: 3,
            },
        },
    },
    semantic: {
        strategy: 'fixed',
        harmonyStrength: 0.1,
    },
} as const satisfies DefaultOptions;

const TOP_LEVEL_KEYS = ['preset', 'palettes', 'contrast', 'semantic'] as const;
const PALETTE_KEYS = ['tones'] as const;
const CONTRAST_KEYS = ['level', 'enforcement', 'minimums'] as const;
const MINIMUM_KEYS = ['normalText', 'largeText', 'nonText'] as const;
const SEMANTIC_KEYS = ['strategy', 'harmonyStrength'] as const;

type UnknownRecord = Record<string, unknown>;

function isPlainRecord(value: unknown): value is UnknownRecord {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        return false;
    }

    const prototype = Object.getPrototypeOf(value);
    return prototype === Object.prototype || prototype === null;
}

function invalidOptions(path: string, message: string): never {
    throw new ColorEngineError(
        COLOR_ENGINE_INVALID_OPTIONS,
        `${path}: ${message}`,
        { path },
    );
}

function invalidTone(path: string, message: string): never {
    throw new ColorEngineError(
        COLOR_ENGINE_INVALID_TONE,
        `${path}: ${message}`,
        {
            path,
        },
    );
}

function assertKnownKeys(
    value: UnknownRecord,
    keys: readonly string[],
    path: string,
): void {
    for (const key of Object.keys(value)) {
        if (!keys.includes(key)) {
            invalidOptions(`${path}.${key}`, 'unknown option');
        }
    }
}

function readEnum<T extends string>(
    value: unknown,
    allowed: readonly T[],
    path: string,
    fallback: T,
): T {
    if (value === undefined) {
        return fallback;
    }
    if (typeof value !== 'string' || !allowed.includes(value as T)) {
        invalidOptions(path, `must be one of: ${allowed.join(', ')}`);
    }
    return value as T;
}

function readFiniteNumber(
    value: unknown,
    path: string,
    minimum: number,
    maximum: number,
): number {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
        invalidOptions(path, 'must be a finite number');
    }
    if (value < minimum || value > maximum) {
        invalidOptions(path, `must be between ${minimum} and ${maximum}`);
    }
    return value;
}

function resolveTones(value: unknown): readonly number[] {
    if (value === undefined) {
        return [...DEFAULT_OPTIONS.palettes.tones];
    }
    if (!Array.isArray(value)) {
        invalidOptions('palettes.tones', 'must be an array of numbers');
    }
    if (value.length < 1 || value.length > 101) {
        invalidOptions(
            'palettes.tones',
            'must contain between 1 and 101 tones',
        );
    }

    const seen = new Set<number>();
    const tones: number[] = [];
    for (const [index, tone] of value.entries()) {
        if (
            typeof tone !== 'number' ||
            !Number.isFinite(tone) ||
            tone < 0 ||
            tone > 100
        ) {
            invalidTone(
                `palettes.tones[${index}]`,
                'must be a finite number between 0 and 100',
            );
        }

        const normalizedTone = tone === 0 ? 0 : tone;
        if (seen.has(normalizedTone)) {
            invalidTone(
                `palettes.tones[${index}]`,
                `duplicates tone ${normalizedTone}`,
            );
        }
        seen.add(normalizedTone);
        tones.push(normalizedTone);
    }

    return tones.sort((left, right) => left - right);
}

function resolveMinimums(
    value: unknown,
    level: ContrastLevel,
): ResolvedContrastMinimums {
    if (value !== undefined && !isPlainRecord(value)) {
        invalidOptions('contrast.minimums', 'must be an object');
    }

    const defaults = DEFAULT_OPTIONS.contrast.minimums[level];
    const minimums: Record<'normalText' | 'largeText' | 'nonText', number> = {
        normalText: defaults.normalText,
        largeText: defaults.largeText,
        nonText: defaults.nonText,
    };

    if (value === undefined) {
        return minimums;
    }

    assertKnownKeys(value, MINIMUM_KEYS, 'contrast.minimums');
    for (const key of MINIMUM_KEYS) {
        const override = value[key];
        if (override !== undefined) {
            minimums[key] = readFiniteNumber(
                override,
                `contrast.minimums.${key}`,
                1,
                21,
            );
        }
    }

    return minimums;
}

export function resolveOptions(
    options?: CreateColorSystemOptions,
): ResolvedCreateColorSystemOptions {
    const input: unknown = options === undefined ? {} : options;
    if (!isPlainRecord(input)) {
        invalidOptions('options', 'must be an object');
    }

    assertKnownKeys(input, TOP_LEVEL_KEYS, 'options');

    const preset = readEnum(
        input.preset,
        ['balanced', 'monochrome'],
        'preset',
        DEFAULT_OPTIONS.preset,
    );

    const palettesValue = input.palettes;
    if (palettesValue !== undefined && !isPlainRecord(palettesValue)) {
        invalidOptions('palettes', 'must be an object');
    }
    if (palettesValue !== undefined) {
        assertKnownKeys(palettesValue, PALETTE_KEYS, 'palettes');
    }
    const palettes = {
        tones: resolveTones(palettesValue?.tones),
    };

    const contrastValue = input.contrast;
    if (contrastValue !== undefined && !isPlainRecord(contrastValue)) {
        invalidOptions('contrast', 'must be an object');
    }
    if (contrastValue !== undefined) {
        assertKnownKeys(contrastValue, CONTRAST_KEYS, 'contrast');
    }
    const level = readEnum(
        contrastValue?.level,
        ['AA', 'AAA'],
        'contrast.level',
        DEFAULT_OPTIONS.contrast.level,
    );
    const enforcement = readEnum(
        contrastValue?.enforcement,
        ['adjust', 'report'],
        'contrast.enforcement',
        DEFAULT_OPTIONS.contrast.enforcement,
    );
    const contrast = {
        level,
        enforcement,
        minimums: resolveMinimums(contrastValue?.minimums, level),
    };

    const semanticValue = input.semantic;
    if (semanticValue !== undefined && !isPlainRecord(semanticValue)) {
        invalidOptions('semantic', 'must be an object');
    }
    if (semanticValue !== undefined) {
        assertKnownKeys(semanticValue, SEMANTIC_KEYS, 'semantic');
    }
    const strategy = readEnum(
        semanticValue?.strategy,
        ['fixed', 'harmonized'],
        'semantic.strategy',
        DEFAULT_OPTIONS.semantic.strategy,
    );
    const harmonyStrength =
        semanticValue?.harmonyStrength === undefined
            ? DEFAULT_OPTIONS.semantic.harmonyStrength
            : readFiniteNumber(
                  semanticValue.harmonyStrength,
                  'semantic.harmonyStrength',
                  0,
                  1,
              );

    return {
        preset,
        palettes,
        contrast,
        semantic: {
            strategy,
            harmonyStrength,
        },
    };
}
