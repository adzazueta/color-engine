# Contributing to @adzazueta/color-engine

This repository contains a standalone color-intelligence package. It owns color
parsing, color mathematics, gamut mapping, deterministic seed and palette
generation, semantic schemes, intrinsic contrast, diagnostics, and stable
external-color adapters.

It does not own image decoding, complete design themes, CSS serialization,
DOM behavior, typography, spacing, component states, or UI framework
integration.

## Development

Use pnpm and the package scripts defined in package.json:

    pnpm install
    pnpm lint
    pnpm typecheck
    pnpm test
    pnpm build
    pnpm test:smoke
    pnpm verify-exports

Source files use ESM imports with explicit .js extensions. Generated files are
updated through their owning scripts. Do not edit
src/generated/version.ts manually.

## Public contract

The initial public surface is intentionally small:

    @adzazueta/color-engine
    @adzazueta/color-engine/adapters/color-extractor

Do not expose internal modules, add runtime dependencies to core, or change
public exports and generated-color behavior without an approved Linear issue.
Changes that alter observable generated colors require algorithm-version review.

## Verification

Changes affecting package metadata, exports, declarations, build output, or
runtime boundaries must be checked against the built artifacts and packed
consumer behavior. The release gate must pass before publication.

Do not commit secrets, private URLs, proprietary fixtures, personal data, or
unlicensed third-party assets.

## License

This project is licensed under the MIT License. See LICENSE.
