# Changelog: StadiumFlow Intel

All notable tactical upgrades to the StadiumFlow mesh will be documented in this log.

## [3.2.0] - 2026-04-17
### Added
- **Automated Test Suite**: Integrated Vitest for regression testing of AI agents.
- **Repository Maturity**: Added `SECURITY.md`, `CONTRIBUTING.md`, and `CHANGELOG.md`.
- **Refined UI**: Implemented `tactical-row` pattern for improved data scannability.
- **Strategic Evaluation**: Added unit test for `StadiumAgents` logic.

### Changed
- **Architecture**: Normalized into a Pure SPA (Single Page Application).
- **Modularity**: Extracted `FanView` and `StaffView` into dedicated component modules.

## [3.1.0] - 2026-04-17
### Added
- **Gemini 3.1 Pro Integration**: High-reasoning tactical evaluation for venue staff.
- **Protocol Delta**: Emergent high-alert state for stadium coordination.
- **Search Grounding**: Live venue facility updates via Google Search.

### Fixed
- **Cloud Run Publish**: Corrected Port 3000 and 0.0.0.0 host binding for production stability.
- **Theme Propagation**: Resolved prop-drilling issue in staff command console.
