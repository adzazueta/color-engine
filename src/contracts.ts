export type ColorSystemPreset = 'balanced' | 'monochrome';

export type ContrastLevel = 'AA' | 'AAA';

export type ContrastEnforcement = 'adjust' | 'report';

export type SemanticStrategy = 'fixed' | 'harmonized';

export type HexColor = `#${string}`;

export type HexColorInput = HexColor;

export type SrgbColorInput = {
    readonly space: 'srgb';
    readonly r: number;
    readonly g: number;
    readonly b: number;
};

export type OklchColorInput = {
    readonly space: 'oklch';
    readonly l: number;
    readonly c: number;
    readonly h: number | null;
};

export type ColorInput = HexColorInput | SrgbColorInput | OklchColorInput;

export type ColorSeedSet = {
    readonly primary: ColorInput;
    readonly secondary?: ColorInput;
    readonly accent?: ColorInput;
    readonly neutral?: ColorInput;
    readonly neutralVariant?: ColorInput;
    readonly semantic?: {
        readonly success?: ColorInput;
        readonly warning?: ColorInput;
        readonly danger?: ColorInput;
        readonly info?: ColorInput;
    };
};

export type ColorValue = {
    readonly hex: HexColor;
    readonly rgb: {
        readonly r: number;
        readonly g: number;
        readonly b: number;
    };
    readonly oklch: {
        readonly l: number;
        readonly c: number;
        readonly h: number | null;
    };
};

export type ResolvedSeedOrigin = 'provided' | 'generated';

export type SeedRole =
    | 'primary'
    | 'secondary'
    | 'accent'
    | 'neutral'
    | 'neutralVariant'
    | 'success'
    | 'warning'
    | 'danger'
    | 'info';

export type ResolvedColorSeed = {
    readonly color: ColorValue;
    readonly origin: ResolvedSeedOrigin;
    readonly basedOn?: SeedRole;
};

export type ResolvedColorSeedSet = {
    readonly primary: ResolvedColorSeed;
    readonly secondary: ResolvedColorSeed;
    readonly accent: ResolvedColorSeed;
    readonly neutral: ResolvedColorSeed;
    readonly neutralVariant: ResolvedColorSeed;
    readonly semantic: {
        readonly success: ResolvedColorSeed;
        readonly warning: ResolvedColorSeed;
        readonly danger: ResolvedColorSeed;
        readonly info: ResolvedColorSeed;
    };
};

export type Tone = number;

export type TonalStop = {
    readonly tone: Tone;
    readonly color: ColorValue;
};

export type TonalPalette = {
    readonly seed: ColorValue;
    readonly stops: readonly TonalStop[];
};

export type ColorPalettes = {
    readonly primary: TonalPalette;
    readonly secondary: TonalPalette;
    readonly accent: TonalPalette;
    readonly neutral: TonalPalette;
    readonly neutralVariant: TonalPalette;
    readonly semantic: {
        readonly success: TonalPalette;
        readonly warning: TonalPalette;
        readonly danger: TonalPalette;
        readonly info: TonalPalette;
    };
};

export type ColorRole =
    | 'primary'
    | 'onPrimary'
    | 'primaryContainer'
    | 'onPrimaryContainer'
    | 'secondary'
    | 'onSecondary'
    | 'secondaryContainer'
    | 'onSecondaryContainer'
    | 'accent'
    | 'onAccent'
    | 'accentContainer'
    | 'onAccentContainer'
    | 'background'
    | 'onBackground'
    | 'surface'
    | 'onSurface'
    | 'surfaceVariant'
    | 'onSurfaceVariant'
    | 'outline'
    | 'outlineStrong'
    | 'focus'
    | 'success'
    | 'onSuccess'
    | 'successContainer'
    | 'onSuccessContainer'
    | 'warning'
    | 'onWarning'
    | 'warningContainer'
    | 'onWarningContainer'
    | 'danger'
    | 'onDanger'
    | 'dangerContainer'
    | 'onDangerContainer'
    | 'info'
    | 'onInfo'
    | 'infoContainer'
    | 'onInfoContainer';

