# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.2.1] - 2026-02-10

### Changed
- Updated dependencies:
  - `@choiceopen/atomemo-plugin-schema` from ^0.2.1 to ^0.2.3
  - `pino` from ^10.2.1 to ^10.3.1
- Improved `CredentialAuthenticateMessage` schema:
  - Added new `credential` field
  - Renamed `parameters` field to `extra`
- Enhanced error handling for credential authentication and tool invocation processes

## [0.2.0] - 2026-02-09

### Added
- Introduced `CredentialAuthenticateMessage` schema for improved credential authentication handling in the plugin
- Added `credential_authenticate` event listener to support credential authentication functionality
- Enhanced error handling for credential authentication responses

### Changed
- Updated dependencies:
  - `@choiceopen/atomemo-plugin-schema` from ^0.1.8 to ^0.2.1
  - `type-fest` from ^5.4.3 to ^5.4.4
  - `dotenv` from ^17.2.3 to ^17.2.4
  - `tsdown` from ^0.19.0 to ^0.20.3
  - `zod` from ^4.3.5 to ^4.3.6
- Improved `ToolInvokeMessage` schema to allow `credentials` field to be optional
- Updated build script to use `--clean` option to ensure fresh builds

### Fixed
- Fixed newline character issue in `transporter.ts`

## [0.1.8] - 2026-02-08

### Fixed
- Enhanced debug mode handling in plugin creation
- Refined topic construction for transporter connection based on mode
- Improved organization ID validation logic to only check in debug mode
- Updated channel topic format for release mode to include organization ID and version

## [0.1.7] - 2026-02-08

### Fixed
- Improved user session handling in debug mode
- Moved user session fetching and organization validation logic under the debug mode condition
- Enhanced error handling for session fetching failures
- Added fallback to read user information from a definition.json file when not in debug mode
- Removed unnecessary ENV logging from plugin run method

## [0.1.6] - 2026-02-06

### Fixed
- Refined HUB_DEBUG_API_KEY validation logic to ensure it is a non-empty string in non-production environments
- Enhanced error handling to provide clearer feedback based on the environment

## [0.1.5] - 2026-02-05

### Chore
- Update dependencies

## [0.1.4] - 2026-02-05

### Changed
- Made `HUB_DEBUG_API_KEY` optional in non-production environments
- Error messages now display debug information only in non-production environments

### Added
- Added logging for `NODE_ENV` in the plugin creation process

## [0.1.3] - 2026-02-02

### Added
- Enhanced debug mode functionality by saving plugin definition to `definition.json` file for easier debugging and inspection

## [0.1.2] - 2026-02-02

### Changed
- Updated `@choiceopen/atomemo-plugin-schema` dependency from ^0.1.3 to ^0.1.8

## [0.1.1] - 2026-02-02

### Changed
- Renamed environment variables for consistency:
  - `HUB_SERVER_WS_URL` → `HUB_WS_URL`
  - `DEBUG_API_KEY` → `HUB_DEBUG_API_KEY`
  - `ORGANIZATION_ID` → `HUB_ORGANIZATION_ID`
- Added `HUB_MODE` environment variable (`"debug"` | `"release"`, defaults to `"debug"`)
- Updated transporter URL construction to include mode in socket path
- Plugin definition now includes `organization_id` field
- Tool invocation now receives `{ credentials, parameters }` instead of just `parameters`
- Plugin registration is now conditional based on `HUB_MODE`

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

[Unreleased]: https://github.com/choice-open/atomemo-plugin-sdk-js/compare/v0.2.1...HEAD
[0.2.1]: https://github.com/choice-open/atomemo-plugin-sdk-js/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/choice-open/atomemo-plugin-sdk-js/compare/v0.1.8...v0.2.0
[0.1.8]: https://github.com/choice-open/atomemo-plugin-sdk-js/compare/v0.1.7...v0.1.8
[0.1.7]: https://github.com/choice-open/atomemo-plugin-sdk-js/compare/v0.1.6...v0.1.7
[0.1.6]: https://github.com/choice-open/atomemo-plugin-sdk-js/compare/v0.1.5...v0.1.6
[0.1.5]: https://github.com/choice-open/atomemo-plugin-sdk-js/compare/v0.1.4...v0.1.5
[0.1.4]: https://github.com/choice-open/atomemo-plugin-sdk-js/compare/v0.1.3...v0.1.4
[0.1.3]: https://github.com/choice-open/atomemo-plugin-sdk-js/compare/v0.1.2...v0.1.3
[0.1.2]: https://github.com/choice-open/atomemo-plugin-sdk-js/compare/v0.1.1...v0.1.2
[0.1.1]: https://github.com/choice-open/atomemo-plugin-sdk-js/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/choice-open/atomemo-plugin-sdk-js/releases/tag/v0.1.0
