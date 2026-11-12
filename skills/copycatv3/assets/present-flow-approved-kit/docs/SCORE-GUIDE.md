# Score authoring guide

A score is written choreography, not code and not just a list of timestamps.

For each shot specify:
- Design source and frame; composition dimensions, frame rate and duration.
- Cast: words, rows, cards, attached decorations; what must remain together.
- Reference pose: what matches the design and when that pose is meaningful.
- Entrance: order, origin/path, visibility behavior and first visible pose.
- Moving hold: true rest, stepped variation, wiggle or continuing travel.
- Finish: settle, pullback, full exit, or continued scene; never invent an exit.
- Timing: phase start/duration, permitted overlap, cadence and whether it is tied to score time or real frames.
- Controls: independently keyframed actions, constants, content fields and readouts.
- Constraints: upright orientation, editability, clipping, permitted overlap and layout fidelity.
- Acceptance: frames/transitions to compare and changes the user has specifically approved.

## Approved scene examples

SH33: headline words enter from their own offsets, traverse discrete tail positions, hold at home, then exit using configured directions and order. Surrounding metadata/signal/code/portrait follow their own offsets relative to the shared score. Its snapshot runs at 60 fps; do not reuse its frame counts as 24-fps durations.

SH22: assets reveal while their home arrangement orbits around the shared elliptical center. Rotation, appearance and pullback are independent. Wiggle is sampled on the same staggered held clock as the main motion. Finish with an inward contraction and wider view, not disappearance. Its current manually adjusted keys are authoritative; use the comp-specific guide.

Text/title: select progressive reveal, phased seed/handoff assembly, or per-word offsets according to the score. They are different families, not merely presets with interchangeable parameter names.

## Approval record

Keep user-approved visual behavior separate from technical status. Record the source comp ID/name, actual parameter snapshot, known errors, and what was inspected. A script compiling successfully is not visual approval.
