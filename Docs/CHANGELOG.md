# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

### Added

- Initial project setup with rules framework
- Created Rules/PROJECT_RULES.md with project guidelines
- Defined technology stack (Next.js, App Kit SDK, Supabase)
- Defined development roadmap (5 phases)
- Created BUILD_PLAN.md with detailed task breakdown
- Created Next.js 14 project structure with TypeScript + Tailwind CSS
- Added Arc Testnet chain configuration (chain ID: 421614)
- Created wagmi config with Arc, Sepolia, Mainnet, Polygon, Arbitrum support
- Added App Kit SDK config with supported tokens (USDC, EURC, ETH)
- Created UI components: Button, Input, Card, Badge
- Created Navbar and WalletModal components
- Created Swap page with TokenBox and TokenSelector
- Created Zustand store for app state management
- Created useSwap hook for swap logic
- **Phase 1.2: Wallet Connection**
  - Created useWallet hook with wallet operations
  - Created NetworkSwitcher component for chain switching
  - Created Landing page with hero, features, ticker sections (based on index.html)
  - Added lucide-react for icons
  - Updated Navbar with NetworkSwitcher integration
  - **Added effects components:**
    - CursorEffects component with custom cursor and ring
    - CanvasBackground component with nodes animation
    - Updated globals.css with all design variables and animations
    - Updated layout.tsx with effects components
    - NavScrollEffect for navbar scrolled state
    - StatCounter component for animated number counting
    - Toast system with ToastProvider and useToast hook
    - Updated Providers with ToastProvider

### Changed

- Updated PROJECT_STATE.md with project status
- Updated SYSTEM_KNOWLEDGE.md with business flows
- Updated package.json with all required dependencies (lucide-react added)

### Fixed

- N/A

### Removed

- N/A

---

## Version History

| Version | Date | Description |
|---------|------|-------------|
| v0.0.1 | 2026-05-31 | Initial rules setup and documentation |
| v0.0.0 | 2026-05-31 | Project concept - ARCquick DEX on Arc Network |
