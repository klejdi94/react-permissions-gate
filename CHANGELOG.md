# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.0.1] - 2026-01-30

### Fixed
- Dev panel override functionality now properly applies role, permission, and flag overrides
- Real-time updates when toggling overrides in dev panel

### Added
- Initial release of react-permissions-gate
- Core permission rule engine with sync/async support
- RBAC (Role-Based Access Control) support
- PBAC (Permission-Based Access Control) support
- ABAC (Attribute-Based Access Control) support
- Feature flags integration
- `PermissionsProvider` context provider
- `PermissionsRoot` wrapper with dev tools integration
- `PermissionsGate` component with hide/disable modes
- `usePermission` hook for programmatic checks
- `Permissioned` render-prop component
- `ProtectedRoute` component for route protection
- Dev Tools Panel with live permission tracking
- Permission override capabilities in dev mode
- Full TypeScript support with generics
- Tree-shakeable architecture
- Framework-agnostic design
- Comprehensive documentation and examples

### Features
- Hide or disable UI elements based on permissions
- Multiple permission checks with ANY/ALL logic
- Resource-based permission evaluation
- Inline permission rule functions
- Real-time permission debugging panel
- Context override for testing scenarios
- Zero-configuration dev tools in development
- Production-ready with minimal bundle size

## [Unreleased]

### Planned
- Permission caching layer
- SSR/SSG support improvements
- React Native compatibility
- Additional framework integrations
- Performance optimizations
- Extended dev panel features
