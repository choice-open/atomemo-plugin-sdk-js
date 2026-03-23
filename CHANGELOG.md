# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.6.0] - 2026-03-23

### Added

- Added `locator_list` channel event handler to support resource locator listing with filter and pagination support
- Added `resource_mapping` channel event handler to support resource field mapping

### Changed

- Updated `@choiceopen/atomemo-plugin-schema` from ^0.5.4 to ^0.6.0

### Fixed

- `serializeFeature` now omits `locator_list` and `resource_mapping` from serialized tool definitions (these are runtime-only handler maps and should not be sent to the server)

## [0.5.4] - 2026-03-16

### Changed

- Updated `@choiceopen/atomemo-plugin-schema` from ^0.5.3 to ^0.5.4

## [0.5.3] - 2026-03-16

### Changed

- Updated `@choiceopen/atomemo-plugin-schema` from ^0.5.2 to ^0.5.3

## [0.5.2] - 2026-03-13

### Changed

- Updated `@choiceopen/atomemo-plugin-schema` from ^0.5.1 to ^0.5.2

## [0.5.1] - 2026-03-13

### Changed

- Updated `@choiceopen/atomemo-plugin-schema` from ^0.5.0 to ^0.5.1

### Fixed

- Aligned `PluginContext.files` helpers with the latest schema by treating optional `FileRef` fields (`content`, `remote_url`, `size`, `extension`, `mime_type`, `res_key`, `filename`) as nullable and preserving existing OSS `file_ref` objects when re-uploading

## [0.5.0] - 2026-03-13

### Added

- OAuth2 credential flow support: channel handlers for `oauth2_build_authorize_url`, `oauth2_get_token`, and `oauth2_refresh_token` with request/response and error routing; credential definitions may implement `oauth2_build_authorize_url`, `oauth2_get_token`, and `oauth2_refresh_token` methods

### Changed

- Updated `@choiceopen/atomemo-plugin-schema` from ^0.4.1 to ^0.5.0

### Fixed

## [0.4.0] - 2026-03-11

### Added

- Added `PluginContext.files` helpers for file workflows:
  - `parseFileRef()` to validate `file_ref` payloads
  - `attachRemoteUrl()` to resolve OSS download URLs from the Hub
  - `download()` to fetch OSS-backed files into in-memory `FileRef` objects
  - `upload()` to upload in-memory files through Hub-issued presigned URLs, with optional `prefixKey`
- Added `createHubCaller()` RPC support for `hub_call:{event}` requests, including response/error routing, timeout handling, and disposal cleanup
- Added recursive `parseFileRefs()` handling so nested `file_ref` values in tool parameters are validated before tool invocation
- Added test coverage for Hub RPC calls, file context helpers, and recursive `file_ref` parsing

### Changed

- Aligned the SDK runtime with the websocket Hub protocol:
  - Tool and credential handlers now receive `context`
  - Tool invocation payloads now accept optional `plugin_identifier`
  - Credential authentication payloads now allow optional `extra`
  - Debug-mode plugin registration now waits for Hub acknowledgement before writing `definition.json`
- Updated source and test documentation to cover Hub RPC, file context APIs, recursive `file_ref` parsing, and expanded test coverage

## [0.3.5] - 2026-03-11

### Changed

- Updated dependencies:
  - `@choiceopen/atomemo-plugin-schema` from `link:@choiceopen/atomemo-plugin-schema` to `^0.4.0`
  - `phoenix` from `^1.8.4` to `^1.8.5`
- Updated dev dependencies:
  - `@biomejs/biome` from `^2.4.5` to `^2.4.6`
  - `es-toolkit` from `^1.45.0` to `^1.45.1`

## [0.3.4] - 2026-03-04

### Changed

- Updated `@choiceopen/atomemo-plugin-schema` from ^0.2.15 to ^0.2.16

## [0.3.3] - 2026-03-03

### Added

- Added `serializeError` utility to safely convert `Error` instances (including causes and custom properties) into JSON-serializable payloads
- Plugin error handling for credential authentication and tool invocation now uses `serializeError` when reporting failures over the transporter channel

