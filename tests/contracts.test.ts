import { describe, expect, it } from 'vitest';
import {
    COLOR_ENGINE_INVALID_OPTIONS,
    COLOR_ENGINE_INVALID_TONE,
    ColorEngineError,
} from '../src/index.js';
import { DEFAULT_OPTIONS, resolveOptions } from '../src/options.js';

describe('public contracts and option resolution', () => {
    it('exposes the approved stable error type and codes', () => {
        const error = new ColorEngineError(
            COLOR_ENGINE_INVALID_OPTIONS,
            'invalid options',
        );

        expect(error).toBeInstanceOf(Error);
        expect(error).toBeInstanceOf(ColorEngineError);
        expect(error.name).toBe('ColorEngineError');
        expect(error.code).toBe(COLOR_ENGINE_INVALID_OPTIONS);
    });

    it('resolves documented defaults without sharing mutable tone state', () => {
        const first = resolveOptions();
        const second = resolveOptions();

        expect(DEFAULT_OPTIONS).toMatchObject({
            preset: 'balanced',
            palettes: {
                tones: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95, 100],
            },
            contrast: { level: 'AA', enforcement: 'adjust' },
            semantic: { strategy: 'fixed', harmonyStrength: 0.1 },
        });
        expect(first).toEqual({
            preset: 'balanced',
            palettes: {
                tones: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95, 100],
            },
            contrast: {
                level: 'AA',
                enforcement: 'adjust',
                minimums: { normalText: 4.5, largeText: 3, nonText: 3 },
            },
            semantic: { strategy: 'fixed', harmonyStrength: 0.1 },
        });
        expect(first.palettes.tones).not.toBe(second.palettes.tones);
    });

    it('merges partial options with the AAA profile defaults', () => {
        expect(
            resolveOptions({
                contrast: { level: 'AAA' },
                semantic: { strategy: 'harmonized' },
            }),
        ).toEqual({
            preset: 'balanced',
            palettes: {
                tones: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95, 100],
            },
            contrast: {
                level: 'AAA',
                enforcement: 'adjust',
                minimums: { normalText: 7, largeText: 4.5, nonText: 3 },
            },
            semantic: { strategy: 'harmonized', harmonyStrength: 0.1 },
        });
    });

    it('sorts valid tones and does not mutate the caller array', () => {
        const tones = [80, 0, 50, 100];
        const resolved = resolveOptions({ palettes: { tones } });

        expect(resolved.palettes.tones).toEqual([0, 50, 80, 100]);
        expect(tones).toEqual([80, 0, 50, 100]);
    });

    it.each([
        ['duplicate tones', { palettes: { tones: [10, 10] } }],
        ['out-of-range tone', { palettes: { tones: [101] } }],
    ])('rejects %s with a stable tone error', (_label, options) => {
        expect(() => resolveOptions(options as never)).toThrowError(
            expect.objectContaining({ code: COLOR_ENGINE_INVALID_TONE }),
        );
    });

    it.each([
        ['an empty tone list', { palettes: { tones: [] } }],
        [
            'too many tones',
            {
                palettes: {
                    tones: Array.from({ length: 102 }, (_, index) => index),
                },
            },
        ],
    ])('rejects %s as an invalid option shape', (_label, options) => {
        expect(() => resolveOptions(options as never)).toThrowError(
            expect.objectContaining({ code: COLOR_ENGINE_INVALID_OPTIONS }),
        );
    });

    it.each([
        ['a top-level key', { future: true }],
        ['a palette key', { palettes: { tones: [], future: true } }],
        ['a contrast key', { contrast: { level: 'AA', future: true } }],
        ['a semantic key', { semantic: { strategy: 'fixed', future: true } }],
    ])('rejects %s as an unknown option', (_label, options) => {
        expect(() => resolveOptions(options as never)).toThrowError(
            expect.objectContaining({
                code: COLOR_ENGINE_INVALID_OPTIONS,
            }),
        );
    });

    it.each([
        ['the options object', null],
        ['a palette group', { palettes: null }],
        ['a contrast field', { contrast: { level: null } }],
        ['a tone field', { palettes: { tones: null } }],
        ['a semantic field', { semantic: { harmonyStrength: null } }],
    ])('does not treat %s null as omitted', (_label, options) => {
        expect(() => resolveOptions(options as never)).toThrowError(
            expect.objectContaining({
                code: COLOR_ENGINE_INVALID_OPTIONS,
            }),
        );
    });

    it.each([0.999, 21.001, Number.NaN, Number.POSITIVE_INFINITY])(
        'rejects contrast minimum %s outside the WCAG ratio range',
        (value) => {
            expect(() =>
                resolveOptions({
                    contrast: { minimums: { normalText: value } },
                }),
            ).toThrowError(
                expect.objectContaining({
                    code: COLOR_ENGINE_INVALID_OPTIONS,
                }),
            );
        },
    );

    it('accepts the inclusive WCAG ratio bounds for contrast minimums', () => {
        expect(
            resolveOptions({
                contrast: {
                    minimums: {
                        normalText: 1,
                        largeText: 21,
                        nonText: 1,
                    },
                },
            }).contrast.minimums,
        ).toEqual({ normalText: 1, largeText: 21, nonText: 1 });
    });

    it('does not mutate nested consumer options while resolving them', () => {
        const options = {
            palettes: { tones: [80, 0, 50] },
            contrast: {
                level: 'AAA' as const,
                minimums: { normalText: 7.5 },
            },
            semantic: {
                strategy: 'harmonized' as const,
                harmonyStrength: 0.4,
            },
        };
        const before = JSON.parse(JSON.stringify(options));

        const resolved = resolveOptions(options);

        expect(options).toEqual(before);
        expect(resolved.palettes.tones).not.toBe(options.palettes.tones);
        expect(resolved.contrast.minimums).not.toBe(options.contrast.minimums);
    });

    it.each([
        ['an unsupported preset', { preset: 'vivid' }],
        ['a null options group', { semantic: null }],
        ['an invalid harmony strength', { semantic: { harmonyStrength: 1.1 } }],
        [
            'an invalid contrast minimum',
            { contrast: { minimums: { normalText: 0 } } },
        ],
    ])('rejects %s with a stable options error', (_label, options) => {
        expect(() => resolveOptions(options as never)).toThrowError(
            expect.objectContaining({ code: COLOR_ENGINE_INVALID_OPTIONS }),
        );
    });
});
