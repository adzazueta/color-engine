# @adzazueta/color-engine

Standalone color intelligence for deterministic tonal palettes, semantic light
and dark schemes, WCAG 2 contrast handling, diagnostics, and reproducible
metadata.

The package accepts manual or externally observed seed colors and turns them
into a coherent color system. It is runtime-independent and does not load
images, inspect pixels, serialize CSS, apply DOM state, or depend on a UI
framework.

## Status

The initial package foundation for version 0.1.0 is under active development.
The public generation contracts and algorithms are being added incrementally
behind the approved package boundary.

## Installation

    pnpm add @adzazueta/color-engine

The package is ESM-only and supports Node.js ^20.19.0 or >=22.12.0. The same
runtime-independent build is intended for browser and Node.js consumers.

## Initial public entrypoints

The first release exposes only these entrypoints:

    @adzazueta/color-engine
    @adzazueta/color-engine/adapters/color-extractor

Low-level color, palette, contrast, harmony, scheme, and solver modules remain
internal until a stable consumer need justifies a public contract.

## Version metadata

    import {
        ALGORITHM_VERSION,
        VERSION,
    } from '@adzazueta/color-engine'

    console.log(VERSION)
    console.log(ALGORITHM_VERSION)

The package version identifies the distributed API. The algorithm version
identifies observable generated-color behavior and may change independently.

## Architecture

    optional external color source
              |
              v
    @adzazueta/color-engine
              |
              v
    any downstream consumer

The dependency direction is one-way. External source integration is optional,
manual colors remain first-class, and the core package has zero required runtime
dependencies. The optional adapters/color-extractor entrypoint is the only
boundary for the supported extractor contract; the core never requires it.

## Development

    pnpm install
    pnpm lint
    pnpm typecheck
    pnpm test
    pnpm build
    pnpm test:smoke

Repository tooling and CI conventions are defined directly in this repository.
See TOOLING-DECISIONS.md and CONTRIBUTING.md for development and release
expectations.

## License

MIT. See LICENSE.
