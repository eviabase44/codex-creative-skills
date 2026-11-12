# Present Flow reference kit

This public skill bundle preserves 14 approved composition entries, their dependencies, exact expressions, collected media, 42 still previews and three native After Effects snapshots. The approved catalog controls selection; unrelated items inside an AEP are not approved templates.

Read `docs/KNOWN-ISSUES.md`, `docs/MOTION-SYSTEM.md`, `docs/CONTROLS.md` and the selected `docs/rigs/` guide. The extracted JSON is evidence, not a full serializer or a validated renderer.

Use `approved/project/Approved-packaged.aep` for native inspection on a duplicate. Original/current-state snapshots remain byte-for-byte provenance records. Native files may retain historic source paths; relink media to `approved/media/` on the receiving machine. Fonts are listed in `docs/FONTS.md` and are not bundled.

Run `python3 scripts/present_flow.py verify` from the Copycat v3 skill root. `--strict` also reports the nine preserved inspection findings and intentionally fails until resolved. A package integrity pass does not certify visual fidelity.

The legacy browser studio, historical builders and standalone package tests referenced in older handoff notes are not bundled. Use the skill's bridge and regression tests. Public packaging removes logs and replaces host paths in extracted JSON with portable paths; `integration-manifest.json` records the distributed hashes. Native projects and expression sources are unchanged.

Publication of this skill was authorized by its owner. Reference artwork, fonts, trademarks and other third-party material retain their existing rights; no blanket media redistribution license is granted.
