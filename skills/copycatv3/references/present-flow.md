# Present Flow in the Motion Study layer

Imported from the user's `present-flow-approved-kit.zip` on 14 October 2026. This adds authored motion evidence to Copycatv3; it is not a replacement for source measurement, a generalized AE builder, or a verified Codex renderer.

## Use and authority

Use this layer when selecting or reproducing typography, title assembly, word offsets, or collage choreography. First identify the mechanism actually present in the selected source. For an original spot, choose a family that serves the shot's story. If no family fits, retain source-specific measurement; do not force a kit preset onto unrelated UI, camera or character motion.

The portable kit is at `assets/present-flow-approved-kit/`, relative to the skill root. Start with its `docs/MOTION-SYSTEM.md`, `docs/CONTROLS.md` and the chosen `docs/rigs/<comp-id>-*.md`. Load only relevant expressions through `approved/extracted/expression-index.json`.

The current brief and recorded user changes govern the work. For a selected kit composition, the approved AEP and exact authored expressions/controls supersede older Motion Study summaries and historical builders. For a different source video, its measured behavior remains authoritative: the kit offers a candidate mechanism, not permission to alter that video. Keep later Motion Study audit corrections for evidence quality, sampling, text fit and format adaptation.

The bundle preserves all 14 approved entries, 21 compositions with dependencies, 397 expression bindings, 311 unique expression files, 36 media files, 42 still previews and three project snapshots. Content hashes are in `integration-manifest.json`. The author has authorized this public skill package. The assets remain source/reference material; create replacement story assets under Copycatv3. Inclusion does not grant a blanket license over third-party imagery, fonts or branding.

## Select the right family

| Family | Composition IDs | Contract to retain |
|---|---|---|
| A: progressive text reveal | 6971, 6986, 7135, 6819, 6866 | Word/row units, keyed Progress, row geometry, pinning, reveal and highlight timing. Some authored Progress values exceed 100; do not clamp them globally. |
| B: phased title assembly | 7180, 7210, 6897 | Seed/handoff/fill order, phase scheduling separate from move duration, seeded ordering and deliberately offset origin. 6897 has an incomplete layer inspection. |
| C: authored word offsets | 638, 707, 7240, 7272, 82 | Separate home/layout/motion, per-word entry/exit vectors, tail poses, home dwell and exit order. Progress can be expression-driven. 707 is quarantined. |
| D: independent elliptical collage | 7052 | Separate rotation, appearance and pullback drivers; upright artwork; shared elliptical center; seeded wiggle sampled on the same held clock as all drivers. |

**Known limits:** exclude composition 707 (`...Title_Only_v01 2`) from production selection: eight disabled Position expressions call missing `offsetAuthored`. Composition 6897 (`Title_on_BG_02`) requires an AEP inspection of `Opening 2` before a complete contract can be exported. Keep both inspectable for diagnosis. Exclude SH20 arc experiments. No automatic repair or transfer of approval to repaired output.

## Run the bridge

From the skill root:

```sh
python3 scripts/present_flow.py verify
python3 scripts/present_flow.py list
python3 scripts/present_flow.py inspect 7052
python3 scripts/present_flow.py contract 7052 --output /absolute/task/work/shot/motion-contract.json
python3 scripts/present_flow.py sample-plan 7052 --output /absolute/task/work/shot/sample-plan.json
```

`verify` separates package integrity from the nine known inspection findings. `--strict` fails while those findings remain. `inspect` permits diagnosis; `contract` and `sample-plan` refuse quarantined/incomplete entries. A contract contains the exact property snapshots, parent/source relationships, dependencies, expression bindings/hashes and authored keys, including fractional key times. Underlying values are explicitly not evaluated expression outputs. The helper does not interpolate keys or execute expressions.

The sample plan preserves elapsed time and schedules 12 fps samples at source composition times. SH22's 2.1667-second comp yields 26 samples; it is a mechanism reference, not a qualifying three-second library sequence. Never pad or slow it to pretend it meets that requirement.

## Figma → motion contract → measured poses → Codex

1. Lock editable Figma start/end/intermediate states, content groups, clipping, parents and local pivots. Match a static reference pose before moving it. Preserve attached text/dots/art as authored units. Keep source content, layout, choreography and presentation separate.
2. Save a written shot score: chosen comp/family, Figma node-to-layer mapping, home pose, entrance order, moving hold, finish, independent drivers, units, cadence semantics and intended changes from the reference. Distinguish keyframed drivers, expression-driven values, constants, content and derived readouts. Record source dimensions/FPS as well as delivery FPS.
3. Inspect the exact relevant expressions and authored settings. SH22's approved settings include hold 4 native frames at 24 fps, per-element phase 13 frames, wiggle 35 px and pullback 26%. These are this snapshot's settings, not global brand defaults. Its intermediate rotation key is at 0.687255859375 s; preserve it. SH33 is 60 fps: 26 start frames mean 26/60 seconds, not 26/24 or 26/12. Its Duration control can stretch score beats; SH22's real-frame hold clock is separate from its driver duration.
4. Obtain evaluated behavior from a duplicate of `approved/project/Approved-packaged.aep` in a compatible AE installation, or from already validated time-indexed samples of that exact snapshot. Preserve originals. Sample key boundaries, neighboring native frames, phase changes, holds, layer visibility and the 12 fps delivery times. Extract required transform/driver values and interpolation metadata with provenance. The JSON lacks full interpolation, shape/effect and render data; never infer a generic ease between its keys. AE vector operators and seeded `wiggle` also cannot be assumed equivalent to plain JavaScript.
5. Implement only the required family behavior in Codex against those samples. Keep home/layout/motion distinct, share each value's owner, preserve layer parenting and stable seeds. For SH22, sample rotation, appearance, pullback and wiggle at the **same per-element held source time**. `sh22_held_time` in the helper reproduces that clock only; it does not evaluate the drivers, wiggle or resulting geometry. Do not replace depth turns with flat width scaling, or randomize the artwork every frame.
6. Validate the implementation against evaluated source poses at native timing and delivery samples: positions, scale, opacity, orientation, parent motion, clipping, event order and settle/hold/exit boundaries. Record measured errors and the shot's declared tolerances; do not invent one all-purpose fidelity score. Check text replacement for width/reflow and new formats for framing. Inspect the actual moving output as well as stills. State `unverified_port` until that comparison passes.

If AE/evaluated samples are unavailable, keep independent Figma/source-video work moving, and identify the missing behavior. A parameter extraction or passing integrity test must not be reported as a successful motion reconstruction. Do not silently substitute historical builders, browser previews or legacy test results as proof.

## Clarity and review

For the user's narrated how-to format, preserve the recent direction: one focal interface/change at a time, timed to the spoken instruction, with enough reading hold before advancing. Use Camera Language for motivated cut-ins and Eye Candy for story-led joins; the library does not require decorative motion on every step. Do not force side-by-side interfaces into the finished film. Source/recreation comparisons are diagnostic evidence; honor the requested review presentation separately from the finished edit.

Store family/comp ID, kit hash, exact control snapshot, Figma mapping, native/delivery time map, evaluated-sample provenance, known issues, port version and comparison observations with the production record. Keep source approval, package integrity, native-expression checks, Codex visual validation and user acceptance as separate statuses. No generation, audio, publishing or paid-run permission is implied by the kit.
