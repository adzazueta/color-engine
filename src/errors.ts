export const COLOR_ENGINE_INVALID_COLOR = 'COLOR_ENGINE_INVALID_COLOR' as const;
export const COLOR_ENGINE_INVALID_OPTIONS =
    'COLOR_ENGINE_INVALID_OPTIONS' as const;
export const COLOR_ENGINE_UNSUPPORTED_COLOR_SPACE =
    'COLOR_ENGINE_UNSUPPORTED_COLOR_SPACE' as const;
export const COLOR_ENGINE_INVALID_TONE = 'COLOR_ENGINE_INVALID_TONE' as const;
export const COLOR_ENGINE_INVALID_EXTRACTION =
    'COLOR_ENGINE_INVALID_EXTRACTION' as const;
export const COLOR_ENGINE_NO_COLOR_CANDIDATES =
    'COLOR_ENGINE_NO_COLOR_CANDIDATES' as const;

export const COLOR_ENGINE_ERROR_CODES = {
    INVALID_COLOR: COLOR_ENGINE_INVALID_COLOR,
    INVALID_OPTIONS: COLOR_ENGINE_INVALID_OPTIONS,
    UNSUPPORTED_COLOR_SPACE: COLOR_ENGINE_UNSUPPORTED_COLOR_SPACE,
    INVALID_TONE: COLOR_ENGINE_INVALID_TONE,
    INVALID_EXTRACTION: COLOR_ENGINE_INVALID_EXTRACTION,
    NO_COLOR_CANDIDATES: COLOR_ENGINE_NO_COLOR_CANDIDATES,
} as const;

export type ColorEngineErrorCode =
    (typeof COLOR_ENGINE_ERROR_CODES)[keyof typeof COLOR_ENGINE_ERROR_CODES];

export type ColorEngineErrorDetails = Readonly<Record<string, unknown>>;

export class ColorEngineError extends Error {
    readonly code: ColorEngineErrorCode;
    readonly details?: ColorEngineErrorDetails;

    constructor(
        code: ColorEngineErrorCode,
        message: string,
        details?: ColorEngineErrorDetails,
    ) {
        super(message);
        this.name = 'ColorEngineError';
        this.code = code;
        this.details = details;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}

export function isColorEngineError(error: unknown): error is ColorEngineError {
    return error instanceof ColorEngineError;
}
