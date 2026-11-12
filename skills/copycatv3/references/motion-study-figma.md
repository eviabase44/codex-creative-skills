# Figma → Copycat → Motion Study → Codex

This route follows the user's 12 October 2026 change. Fixed generated artwork and native editable design layers replace independent per-frame redraws. All new content is still recreated; source pixels remain comparison evidence only.

## Design and storage

Read the applicable Figma creation/use/design skills before tool calls. Reuse the task's Figma file or create one when the user requests this workflow. Build a named page for each source sequence with start, end, relevant intermediate states and reusable components. Keep type editable and each independently moving item on a separate layer. A screenshot pasted in a Figma frame is not an editable UI reconstruction.

Keep image identity stable: generate photographic/product art once, store each asset separately and reuse it. Carry the new context into opening objects, thumbnails, small labels and interaction states, not only the hero headline. Use the same selected app design across all views.

Record the file key/URL, page name, start/end/state node IDs, design version and layer-export hashes. Put direct Figma links on the review page and in the handoff. Save useful endpoint previews locally. Export native transparency; inspect exports before animation because a download/export route can introduce an opaque matte.

## Motion learning

Probe actual source timestamps and native cadence. Inspect native frames around every event before reducing to 12 fps. For exact 24 fps sources, a 12 fps interval starting at native frame 528 selects 528, 530, …; do not floor approximate decimal times and accidentally select the preceding frame. For variable or non-integral cadence use the actual presentation timestamps and document quantization.

Track camera/viewport, page scroll, individual objects, cursor and layered reveals separately. For each record measured position, dimensions/scale, orientation and depth evidence, opacity/colour, clipping, layer order, onset, holds and disappearance. Preserve events occurring between output samples in the native map. Later frames help resolve movement direction and occlusion; they do not justify invented intermediate actions.

Keep measured values separate from inferred values and manual estimates. Use multiple intermediate poses to check fitted paths. Endpoint interpolation alone cannot recover card trails, overshoots, turns, reveal order or nested motion.

## Motion Study validation

If a Motion Study skill and audited source study are installed or supplied, read their applicable source-specific guidance and later corrections. They are optional external resources, not included in this three-skill repository. Without them, use the measurement and validation procedure in this file and the portable workflow notes, and state that no external Motion Study audit was applied. A measured specification is not a validated renderer. Preserve the active brief over historical defaults.

The user's approved Present Flow kit is now bundled with Copycatv3. For text reveals, phased titles, authored word offsets and elliptical collages, read [Present Flow](present-flow.md) during this validation step. Select a matching approved comp, retain exact controls/expressions and native clock semantics, and obtain evaluated motion evidence before porting to Codex. Its authored AEP behavior takes precedence over generic older summaries for that mechanism. Keep unrelated source-specific motion authoritative. The bridge excludes the broken title and flags incomplete extraction; neither package checks nor still previews certify motion fidelity.

Validate viewport stability, independent paths, event count/order, holds, occlusion and joins before rendering. Fitted easing is specific to its measured interval, not a universal Base44 curve. Distinguish flat translation from rotation in depth. For 3D changes use appropriate geometry or designed additional views; a width-scaled flat sprite remains an approximation and cannot be reported as faithful 3D motion.

## Animate and review

### Mixed-media trails and title material

1. Build an ordered native-frame contact sheet of every image appearance. Record source time, medium, crop, orientation, treatment and whether it repeats an earlier asset. Inspect full-resolution source details; thumbnails often conceal posters and maps among photographs. Partly occluded source content stays an observed fragment, not a claimed complete design.
2. Adapt each appearance to the new context while preserving its visual role and composition. Keep graphic design as graphic design. Build editable posters, maps and illustrations in Figma when appropriate; generate new photographic assets. Match direct-flash, monochrome or print treatments where the source calls for them, while keeping the selected app design consistent.
3. Address assets by source appearance ID. Never use modulo cycling through an arbitrary photo collection unless the source itself repeats that pattern. Keep the original layer order, source-time births and disappearance. Save a source-to-replacement manifest.
4. Inspect typography separately at native resolution. Record type shape, weight, tracking, line spacing, scale, edge quality and internal material. Generate a new ink/print texture when needed; clip it inside native editable letters using image fills or equivalent layers. Keep the texture in local letter coordinates and export it once. Do not regenerate noise each frame or distress unrelated clean typography. Grain density statistics can support a comparison but do not certify visual fidelity.
5. Review the full moving comparison plus stills at each graphic change. Export detail comparisons without stretching either crop. Verify that Figma instances scale their contents with the frame and that SVG patterns survive import; missing grid/dot details require native vectors or a supported asset representation.

### Object-turn sequences

The user added this approach on 12 October 2026: create an image sequence per object to give an illusion of 3D rotation, then run it at the proper place in the animation. This is a supported extension of fixed-artwork animation, not a return to redrawing the whole scene.

1. Inspect that object's complete source movement and decide which front, side and rear views are needed. Separate the local turn from translation/page scroll. Describe estimated angles as estimates; a prompt angle is not evidence that the generator produced that exact angle.
2. Generate a transparent multi-view sequence from the established object reference. Keep identity, camera, physical size, pivot and world-space light consistent. New visible surfaces, depth and occlusion must change. For a sprite sheet, specify its cell grid and reading order; reject merged cells, missing poses, visible dividers, halos or cropped silhouettes.
3. Slice cells mechanically, retaining original generator files, prompts and transparency. Register the pivot and apply only documented uniform scale corrections for accidental size drift. Never fit each pose independently to the same width: doing so destroys the intended perspective change. Use image generation for visual repairs.
4. Put each sequence in its own layer. Map pose indices to source time, then apply measured translation, scale, clipping and layer order. Reuse a pose for a source hold. Avoid arbitrary loop playback, blended adjacent views or motion blur in the actual reference reconstruction.
5. Save the object sheets and pose map with the Figma shot assets and export handoff. Review both isolated turn playback and the in-context shot: a clean object turn can still be mistimed or misplaced. Check texture/shape drift, pivot jumps, direction and disappearance. Call the result an image-based depth illusion, not recovered 3D geometry.

Export the actual Figma design layers and fixed artwork. Animate in Codex using the validated source-time map. Render 12 distinct timeline samples each second without changing elapsed time, adding motion blur, optical flow, blended frames or extra effects. Native text/UI is allowed because the user authorized it. Never use the source beneath replacements.

Inspect moving playback and every output frame. Check visual identity separately from motion: eliminating redraw jitter does not establish trajectory fidelity. A static-region metric can support a specific stability observation but is not an overall fidelity score. Keep technical checks, visual defects and user approval separate.

Show source left/recreation right at equal size, with linked Figma states and exact frame stepping. Keep earlier tests identifiable. Ask for the requested comparison approval only after the concrete result and remaining differences are visible. Record the exact media hash; keep other per-video sequences and the final film pending until genuinely complete.
