// These imports intentionally remain invalid: option resolution is internal.
// @ts-expect-error -- internal option resolver must not be a root export
import { resolveOptions } from '../src/index.js';

void resolveOptions;

// @ts-expect-error -- internal defaults must not be a root export
import { DEFAULT_OPTIONS } from '../src/index.js';

void DEFAULT_OPTIONS;
