# Motion system — shared architecture, separate families

## Authority and scope

The 14 compositions under `01_Approved Comps` are the user's selected visual references. Their current expression source and authored controls take precedence over earlier chat defaults and legacy browser experiments. Folder approval does not erase existing technical defects. The SH20 arc experiments are excluded.

## Shared architectural principles

1. **Separate content, layout, choreography and presentation.** Source text/design must remain independent of its motion. `[SRC]`, `[TXT]`, `[POS]`, `[ORG]`, `[MEA]` and `[CTRL]` are recurring roles, not mandatory names for every future rig.
2. **Preserve the reference pose.** Conceptually, position is home + layout + motion. The orbit family uses a transformed home position instead of a simple additive offset. Avoid moving a baseline to hide a timing defect.
3. **Give shared values a shared owner.** If probe layers, text and handles must agree about size, leading or timing, they should read a common authority.
4. **Use authored motion units.** Text can be word/row based; collage assets can be whole card groups. Do not split an illustration or join words arbitrarily.
5. **Expose animation intent, not every implementation variable.** Drivers, constant configuration and readouts are different control classes.
6. **Make randomness repeatable.** Seeded order and positional wiggle must reproduce when scrubbing/rendering.
7. **Preserve the relationship between attached elements.** Parent card artwork, labels/dots and decorations deliberately; establish baseline parenting before enabling animated transforms.
8. **Test the actual AE output.** Browser previews and simulated AE test suites are useful but are not proof of visual correctness in AE.

## Family A — progressive text reveal

Examples: Text Temp 01, 02, 08; Title _with_Footage_Long_01 and Short_02.

A source text layer feeds visible animated text. Expressions normalize typed/pasted paragraph separators and strip zero-width characters, then build a word/row reveal. Controls live on `[TXT] Animated`, not necessarily a separate null. Progress is keyframed; placement, row offsets, overlaps, bottom pinning, highlight timing and posterization form the configuration.

Progress sometimes exceeds 100 in the approved files (for example 117 or 131). Preserve the family's semantics rather than universally clamping every driver to 0–100. Do not apply the orbit family's timing equation to this family.

## Family B — phased title assembly

Examples: Text Temp 10/11 and Title_on_BG_02.

Measured word geometry supports seed/handoff/fill roles. Title expressions separate scheduling from the duration of an individual move: a move can finish after the next phase begins. The later form exposes T Void, T Seed, T Rack, T Settle and T Fill; earlier variants expose different timing controls. Arrival ordering can use seeded farthest-first distribution.

Hold Frames and Tail A/B define stepped transitions. The origin is a deliberate offset from the text layout, not automatically the composition center. Preserve the family-specific home/layout separation and source row rules.

## Family C — authored word offsets and full-score surroundings

Examples: title-only references, Title_on_BG_03/04 and SH33.

Each word has an authored displacement relative to home, then steps through tail positions into its resting layout. Some variants support independent enter and exit offsets, reversed exit ordering and a true hold at home. SH33 additionally schedules signal, metadata, code and portrait surroundings.

Several Progress controls are **expression-driven** from Start/Duration, not manually keyed. A displayed underlying zero is not evidence that a comp has no animation. In native timing, holds are score beats; stretching Duration can stretch the actual time per beat. This differs from SH22's fixed real-frame sampling.

Do not impose the legacy browser score's axis-lock or hide-overlap policy on every AE variant. Offset builders and approved scene adaptations have different authored path and overlap behavior. The title-only `...v01 2` variant is quarantined from automatic template selection until its missing-function error is repaired and reapproved.

## Family D — independent-channel elliptical collage

Example: SH22 - INDEPENDENT SCORE v06.

Three separate drivers control orbit angle, sequential appearance and inward pullback. Orbit positions rotate around a shared center in normalized elliptical coordinates; artwork does not rotate with the orbit. Small seeded positional wiggle replaces drift.

For each element, quantize **real composition time** by constant Hold Duration and phase offset; sample all its drivers and wiggle at that same held time. Do not smooth the wiggle between holds. Do not introduce one-frame clock overrides to force a design pose.

Current approved settings differ from the earlier generated v06: rotation starts at -90°, has an intermediate key near 0.6873s, and reaches 0° near 1.9583s; wiggle amplitude is 35 px; pullback amount is 26%; phase increment is 13 frames, equivalent to 1 modulo the 4-frame hold. Pullback Progress has an authored key above 100; its expression clamps the effective value. See the exact per-comp guide, not the older v06 score, when reproducing it.

## Rules that are NOT universal

- Exactly one Progress slider: true of some families, deliberately false of SH22.
- Never keyframe Progress: appropriate for automatic-clock variants only.
- Every hold has the same meaning: false; distinguish sample hold, phase duration and resting dwell.
- Always use easing / always use stepped cuts: choose the approved family behavior.
- Always exit or always reverse the entrance: score-specific.
- Always prevent overlaps: not implemented as a universal scene constraint.
- Every Figma element must become native AE: editable text may be native while complex art remains exported imagery.
