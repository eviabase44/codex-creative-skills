# Control contracts

## Classify before building

- **Keyframed driver:** an independent authored action, such as reveal, rotation or pullback. Document units, domain, keyframes, interpolation and who owns it.
- **Expression-driven driver:** derived from time, markers or another controller. Do not add keys unless deliberately changing the contract.
- **Constant setting:** geometry, hold cadence, typography, order seed, amplitude or other configuration. Some older families intentionally retime cadence with the score.
- **Derived readout:** `[OUT]` diagnostics such as total duration or overflow. It is not a user-authored parameter.
- **Content field:** source text, asset replacement, color or design input. Content is not motion progress.

The approved catalog lists actual modes per property. When both keys and an active expression exist, the expression is authoritative unless it reads `value`; inspect the expression before editing.

## Timing vocabulary

Use explicit units. Distinguish composition seconds, composition frames, normalized progress, score-relative frames, degrees, pixels and percent. Preserve subframe keyframe times during round trips. Do not silently snap them to frame boundaries.

For new compositions, separate sample hold duration from a hold-at-home duration and from phase scheduling. A family adapter must say whether changing total duration changes the cadence. Do not rewrite legacy behavior as part of documentation.

## Control budget

One control per independently directed action, not one control per layer. Share a driver when elements should remain choreographically coupled. Separate actions that the score needs to retime independently. Add per-element settings only when required by the score or useful for art direction.

Minimum handoff: controller location, editable source location, keyframed-vs-constant classification, ranges/clamping behavior, units and a preview. Never describe an expression-driven underlying value as its evaluated output.