### Changed

- Updated `EnvSchema` to require `HUB_WS_URL` to be a valid `ws://` or `wss://` URL and refined `DEBUG` behavior based on `NODE_ENV`
- Added `__resetEnvForTesting` helper to allow resetting cached environment values in tests
- Updated dev dependencies:
  - `@biomejs/biome` from ^2.4.4 to ^2.4.5
  - `@types/bun` from ^1.3.9 to ^1.3.10
  - `es-toolkit` from ^1.44.0 to ^1.45.0

## [0.3.2] - 2026-02-27

### Fixed

- Release channel topic now includes `HUB_MODE` in the topic string for proper channel routing

## [0.3.1] - 2026-02-26

### Changed

- Updated config schema to support multiple environments (`staging` / `production`) for `auth` and `hub` sections
- `getSession()` now accepts a `deployment` parameter (`"staging"` | `"production"`) to select environment-specific credentials
- Plugin creation auto-detects deployment environment from `HUB_WS_URL` (production if contains `atomemo.ai`, otherwise staging)
- Updated default OneAuth endpoint from `oneauth.choiceform.io` to `oneauth.atomemo.ai`

## [0.3.0] - 2026-02-26

### Fixed

- In debug mode, user info is now fetched from the live session (via `getSession()`) instead of reading from `definition.json`
- In release mode, `definition.json` parsing errors now display prettier Zod error messages

## [0.2.14] - 2026-02-26

### Changed

- Removed organization constraints: plugin system no longer depends on organization ID
- Updated dependencies:
  - `phoenix` from ^1.8.3 to ^1.8.4
  - `@biomejs/biome` from ^2.3.15 to ^2.4.4

## [0.2.13] - 2026-02-14

### Changed

- Updated dev dependencies:
  - `@biomejs/biome` from ^2.3.14 to ^2.3.15
  - `dotenv` from ^17.2.4 to ^17.3.1
- Updated `SessionSchema` to make `id` required and `ipAddress`/`userAgent` nullish
- Updated `UserSchema`:
  - Made `id` and `role` required fields
  - Made `image` nullish instead of optional
  - Added `referralCode` as required field
  - Added `referredBy` as optional field
  - Changed `metadata` to use `z.record(z.string(), z.any())`

## [0.2.12] - 2026-02-14

### Changed

- Updated `@choiceopen/atomemo-plugin-schema` from ^0.2.14 to ^0.2.15

## [0.2.11] - 2026-02-14

### Changed

- Updated `@choiceopen/atomemo-plugin-schema` from ^0.2.13 to ^0.2.14

## [0.2.10] - 2026-02-14

### Changed

- Updated `@choiceopen/atomemo-plugin-schema` from ^0.2.12 to ^0.2.13

## [0.2.9] - 2026-02-13

### Changed

- Updated `@choiceopen/atomemo-plugin-schema` from ^0.2.11 to ^0.2.12
- Updated `ToolInvokeMessage` to accept any type for credentials (changed from `z.record(z.string(), z.string())` to `z.record(z.string(), z.any())`)

## [0.2.8] - 2026-02-12

### Changed

- Updated `@choiceopen/atomemo-plugin-schema` from ^0.2.10 to ^0.2.11
- Updated `CredentialAuthenticateMessage` to accept any type for credentials
- Added method wrappers for asynchronous implementation of credential authentication and tool invocation, improving handling of these operations

## [0.2.7] - 2026-02-12

### Changed

- Updated `@choiceopen/atomemo-plugin-schema` from ^0.2.9 to ^0.2.10

## [0.2.6] - 2026-02-12

### Changed

- Updated `@choiceopen/atomemo-plugin-schema` from ^0.2.8 to ^0.2.9

## [0.2.5] - 2026-02-11

### Changed

- Updated `@choiceopen/atomemo-plugin-schema` from ^0.2.7 to ^0.2.8

## [0.2.4] - 2026-02-11

### Fixed

