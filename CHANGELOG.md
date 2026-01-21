# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-01-20

### Changed
- Restructured project by flattening core directory structure
  - Moved `src/core/` modules to `src/` root directory
  - Updated all import paths accordingly
- Changed terminology from "automation" to "atomemo" across the codebase
- Updated `@choiceopen/atomemo-plugin-schema` dependency from ^0.1.2 to ^0.1.3

### Removed
- Deprecated schemas and types modules
  - Removed `src/schemas/` directory (schemas now provided by `@choiceopen/atomemo-plugin-schema`)
  - Removed `src/types/` directory (types now exported from `@choiceopen/atomemo-plugin-schema`)
  - Removed `tests/schemas/` directory
- Removed `./schemas` export from package.json

### Added
- Comprehensive project documentation
  - Architecture documentation (`.spec/ARCHITECTURE.md`)
  - README files for all major directories
    - `src/README.md` - Source code overview
    - `src/utils/README.md` - Utility functions documentation
    - `tests/README.md` - Test structure documentation
    - `tests/core/README.md` - Core module tests documentation
    - `tests/utils/README.md` - Utility tests documentation
- OneAuth authentication and configuration system
  - Added `getSession` function to fetch user session data
  - Added session validation in `createPlugin` function
  - Enhanced plugin initialization with user info (name, email)
  - Added organization ID validation

### Fixed
- Fixed test file import paths (from `src/core/` to `src/`)
- Removed tests for unimplemented `data_source` feature
- Fixed build configurations

### Dependencies
- Added `@choiceopen/atomemo-plugin-schema@^0.1.3`
- Added `phoenix@^1.8.3`
- Added `pino-pretty@^13.1.3`
- Added `type-fest@^5.4.1`
- Updated `pino` from `^10.2.0` to `^10.2.1`
- Updated `es-toolkit` from `^1.43.0` to `^1.44.0`

[Unreleased]: https://github.com/choice-open/atomemo-plugin-sdk-js/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/choice-open/atomemo-plugin-sdk-js/releases/tag/v0.1.0