export type ColorSchemeMode = 'light' | 'dark';

export type ColorScheme<Mode extends ColorSchemeMode = ColorSchemeMode> = {
    readonly mode: Mode;
    readonly roles: Readonly<Record<ColorRole, ColorValue>>;
};

export type ColorSystemMetadata = {
    readonly algorithm: 'adz-color-system';
    readonly algorithmVersion: string;
    readonly workingColorSpace: 'oklch';
    readonly outputColorSpace: 'srgb';
    readonly contrastMethod: 'wcag2';
    readonly preset: ColorSystemPreset;
};

export const COLOR_GAMUT_MAPPED = 'COLOR_GAMUT_MAPPED' as const;
export const SEED_GENERATED = 'SEED_GENERATED' as const;
export const SEED_COLORS_SIMILAR = 'SEED_COLORS_SIMILAR' as const;
export const SEMANTIC_COLOR_HARMONIZED = 'SEMANTIC_COLOR_HARMONIZED' as const;
export const ROLE_TONE_ADJUSTED = 'ROLE_TONE_ADJUSTED' as const;
export const FOREGROUND_ADJUSTED = 'FOREGROUND_ADJUSTED' as const;
export const CONTRAST_TARGET_NOT_REACHED =
    'CONTRAST_TARGET_NOT_REACHED' as const;

export const COLOR_DIAGNOSTIC_CODES = {
    COLOR_GAMUT_MAPPED,
    SEED_GENERATED,
    SEED_COLORS_SIMILAR,
    SEMANTIC_COLOR_HARMONIZED,
    ROLE_TONE_ADJUSTED,
    FOREGROUND_ADJUSTED,
    CONTRAST_TARGET_NOT_REACHED,
} as const;

export type ColorDiagnosticCode =
    (typeof COLOR_DIAGNOSTIC_CODES)[keyof typeof COLOR_DIAGNOSTIC_CODES];

export type ColorDiagnosticSeverity = 'info' | 'warning';

export type ColorDiagnostic = {
    readonly code: ColorDiagnosticCode;
    readonly severity: ColorDiagnosticSeverity;
    readonly path?: string;
    readonly message: string;
    readonly before?: ColorValue;
    readonly after?: ColorValue;
    readonly details?: Readonly<Record<string, unknown>>;
};

export type ColorSystem = {
    readonly seeds: ResolvedColorSeedSet;
    readonly palettes: ColorPalettes;
    readonly schemes: {
        readonly light: ColorScheme<'light'>;
        readonly dark: ColorScheme<'dark'>;
    };
    readonly diagnostics: readonly ColorDiagnostic[];
    readonly metadata: ColorSystemMetadata;
};

export type ContrastMinimums = {
    readonly normalText?: number;
    readonly largeText?: number;
    readonly nonText?: number;
};

export type CreateColorSystemOptions = {
    readonly preset?: ColorSystemPreset;
    readonly palettes?: {
        readonly tones?: readonly number[];
    };
    readonly contrast?: {
        readonly level?: ContrastLevel;
        readonly enforcement?: ContrastEnforcement;
        readonly minimums?: ContrastMinimums;
    };
    readonly semantic?: {
        readonly strategy?: SemanticStrategy;
        readonly harmonyStrength?: number;
    };
};

export type ColorSystemValidationIssue = {
    readonly code: string;
    readonly path: string;
    readonly message: string;
};

export type ContrastUsage = 'normalText' | 'largeText' | 'nonText';

export type ContrastCheckResult = {
    readonly scheme: ColorSchemeMode;
    readonly foreground: ColorRole;
    readonly background: ColorRole;
    readonly usage: ContrastUsage;
    readonly target: number;
    readonly ratio: number;
    readonly pass: boolean;
};

export type ValidateColorSystemReport = {
    readonly valid: boolean;
    readonly issues: readonly ColorSystemValidationIssue[];
    readonly contrast: readonly ContrastCheckResult[];
};