- Updated event response names for credential authentication:
  - Renamed `credential_authenticate_response` to `credential_auth_spec_response`
  - Renamed `credential_authenticate_error` to `credential_auth_spec_error`

## [0.2.3] - 2026-02-11

### Fixed

- Renamed event listener for credential authentication from `credential_authenticate` to `credential_auth_spec`

## [0.2.2] - 2026-02-11

### Changed

- Updated `@choiceopen/atomemo-plugin-schema` from ^0.2.3 to ^0.2.7
- Updated `@types/bun` to ^1.3.9
- Disabled development exports in tsdown configuration

### Fixed

- Added nil check for the authenticate method in credential authentication process

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

[Unreleased]: https://github.com/choice-open/atomemo-plugin-sdk-js/compare/v0.6.0...HEAD
[0.6.0]: https://github.com/choice-open/atomemo-plugin-sdk-js/compare/v0.5.4...v0.6.0
[0.5.4]: https://github.com/choice-open/atomemo-plugin-sdk-js/compare/v0.5.3...v0.5.4
[0.5.3]: https://github.com/choice-open/atomemo-plugin-sdk-js/compare/v0.5.2...v0.5.3
[0.5.2]: https://github.com/choice-open/atomemo-plugin-sdk-js/compare/v0.5.1...v0.5.2
[0.5.1]: https://github.com/choice-open/atomemo-plugin-sdk-js/compare/v0.5.0...v0.5.1
[0.5.0]: https://github.com/choice-open/atomemo-plugin-sdk-js/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/choice-open/atomemo-plugin-sdk-js/compare/v0.3.5...v0.4.0
[0.3.5]: https://github.com/choice-open/atomemo-plugin-sdk-js/compare/v0.3.4...v0.3.5
[0.3.4]: https://github.com/choice-open/atomemo-plugin-sdk-js/compare/v0.3.3...v0.3.4
[0.3.3]: https://github.com/choice-open/atomemo-plugin-sdk-js/compare/v0.3.2...v0.3.3
[0.3.2]: https://github.com/choice-open/atomemo-plugin-sdk-js/compare/v0.3.1...v0.3.2
[0.3.1]: https://github.com/choice-open/atomemo-plugin-sdk-js/compare/v0.3.0...v0.3.1
[0.3.0]: https://github.com/choice-open/atomemo-plugin-sdk-js/compare/v0.2.14...v0.3.0
[0.2.14]: https://github.com/choice-open/atomemo-plugin-sdk-js/compare/v0.2.13...v0.2.14
[0.2.13]: https://github.com/choice-open/atomemo-plugin-sdk-js/compare/v0.2.12...v0.2.13
[0.2.12]: https://github.com/choice-open/atomemo-plugin-sdk-js/compare/v0.2.11...v0.2.12
[0.2.11]: https://github.com/choice-open/atomemo-plugin-sdk-js/compare/v0.2.10...v0.2.11
[0.2.10]: https://github.com/choice-open/atomemo-plugin-sdk-js/compare/v0.2.9...v0.2.10
[0.2.9]: https://github.com/choice-open/atomemo-plugin-sdk-js/compare/v0.2.8...v0.2.9
[0.2.8]: https://github.com/choice-open/atomemo-plugin-sdk-js/compare/v0.2.7...v0.2.8
[0.2.7]: https://github.com/choice-open/atomemo-plugin-sdk-js/compare/v0.2.6...v0.2.7
[0.2.6]: https://github.com/choice-open/atomemo-plugin-sdk-js/compare/v0.2.5...v0.2.6
[0.2.5]: https://github.com/choice-open/atomemo-plugin-sdk-js/compare/v0.2.4...v0.2.5
[0.2.4]: https://github.com/choice-open/atomemo-plugin-sdk-js/compare/v0.2.3...v0.2.4
[0.2.3]: https://github.com/choice-open/atomemo-plugin-sdk-js/compare/v0.2.2...v0.2.3
[0.2.2]: https://github.com/choice-open/atomemo-plugin-sdk-js/compare/v0.2.1...v0.2.2
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
