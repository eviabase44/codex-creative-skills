# Provenance and validation

Inspected in After Effects 2026 on 2026-09-30. The original user file was already open with unsaved changes. Inspection used that live state; it was saved separately as Approved-current-state.aep. A byte-for-byte copy of the on-disk original is retained separately. The user's source AEP and original present-flow repository were not overwritten.

## Evidence

- 14 approved compositions; 21 compositions including precomp dependencies.
- 397 extracted expression bindings, deduplicated to 311 exact JavaScript source files.
- 36 file-backed footage references: all copied and relinked inside approved/media after the user supplied two local textures.
- 42 quarter-resolution still previews: three samples per approved comp, at 15%, 50% and 85% of its work area, clamped to the comp end.
- Contact sheet visually inspected for general content/layout; these are sampled references, not a full motion regression.
- Integrity checks cover catalog membership, source hashes and media existence/hashes.
- Source repository commit is recorded in approved/extracted/legacy-origin.json. Its source files were copied to legacy without importing its Git history.

## Known limitations

Eight disabled Position expressions in the title-only variant call the missing offsetAuthored function. The inspection recorded three samples per property. One Opening 2 layer has a partial general-property dump due to a traversal exception. These nine distinct findings are preserved in issues.json. Explicit effect controls were also extracted separately.

The JSON is not a full-fidelity AEP format: not all shape data, effect internals, markers, interpolation metadata or rendering settings are serialized. The AEP remains authoritative. Original JSX generation history cannot be inferred solely from expressions.

Control values in the inventory are pre-expression values at the composition start. An expression-driven readout can show underlying zero while evaluating to a different number. Per-comp guides label the mode accordingly. Text sample values include hidden/probe layers and may differ from evaluated visible text.

## Recheck

From the Copycat v3 skill root, run `python3 scripts/present_flow.py verify` for integrity. `--strict` intentionally fails while known inspection issues remain; do not disguise that failure as a clean technical sign-off. New visual changes need expression checks across their full active time range and an AE motion preview review.

## Legacy test run

Six archived kit suites completed successfully: rulecheck 14, buildtest 111, lint 84, revealtest 178, objecttest 64, reveallint 210 passed checks. These 661 checks validate the legacy scripts/stubs, not the newly collected AEP. Results: approved/extracted/legacy-test-results.json.
